/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from "bun:test";
import { mockGeminiGenerateContent, mockGetMasterResume } from "../../../../../bun-test-setup";

/**
 * Tests for chatbot sub-components using the real implementations.
 * These go through the actual code paths via mockGeminiGenerateContent.
 *
 * NOTE: fetchReply integration tests are in fetchReply.test.ts using sub-module mocks.
 */

import { GeminiService } from "../../geminiService";
import { fetchResumeData } from "../../fetchCustomizedResume";

describe("Chatbot Chain Components", () => {
  beforeEach(() => {
    mockGeminiGenerateContent.mockReset();
    mockGetMasterResume.mockReset();

    mockGetMasterResume.mockImplementation(() => Promise.resolve({ header: {}, education: {} }));
  });

  // ── GeminiService ──

  describe("GeminiService (via shared mock)", () => {
    it("should handle successful content generation", async () => {
      mockGeminiGenerateContent.mockImplementation(() => Promise.resolve({ text: "Success" }));
      const res = await GeminiService.generateContent("model", "hi");
      expect(res.text).toBe("Success");
    });

    it("should retry on failure", async () => {
      let callCount = 0;
      mockGeminiGenerateContent.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.reject(new Error("Fail"));
        return Promise.resolve({ text: "Success" });
      });
      const res = await GeminiService.generateContent("model", "hi", {}, 2);
      expect(res.text).toBe("Success");
      expect(mockGeminiGenerateContent).toHaveBeenCalledTimes(2);
    });
  });

  // ── fetchResumeData ──

  describe("fetchResumeData", () => {
    it("should return tailored resume data", async () => {
      const mockResult = {
        summary: "Tailored summary",
        "Work Experiences & Internships": [],
        "Personal Projects": [],
        "Leadership Experiences": [],
        skills: { Technical: "JS", "Soft Skills": "Comm", Interests: "Gaming" },
      };
      mockGeminiGenerateContent.mockImplementation(() => Promise.resolve({ text: JSON.stringify(mockResult) }));
      const res = await fetchResumeData("job", "master");
      expect(res.summary).toBe("Tailored summary");
      expect(res.skills.Technical).toBe("JS");
    });

    it("should throw when master resume fetch fails", async () => {
      mockGetMasterResume.mockImplementation(() => Promise.reject(new Error("s3 unavailable")));

      await expect(fetchResumeData("job", "master")).rejects.toThrow("s3 unavailable");
    });

    it("should throw when Gemini returns invalid JSON", async () => {
      mockGeminiGenerateContent.mockImplementation(() => Promise.resolve({ text: "not-json" }));

      await expect(fetchResumeData("job", "master")).rejects.toThrow("Invalid JSON response from Gemini");
    });
  });
});
