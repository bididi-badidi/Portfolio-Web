/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from "bun:test";
import { mockGeminiGenerateContent } from "../../../../../bun-test-setup";

import { fetchFunctionCalls } from "../../fetchFunctionCalls";
import { FETCH_FAIL_FALLBACK_MSG } from "../../config";

describe("fetchFunctionCalls", () => {
  beforeEach(() => {
    mockGeminiGenerateContent.mockReset();
  });

  it("should return a function call when Gemini detects one", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({
        text: "",
        functionCalls: [{ name: "SendEmail", args: { email: "a@b.com" } }],
      })
    );

    const result = await fetchFunctionCalls("conversation history");
    expect(result.error).toBe(false);
    expect(result.functionCall?.name).toBe("SendEmail");
    expect(result.functionCall?.args).toEqual({ email: "a@b.com" });
  });

  it("should return no function call when Gemini returns plain text", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: "I understand your request.", functionCalls: undefined })
    );

    const result = await fetchFunctionCalls("conversation history");
    expect(result.error).toBe(false);
    expect(result.functionCall).toBeUndefined();
    expect(result.functionMessage).toBe("I understand your request.");
  });

  it("should return the first function call when Gemini returns multiple", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({
        text: "",
        functionCalls: [
          { name: "SendEmail", args: {} },
          { name: "NavigateSection", args: { section: "contact" } },
        ],
      })
    );

    const result = await fetchFunctionCalls("conversation");
    expect(result.functionCall?.name).toBe("SendEmail");
  });

  it("should return error: true and fallback message when Gemini throws", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.reject(new Error("Gemini API down"))
    );

    const result = await fetchFunctionCalls("conversation");
    expect(result.error).toBe(true);
    expect(result.functionCall).toBeUndefined();
    expect(result.functionMessage).toBe(FETCH_FAIL_FALLBACK_MSG);
  });

  it("should return empty functionMessage when Gemini response text is empty", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: "", functionCalls: undefined })
    );

    const result = await fetchFunctionCalls("conversation");
    expect(result.error).toBe(false);
    expect(result.functionCall).toBeUndefined();
    expect(result.functionMessage).toBe("");
  });
});
