/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import {
  mockGeminiGenerateContent,
  mockFetchWithRetry,
} from "../../../../../bun-test-setup";
import { TEST_CONFIG } from "@/app/test/testConfig";

// fetchSearchResults depends on fetchWithRetry. We mock it per-file so that
// fetchSearchResults tests are isolated from fetchWithRetry's HTTP logic.
// (fetchWithRetry itself is tested in app/utils/__tests__/fetchWithRetry.test.ts)
mock.module("@/app/utils/fetchWithRetry", () => ({
  fetchWithRetry: mockFetchWithRetry,
}));

import { fetchStructQueryPrompt, fetchSearchResults } from "../../fetchSearchResults";

describe("fetchStructQueryPrompt", () => {
  beforeEach(() => {
    mockGeminiGenerateContent.mockReset();
  });

  it("should return parsed QueryStructure on success", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({
        text: JSON.stringify({
          needSearch: true,
          synthesisQuery: "what projects did Zi Shen build",
          searchQueryLimit: "5",
        }),
      })
    );

    const result = await fetchStructQueryPrompt("conversation", "fallback query");
    expect(result.needSearch).toBe(true);
    expect(result.synthesisQuery).toBe("what projects did Zi Shen build");
    expect(result.searchQueryLimit).toBe(5);
  });

  it("should coerce searchQueryLimit '3' → 3", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({
        text: JSON.stringify({ needSearch: false, synthesisQuery: "q", searchQueryLimit: "3" }),
      })
    );

    const result = await fetchStructQueryPrompt("conv", "fallback");
    expect(result.searchQueryLimit).toBe(3);
  });

  it("should coerce searchQueryLimit '7' → 7", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({
        text: JSON.stringify({ needSearch: true, synthesisQuery: "q", searchQueryLimit: "7" }),
      })
    );

    const result = await fetchStructQueryPrompt("conv", "fallback");
    expect(result.searchQueryLimit).toBe(7);
  });

  it("should fall back to searchQueryLimit 3 when value is invalid", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({
        text: JSON.stringify({ needSearch: true, synthesisQuery: "q", searchQueryLimit: "abc" }),
      })
    );

    const result = await fetchStructQueryPrompt("conv", "fallback");
    expect(result.searchQueryLimit).toBe(3);
  });

  it("should return fallback QueryStructure when Gemini throws", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.reject(new Error("Gemini down"))
    );

    const result = await fetchStructQueryPrompt("conversation", "my fallback query");
    expect(result.needSearch).toBe(false);
    expect(result.synthesisQuery).toBe("my fallback query");
    expect(result.searchQueryLimit).toBe(3);
  });

  it("should return fallback when Gemini returns empty text", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: "" })
    );

    const result = await fetchStructQueryPrompt("conversation", "fallback");
    expect(result.needSearch).toBe(false);
    expect(result.synthesisQuery).toBe("fallback");
  });
});

describe("fetchSearchResults", () => {
  const originalTxtaiUrl = process.env.TXTAI_BASE_URL;

  beforeEach(() => {
    mockFetchWithRetry.mockReset();
    process.env.TXTAI_BASE_URL = TEST_CONFIG.env.txtaiBaseUrl;
  });

  afterEach(() => {
    process.env.TXTAI_BASE_URL = originalTxtaiUrl;
  });

  it("should return [] when TXTAI_BASE_URL is not set", async () => {
    delete process.env.TXTAI_BASE_URL;
    const result = await fetchSearchResults("query");
    expect(result).toEqual([]);
    expect(mockFetchWithRetry).not.toHaveBeenCalled();
  });

  it("should return results when fetchWithRetry succeeds", async () => {
    mockFetchWithRetry.mockImplementation(() =>
      Promise.resolve({
        response: {
          error: false,
          message: null,
          result: [
            { id: "1", text: "Hello world", answer: null, score: 0.95 },
            { id: "2", text: "Second result", answer: "yes", score: 0.8 },
          ],
        },
        errMsg: null,
      })
    );

    const result = await fetchSearchResults("hello");
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
    expect(result[0].text).toBe("Hello world");
    expect(result[1].id).toBe("2");
  });

  it("should return [] when fetchWithRetry returns an errMsg", async () => {
    mockFetchWithRetry.mockImplementation(() =>
      Promise.resolve({ response: null, errMsg: "Network error" })
    );

    const result = await fetchSearchResults("query");
    expect(result).toEqual([]);
  });

  it("should return [] when response result is null", async () => {
    mockFetchWithRetry.mockImplementation(() =>
      Promise.resolve({
        response: { error: false, message: null, result: null },
        errMsg: null,
      })
    );

    const result = await fetchSearchResults("query");
    expect(result).toEqual([]);
  });

  it("should return [] when response itself is null", async () => {
    mockFetchWithRetry.mockImplementation(() =>
      Promise.resolve({ response: null, errMsg: null })
    );

    const result = await fetchSearchResults("query");
    expect(result).toEqual([]);
  });

  it("should pass the query and limit to fetchWithRetry", async () => {
    mockFetchWithRetry.mockImplementation(() =>
      Promise.resolve({
        response: { result: [] },
        errMsg: null,
      })
    );

    await fetchSearchResults("my query", 7);
    const callArgs = mockFetchWithRetry.mock.calls[0];
    const body = JSON.parse(callArgs[1].body as string);
    expect(body.query).toBe("my query");
    expect(body.limit).toBe(7);
  });

  it("should use default limit of 3 when not specified", async () => {
    mockFetchWithRetry.mockImplementation(() =>
      Promise.resolve({ response: { result: [] }, errMsg: null })
    );

    await fetchSearchResults("query");
    const callArgs = mockFetchWithRetry.mock.calls[0];
    const body = JSON.parse(callArgs[1].body as string);
    expect(body.limit).toBe(3);
  });
});
