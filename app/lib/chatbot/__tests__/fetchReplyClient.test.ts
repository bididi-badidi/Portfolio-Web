import { afterEach, expect, mock, test } from "bun:test";
import { fetchChatbotReplyClient } from "../fetchReplyClient";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("returns the rate-limit message and retry delay from a 429 response", async () => {
  globalThis.fetch = mock(async () => Response.json(
    { message: "Rate limit reached. You can send another question when the timer resets.", error: true },
    { status: 429, headers: { "Retry-After": "59" } },
  )) as typeof fetch;

  const earliestReset = Date.now() + 59_000;
  const reply = await fetchChatbotReplyClient({
    chatHistory: [{ id: "1", role: "user", message: "Hello" }],
    enableFunctionCalling: false,
  });

  expect(reply).toEqual({
    message: "Rate limit reached. You can send another question when the timer resets.",
    error: true,
    retryAfterSeconds: 59,
    rateLimitResetAt: expect.any(Number),
  });
  expect(reply.rateLimitResetAt).toBeGreaterThanOrEqual(earliestReset);
  expect(reply.rateLimitResetAt).toBeLessThanOrEqual(Date.now() + 59_000);
});
