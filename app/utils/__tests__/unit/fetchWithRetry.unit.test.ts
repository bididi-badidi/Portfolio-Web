/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { fetchWithRetry } from "../../fetchWithRetry";
import { TEST_CONFIG } from "@/app/test/testConfig";

// bun-test-setup no longer mocks @/app/utils/fetchWithRetry globally, so this
// test file imports and exercises the real implementation. All network calls are
// intercepted by replacing globalThis.fetch.

describe("fetchWithRetry", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function makeResponse(status: number, body: unknown): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: String(status),
      json: async () => body,
    } as unknown as Response;
  }

  it("should return parsed JSON on a successful 200 response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(makeResponse(200, { data: "hello" }))
    ) as any;

    const result = await fetchWithRetry("https://example.com");
    expect(result.response).toEqual({ data: "hello" });
    expect(result.errMsg).toBeNull();
  });

  it("should fast-fail on 4xx without retrying", async () => {
    const mockFetch = mock(() => Promise.resolve(makeResponse(400, {})));
    globalThis.fetch = mockFetch as any;

    const result = await fetchWithRetry("https://example.com", undefined, 3, 0);
    expect(result.response).toBeNull();
    expect(result.errMsg).toContain("Bad Request");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should retry on 5xx up to maxRetries and return errMsg", async () => {
    const mockFetch = mock(() => Promise.resolve(makeResponse(500, {})));
    globalThis.fetch = mockFetch as any;

    const result = await fetchWithRetry("https://example.com", undefined, 3, 0);
    expect(result.response).toBeNull();
    expect(result.errMsg).toContain("Fetch failed");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("should succeed on a retry after an initial 5xx", async () => {
    let calls = 0;
    globalThis.fetch = mock(() => {
      calls++;
      if (calls === 1) return Promise.resolve(makeResponse(503, {}));
      return Promise.resolve(makeResponse(200, { ok: true }));
    }) as any;

    const result = await fetchWithRetry("https://example.com", undefined, 3, 0);
    expect(result.response).toEqual({ ok: true });
    expect(result.errMsg).toBeNull();
    expect(calls).toBe(2);
  });

  it("should retry on network error and succeed on second attempt", async () => {
    let calls = 0;
    globalThis.fetch = mock(() => {
      calls++;
      if (calls === 1) return Promise.reject(new Error("Network error"));
      return Promise.resolve(makeResponse(200, { retried: true }));
    }) as any;

    const result = await fetchWithRetry("https://example.com", undefined, 3, 0);
    expect(result.response).toEqual({ retried: true });
    expect(result.errMsg).toBeNull();
    expect(calls).toBe(2);
  });

  it("should return errMsg after all retries fail on network error", async () => {
    const mockFetch = mock(() => Promise.reject(new Error("timeout")));
    globalThis.fetch = mockFetch as any;

    const result = await fetchWithRetry("https://example.com", undefined, 2, 0);
    expect(result.response).toBeNull();
    expect(result.errMsg).toContain("Fetch failed");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should return errMsg when JSON parsing fails on a 200 response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: "200",
        json: async () => { throw new Error("Invalid JSON"); },
      } as unknown as Response)
    ) as any;

    const result = await fetchWithRetry("https://example.com");
    expect(result.response).toBeNull();
    expect(result.errMsg).toBe("Failed to parse JSON response.");
  });

  it("should fast-fail on unexpected status codes without retrying", async () => {
    const mockFetch = mock(() => Promise.resolve(makeResponse(301, {})));
    globalThis.fetch = mockFetch as any;

    const result = await fetchWithRetry("https://example.com", undefined, 3, 0);
    expect(result.response).toBeNull();
    expect(result.errMsg).toContain("Unexpected Status");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should respect the custom maxRetries parameter", async () => {
    const mockFetch = mock(() => Promise.resolve(makeResponse(500, {})));
    globalThis.fetch = mockFetch as any;

    await fetchWithRetry("https://example.com", undefined, 5, 0);
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  it("should pass requestInit (method, body, headers) to fetch", async () => {
    let capturedInit: RequestInit | undefined;
    globalThis.fetch = mock((_url: string, init?: RequestInit) => {
      capturedInit = init;
      return Promise.resolve(makeResponse(200, {}));
    }) as any;

    const init: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "value" }),
    };
    await fetchWithRetry("https://example.com", init);
    expect(capturedInit?.method).toBe("POST");
    expect((capturedInit?.headers as Record<string, string>)?.["Content-Type"]).toBe(
      "application/json"
    );
    expect(capturedInit?.body).toBe(JSON.stringify({ key: "value" }));
  });

  it("should abort and return errMsg when timeout fires before fetch resolves", async () => {
    globalThis.fetch = mock(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          // Propagate the abort signal so the fetch rejects on abort
          init?.signal?.addEventListener("abort", () =>
            reject(new Error("AbortError"))
          );
        })
    ) as any;

    const result = await fetchWithRetry(
      "https://example.com",
      undefined,
      1,
      0,
      TEST_CONFIG.timeouts.fetchAbortMs,
    );
    expect(result.response).toBeNull();
    expect(result.errMsg).toBeDefined();
  }, TEST_CONFIG.timeouts.fetchAbortTestMs);
});
