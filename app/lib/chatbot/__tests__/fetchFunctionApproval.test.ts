/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { fetchExcDecisionStruct } from "../fetchFunctionApproval";
import { GeminiService } from "../geminiService";

mock.module("../geminiService", () => ({
  GeminiService: {
    generateJSON: mock(),
  },
}));

describe("fetchFunctionApproval", () => {
  beforeEach(() => {
    (GeminiService.generateJSON as any).mockClear();
  });

  it("should return approval when Gemini approves", async () => {
    (GeminiService.generateJSON as any).mockResolvedValue({
      approve: true,
      reason: "Looks good",
    });

    const result = await fetchExcDecisionStruct("history", { name: "foo" } as any, "desc");
    expect(result.approve).toBe(true);
    expect(result.reason).toBe("Looks good");
  });

  it("should return denial when Gemini denies", async () => {
    (GeminiService.generateJSON as any).mockResolvedValue({
      approve: false,
      reason: "Dangerous",
    });

    const result = await fetchExcDecisionStruct("history", { name: "foo" } as any, "desc");
    expect(result.approve).toBe(false);
    expect(result.reason).toBe("Dangerous");
  });

  it("should fallback to denial when Gemini throws", async () => {
    (GeminiService.generateJSON as any).mockRejectedValue(new Error("Gemini Error"));

    const result = await fetchExcDecisionStruct("history", { name: "foo" } as any, "desc");
    expect(result.approve).toBe(false);
  });
});
