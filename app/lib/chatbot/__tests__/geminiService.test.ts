/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock server-only to avoid it throwing
mock.module("server-only", () => ({}));

// Mock everything before importing GeminiService
mock.module("@/app/env/server", () => ({
  envServer: { GEMINI_API_KEY: "test-key" }
}));

const mockGenerateContent = mock(() => Promise.resolve({ text: "Default" }));

mock.module("@/lib/gemini", () => ({
  gemini_client: {
    models: {
      generateContent: mockGenerateContent,
    },
  },
}));

import { GeminiService } from "../geminiService";

describe("GeminiService", () => {
  beforeEach(() => {
    mockGenerateContent.mockClear();
    mockGenerateContent.mockImplementation(() => Promise.resolve({ text: "Default" }));
  });

  it("should return content on success", async () => {
    mockGenerateContent.mockResolvedValue({
      text: "Hello world",
    });

    const result = await GeminiService.generateContent("model", "hi");
    expect(result.text).toBe("Hello world");
  });

  it("should retry on failure and eventually succeed", async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new Error("Fail 1"))
      .mockRejectedValueOnce(new Error("Fail 2"))
      .mockResolvedValueOnce({ text: "Success" });

    const result = await GeminiService.generateContent("model", "hi", {}, 3);
    expect(result.text).toBe("Success");
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
  });

  it("should throw after all retries fail", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Permanent Fail"));

    try {
      await GeminiService.generateContent("model", "hi", {}, 2);
    } catch (err: any) {
      expect(err.message).toBe("Permanent Fail");
    }
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("generateJSON should parse valid JSON", async () => {
    mockGenerateContent.mockResolvedValue({
      text: '{"foo": "bar"}',
    });

    const result = await GeminiService.generateJSON<any>("model", "hi", "sys", {});
    expect(result.foo).toBe("bar");
  });

  it("generateJSON should throw on invalid JSON", async () => {
    mockGenerateContent.mockResolvedValue({
      text: "invalid json",
    });

    try {
      await GeminiService.generateJSON("model", "hi", "sys", {});
    } catch (err: any) {
      expect(err.message).toBe("Invalid JSON response from Gemini");
    }
  });
});
