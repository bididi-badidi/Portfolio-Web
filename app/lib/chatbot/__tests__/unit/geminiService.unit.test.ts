/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, spyOn } from "bun:test";
import { mockGeminiGenerateContent } from "../../../../../bun-test-setup";
import { GeminiService } from "../../geminiService";
import { MAX_RETRY_COUNT } from "@/app/config/api";
import { TEST_CONFIG } from "@/app/test/testConfig";

describe("GeminiService", () => {
  beforeEach(() => {
    mockGeminiGenerateContent.mockReset();
  });

  describe("generateContent", () => {
    it("should return content on success", async () => {
      mockGeminiGenerateContent.mockImplementation(() =>
        Promise.resolve({ text: TEST_CONFIG.gemini.successText })
      );

      const result = await GeminiService.generateContent(TEST_CONFIG.gemini.model, "hi");
      expect(result.text).toBe(TEST_CONFIG.gemini.successText);
      expect(mockGeminiGenerateContent).toHaveBeenCalledTimes(1);
    });

    it("should not print verbose Gemini logs during tests", async () => {
      const logSpy = spyOn(console, "log").mockImplementation(() => undefined);
      mockGeminiGenerateContent.mockImplementation(() =>
        Promise.resolve({ text: TEST_CONFIG.gemini.successText })
      );

      try {
        await GeminiService.generateContent(TEST_CONFIG.gemini.model, "hi");
        expect(logSpy).not.toHaveBeenCalled();
      } finally {
        logSpy.mockRestore();
      }
    });

    it("should retry on failure and eventually succeed", async () => {
      let callCount = 0;
      mockGeminiGenerateContent.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) return Promise.reject(new Error(`Fail ${callCount}`));
        return Promise.resolve({ text: TEST_CONFIG.gemini.retrySuccessText });
      });

      const result = await GeminiService.generateContent(TEST_CONFIG.gemini.model, "hi", {}, MAX_RETRY_COUNT);
      expect(result.text).toBe(TEST_CONFIG.gemini.retrySuccessText);
      expect(mockGeminiGenerateContent).toHaveBeenCalledTimes(3);
    });

    it("should throw the last error after all retries fail", async () => {
      let callCount = 0;
      mockGeminiGenerateContent.mockImplementation(() => {
        callCount++;
        return Promise.reject(new Error(`Fail ${callCount}`));
      });

      try {
        await GeminiService.generateContent(TEST_CONFIG.gemini.model, "hi", {}, 2);
        expect(true).toBe(false);
      } catch (err: any) {
        expect(err.message).toBe("Fail 2");
      }
      expect(mockGeminiGenerateContent).toHaveBeenCalledTimes(2);
    });

    it("should use default retry count from MAX_RETRY_COUNT", async () => {
      mockGeminiGenerateContent.mockImplementation(() =>
        Promise.reject(new Error("Always fail"))
      );

      try {
        await GeminiService.generateContent(TEST_CONFIG.gemini.model, "hi");
      } catch {
        // expected
      }
      expect(mockGeminiGenerateContent).toHaveBeenCalledTimes(MAX_RETRY_COUNT);
    });

    it("should only attempt once when retries is 1", async () => {
      mockGeminiGenerateContent.mockImplementation(() =>
        Promise.reject(new Error("Fail"))
      );

      try {
        await GeminiService.generateContent(TEST_CONFIG.gemini.model, "hi", {}, 1);
      } catch {
        // expected
      }
      expect(mockGeminiGenerateContent).toHaveBeenCalledTimes(1);
    });

    it("should throw fallback error when retries is 0", async () => {
      await expect(
        GeminiService.generateContent(TEST_CONFIG.gemini.model, "hi", {}, 0)
      ).rejects.toThrow("Failed to generate content after retries");
      expect(mockGeminiGenerateContent).toHaveBeenCalledTimes(0);
    });

    it("should timeout and retry when API call takes too long", async () => {
      let callCount = 0;
      mockGeminiGenerateContent.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return new Promise((resolve) =>
            setTimeout(
              () => resolve({ text: TEST_CONFIG.gemini.timeoutLateText }),
              TEST_CONFIG.timeouts.geminiSlowResponseMs,
            )
          );
        }
        return Promise.resolve({ text: TEST_CONFIG.gemini.timeoutRecoveryText });
      });

      const result = await GeminiService.generateContent(TEST_CONFIG.gemini.model, "hi", {}, 2);
      expect(result.text).toBe(TEST_CONFIG.gemini.timeoutRecoveryText);
      expect(mockGeminiGenerateContent).toHaveBeenCalledTimes(2);
    }, TEST_CONFIG.timeouts.geminiTimeoutTestMs);
  });

  describe("generateJSON", () => {
    it("should parse valid JSON response", async () => {
      mockGeminiGenerateContent.mockImplementation(() =>
        Promise.resolve({ text: '{"foo": "bar", "count": 42}' })
      );

      const result = await GeminiService.generateJSON<{ foo: string; count: number }>(
        TEST_CONFIG.gemini.model, "hi", "sys", {}
      );
      expect(result.foo).toBe("bar");
      expect(result.count).toBe(42);
    });

    it("should throw on empty text response", async () => {
      mockGeminiGenerateContent.mockImplementation(() =>
        Promise.resolve({ text: "" })
      );

      try {
        await GeminiService.generateJSON(TEST_CONFIG.gemini.model, "hi", "sys", {});
        expect(true).toBe(false);
      } catch (err: any) {
        expect(err.message).toBe("Empty response from Gemini");
      }
    });

    it("should throw on null text response", async () => {
      mockGeminiGenerateContent.mockImplementation(() =>
        Promise.resolve({ text: null })
      );

      try {
        await GeminiService.generateJSON(TEST_CONFIG.gemini.model, "hi", "sys", {});
        expect(true).toBe(false);
      } catch (err: any) {
        expect(err.message).toBe("Empty response from Gemini");
      }
    });

    it("should throw on invalid JSON response", async () => {
      mockGeminiGenerateContent.mockImplementation(() =>
        Promise.resolve({ text: "not valid json {{{" })
      );

      try {
        await GeminiService.generateJSON(TEST_CONFIG.gemini.model, "hi", "sys", {});
        expect(true).toBe(false);
      } catch (err: any) {
        expect(err.message).toBe("Invalid JSON response from Gemini");
      }
    });

    it("should pass systemInstruction and responseSchema in config", async () => {
      mockGeminiGenerateContent.mockImplementation(() =>
        Promise.resolve({ text: '{"ok": true}' })
      );

      await GeminiService.generateJSON(
        TEST_CONFIG.gemini.model,
        TEST_CONFIG.gemini.contents,
        TEST_CONFIG.gemini.systemInstruction,
        { type: "OBJECT" },
      );

      const callArgs = mockGeminiGenerateContent.mock.calls[0][0];
      expect(callArgs.config.systemInstruction).toBe(TEST_CONFIG.gemini.systemInstruction);
      expect(callArgs.config.responseMimeType).toBe("application/json");
      expect(callArgs.config.responseSchema).toEqual({ type: "OBJECT" });
    });
  });
});
