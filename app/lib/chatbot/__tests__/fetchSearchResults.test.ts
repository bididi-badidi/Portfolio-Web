/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { fetchStructQueryPrompt, fetchSearchResults } from "../fetchSearchResults";
import { GeminiService } from "../geminiService";
import { fetchWithRetry } from "@/app/utils/fetchWithRetry";

mock.module("../geminiService", () => ({
  GeminiService: {
    generateJSON: mock(),
  },
}));

mock.module("@/app/utils/fetchWithRetry", () => ({
  fetchWithRetry: mock(),
}));

describe("fetchSearchResults", () => {
  describe("fetchStructQueryPrompt", () => {
    beforeEach(() => {
      (GeminiService.generateJSON as any).mockClear();
    });

    it("should return synthesized query when Gemini succeeds", async () => {
      (GeminiService.generateJSON as any).mockResolvedValue({
        needSearch: true,
        synthesisQuery: "find me food",
        searchQueryLimit: "5",
      });

      const result = await fetchStructQueryPrompt("history", "fallback");
      expect(result.needSearch).toBe(true);
      expect(result.synthesisQuery).toBe("find me food");
    });

    it("should fallback when Gemini throws", async () => {
      (GeminiService.generateJSON as any).mockRejectedValue(new Error("Gemini Fail"));

      const result = await fetchStructQueryPrompt("history", "fallback");
      expect(result.needSearch).toBe(false);
      expect(result.synthesisQuery).toBe("fallback");
    });
  });

  describe("fetchSearchResults", () => {
    beforeEach(() => {
      (fetchWithRetry as any).mockClear();
    });

    it("should return results when fetch succeeds", async () => {
      const mockResult = [{ id: "1", text: "info" }];
      (fetchWithRetry as any).mockResolvedValue({
        response: { result: mockResult },
        errMsg: null,
      });

      const results = await fetchSearchResults("query");
      expect(results).toEqual(mockResult);
    });

    it("should return empty array when fetch fails", async () => {
      (fetchWithRetry as any).mockResolvedValue({
        response: null,
        errMsg: "Network Error",
      });

      const results = await fetchSearchResults("query");
      expect(results).toEqual([]);
    });
  });
});
