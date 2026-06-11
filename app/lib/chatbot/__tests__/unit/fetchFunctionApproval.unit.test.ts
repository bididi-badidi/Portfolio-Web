/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from "bun:test";
import { mockGeminiGenerateContent } from "../../../../../bun-test-setup";

import { fetchExcDecisionStruct } from "../../fetchFunctionApproval";

const APPROVED_RESPONSE = JSON.stringify({ approve: true, reason: "User explicitly requested this." });
const DENIED_RESPONSE = JSON.stringify({ approve: false, reason: "Action is potentially harmful." });

describe("fetchExcDecisionStruct", () => {
  beforeEach(() => {
    mockGeminiGenerateContent.mockReset();
  });

  it("should return approve: true when Gemini approves the function call", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: APPROVED_RESPONSE })
    );

    const result = await fetchExcDecisionStruct(
      "conversation",
      { name: "SendEmail", args: {} },
      "Sends an email on behalf of the user."
    );

    expect(result.approve).toBe(true);
    expect(result.reason).toBe("User explicitly requested this.");
  });

  it("should return approve: false when Gemini denies the function call", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: DENIED_RESPONSE })
    );

    const result = await fetchExcDecisionStruct(
      "conversation",
      { name: "SendEmail", args: {} },
      "Sends an email on behalf of the user."
    );

    expect(result.approve).toBe(false);
    expect(result.reason).toBe("Action is potentially harmful.");
  });

  it("should return approve: false fallback when Gemini throws", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.reject(new Error("Gemini unavailable"))
    );

    const result = await fetchExcDecisionStruct(
      "conversation",
      { name: "SendEmail", args: {} },
      "desc"
    );

    expect(result.approve).toBe(false);
    expect(result.reason).toBe("Failed to fetch decision");
  });

  it("should return approve: false fallback when Gemini returns invalid JSON", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: "not-valid-json{{" })
    );

    const result = await fetchExcDecisionStruct(
      "conversation",
      { name: "SendEmail", args: {} },
      "desc"
    );

    expect(result.approve).toBe(false);
    expect(result.reason).toBe("Failed to fetch decision");
  });

  it("should return approve: false fallback when Gemini returns empty text", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: "" })
    );

    const result = await fetchExcDecisionStruct(
      "conversation",
      { name: "AddNewReminder", args: {} },
      "desc"
    );

    expect(result.approve).toBe(false);
    expect(result.reason).toBe("Failed to fetch decision");
  });

  it("should include the function call name in the prompt sent to Gemini", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: APPROVED_RESPONSE })
    );

    await fetchExcDecisionStruct(
      "some conversation",
      { name: "NavigateSection", args: { section: "contact" } },
      "Navigates to a section."
    );

    const callArgs = mockGeminiGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain("NavigateSection");
    expect(callArgs.contents).toContain("some conversation");
  });
});
