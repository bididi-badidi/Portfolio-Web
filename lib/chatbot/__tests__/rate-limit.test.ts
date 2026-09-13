import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { POST as chatbot } from "@/app/api/chatbot/route";
import { POST as concierge } from "@/app/api/concierge/route";

const REDIS_URL = "https://rate-limit.example.test";
const OPENAI_URL = "https://api.openai.com/v1/responses";
const limitedEnvironment = {
  UPSTASH_REDIS_REST_URL: REDIS_URL,
  UPSTASH_REDIS_REST_TOKEN: "test-token",
  CHATBOT_RATE_LIMIT_PER_IP_MAX: "1",
  CHATBOT_RATE_LIMIT_WINDOW_SECONDS: "60",
  CHATBOT_DAILY_REQUEST_MAX: "100",
  CHATBOT_RATE_LIMIT_KEY_PREFIX: "test:chatbot",
};
const originalEnvironment = Object.fromEntries(
  Object.keys(limitedEnvironment).map(key => [key, process.env[key]]),
);
const originalFetch = globalThis.fetch;
const fetchMock = mock<typeof fetch>();

const answer = {
  status: "completed",
  output: [{ type: "message", content: [{ type: "output_text", text: "Hello." }] }],
};
const request = (ip: string) => new Request("http://localhost/api/chatbot", {
  method: "POST",
  headers: { "x-forwarded-for": ip },
  body: JSON.stringify({
    chatHistory: [{ role: "user", message: "Hello" }],
    enableFunctionCalling: false,
  }),
});

beforeEach(() => {
  Object.assign(process.env, limitedEnvironment);
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as typeof fetch;
});

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  globalThis.fetch = originalFetch;
});

describe("chatbot request limits", () => {
  test("blocks an IP after its configured fixed-window allowance", async () => {
    const quotaResults = [
      [1, "ok", 1, 1, 60],
      [0, "ip", 2, 0, 59],
    ];
    fetchMock.mockImplementation(async input => {
      const url = String(input);
      if (url === REDIS_URL) return Response.json({ result: quotaResults.shift() });
      if (url === OPENAI_URL) return Response.json(answer);
      throw new Error(`Unexpected request to ${url}`);
    });

    expect((await chatbot(request("203.0.113.10"))).status).toBe(200);
    const blocked = await chatbot(request("203.0.113.10"));

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBe("59");
    expect(await blocked.json()).toEqual({
      message: "Rate limit reached. You can send another question when the timer resets.",
      error: true,
    });
    expect(fetchMock.mock.calls.filter(([url]) => String(url) === OPENAI_URL)).toHaveLength(1);
    const redisCommand = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(redisCommand.slice(0, 3)).toEqual(["EVAL", expect.any(String), 2]);
    expect(redisCommand.slice(5, 8)).toEqual([1, 100, 60]);
    expect(redisCommand[3]).toStartWith("test:chatbot:ip:");
    expect(JSON.stringify(redisCommand)).not.toContain("203.0.113.10");
  });

  test("blocks different IPs after the configured global daily allowance", async () => {
    process.env.CHATBOT_RATE_LIMIT_PER_IP_MAX = "100";
    process.env.CHATBOT_DAILY_REQUEST_MAX = "1";
    const quotaResults = [
      [1, "ok", 1, 1, 0],
      [0, "daily", 1, 2, 43_210],
    ];
    fetchMock.mockImplementation(async input => {
      const url = String(input);
      if (url === REDIS_URL) return Response.json({ result: quotaResults.shift() });
      if (url === OPENAI_URL) return Response.json(answer);
      throw new Error(`Unexpected request to ${url}`);
    });

    expect((await chatbot(request("203.0.113.10"))).status).toBe(200);
    const blocked = await chatbot(request("198.51.100.20"));

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBe("43210");
    expect(await blocked.json()).toEqual({
      message: "Daily request limit reached. The portfolio assistant will be available again after the reset.",
      error: true,
    });
    expect(fetchMock.mock.calls.filter(([url]) => String(url) === OPENAI_URL)).toHaveLength(1);
  });

  test("fails closed when the shared quota store is unavailable", async () => {
    fetchMock.mockImplementation(async input => {
      const url = String(input);
      if (url === REDIS_URL) return new Response(null, { status: 503 });
      if (url === OPENAI_URL) return Response.json(answer);
      throw new Error(`Unexpected request to ${url}`);
    });

    const response = await chatbot(request("203.0.113.10"));

    expect(response.status).toBe(503);
    expect(fetchMock.mock.calls.filter(([url]) => String(url) === OPENAI_URL)).toHaveLength(0);
  });

  test("does not spend quota on a request rejected by input validation", async () => {
    const invalid = new Request("http://localhost/api/chatbot", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.10" },
      body: JSON.stringify({ chatHistory: [] }),
    });

    expect((await chatbot(invalid)).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("does not apply the production limiter to the preview concierge", async () => {
    fetchMock.mockImplementation(async input => {
      const url = String(input);
      if (url === OPENAI_URL) return Response.json(answer);
      throw new Error(`Unexpected request to ${url}`);
    });
    const previewRequest = new Request("http://localhost/api/concierge", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.10" },
      body: JSON.stringify({ messages: [{ role: "user", message: "Hello" }] }),
    });

    expect((await concierge(previewRequest)).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe(OPENAI_URL);
  });
});
