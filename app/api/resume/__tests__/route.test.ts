import { afterEach, describe, expect, it, mock } from "bun:test";
import { POST } from "../route";

const resumeEnv = {
  GEMINI_API_KEY: "test-gemini-key",
  REMINDER_API_TOKEN: "test-token",
  AWS_REGION: "test-region",
  AWS_ACCESS_KEY_ID: "test-access-key",
  AWS_SECRET_ACCESS_KEY: "test-secret",
  AWS_BUCKET_NAME: "test-bucket",
  RESUME_SERVER_URL: "https://resume.example.com",
  RESUME_API_KEY: "resume-api-key",
};

mock.module("@/app/env/server", () => ({
  envServer: resumeEnv,
}));

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/resume", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

afterEach(() => {
  mock.restore();
});

describe("POST /api/resume", () => {
  it("returns 400 when jobDescription is missing", async () => {
    const response = await POST(makeRequest({ jobDescription: "   " }) as never);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "jobDescription is required" });
  });

  it("forwards resume server headers on success", async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response("docx-content", {
          status: 201,
          headers: {
            "Content-Type": "application/custom-docx",
            "Content-Disposition": 'attachment; filename="custom.docx"',
          },
        }),
      ),
    );
    globalThis.fetch = fetchMock as never;

    const response = await POST(makeRequest({ jobDescription: "Build APIs" }) as never);

    expect(response.status).toBe(201);
    expect(response.headers.get("Content-Type")).toBe("application/custom-docx");
    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="custom.docx"');
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("docx-content");
    expect(fetchMock).toHaveBeenCalledWith("https://resume.example.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "resume-api-key",
      },
      body: JSON.stringify({ jobDescription: "Build APIs" }),
      signal: expect.any(AbortSignal),
    });
  });

  it("returns 502 when the resume server rejects the request", async () => {
    globalThis.fetch = mock(() => Promise.resolve(new Response("bad upstream", { status: 503 }))) as never;

    const response = await POST(makeRequest({ jobDescription: "Build APIs" }) as never);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "bad upstream" });
  });

  it("returns 502 when the resume server returns an empty body", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(null, {
          status: 200,
        }),
      ),
    ) as never;

    const response = await POST(makeRequest({ jobDescription: "Build APIs" }) as never);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Resume server returned an empty response" });
  });

  it("returns 504 when the upstream request times out", async () => {
    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;

    globalThis.setTimeout = ((callback: TimerHandler) => {
      if (typeof callback === "function") {
        callback();
      }

      return 1 as never;
    }) as typeof setTimeout;
    globalThis.clearTimeout = (() => undefined) as typeof clearTimeout;
    globalThis.fetch = mock((_url: string, init?: RequestInit) => {
      if (init?.signal?.aborted) {
        return Promise.reject(new DOMException("Aborted", "AbortError"));
      }

      return Promise.resolve(new Response("unexpected"));
    }) as never;

    try {
      const response = await POST(makeRequest({ jobDescription: "Build APIs" }) as never);

      expect(response.status).toBe(504);
      expect(await response.json()).toEqual({ error: "Resume generation timed out" });
    } finally {
      globalThis.setTimeout = originalSetTimeout;
      globalThis.clearTimeout = originalClearTimeout;
    }
  });
});
