/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { fetchFunctionCalls } from "../fetchFunctionCalls";
import { GeminiService } from "../geminiService";

mock.module("../geminiService", () => ({
  GeminiService: {
    generateContent: mock(),
  },
}));

describe("fetchFunctionCalls", () => {
  beforeEach(() => {
    (GeminiService.generateContent as any).mockClear();
  });

  it("should return function call when Gemini returns one", async () => {
    const mockFuncCall = { name: "test_func", args: { a: 1 } };
    (GeminiService.generateContent as any).mockResolvedValue({
      functionCalls: [mockFuncCall],
      text: "Thinking...",
    });

    const result = await fetchFunctionCalls("history");
    expect(result.functionCall).toEqual(mockFuncCall);
    expect(result.error).toBe(false);
  });

  it("should return undefined functionCall when Gemini returns none", async () => {
    (GeminiService.generateContent as any).mockResolvedValue({
      functionCalls: undefined,
      text: "No functions needed",
    });

    const result = await fetchFunctionCalls("history");
    expect(result.functionCall).toBeUndefined();
    expect(result.error).toBe(false);
  });

  it("should return error state when Gemini throws", async () => {
    (GeminiService.generateContent as any).mockRejectedValue(new Error("Gemini Error"));

    const result = await fetchFunctionCalls("history");
    expect(result.error).toBe(true);
    expect(result.functionCall).toBeUndefined();
  });
});
