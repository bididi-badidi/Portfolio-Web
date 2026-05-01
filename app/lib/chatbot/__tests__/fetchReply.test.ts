/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { fetchChatbotReply } from "../fetchReply";
import { fetchFunctionCalls } from "../fetchFunctionCalls";
import { fetchStructQueryPrompt, fetchSearchResults } from "../fetchSearchResults";
import { fetchExcDecisionStruct } from "../fetchFunctionApproval";
import { getKnowledgeData } from "@/lib/s3-file-loader";
import { GeminiService } from "../geminiService";

mock.module("../fetchFunctionCalls", () => ({
  fetchFunctionCalls: mock(),
}));
mock.module("../fetchSearchResults", () => ({
  fetchStructQueryPrompt: mock(),
  fetchSearchResults: mock(),
}));
mock.module("../fetchFunctionApproval", () => ({
  fetchExcDecisionStruct: mock(),
}));
mock.module("@/lib/s3-file-loader", () => ({
  getKnowledgeData: mock(),
}));
mock.module("../geminiService", () => ({
  GeminiService: {
    generateContent: mock(),
  },
}));

describe("fetchChatbotReply", () => {
  beforeEach(() => {
    (fetchFunctionCalls as any).mockResolvedValue({ functionCall: null, error: false });
    (fetchStructQueryPrompt as any).mockResolvedValue({ needSearch: false });
    (getKnowledgeData as any).mockResolvedValue({});
    (GeminiService.generateContent as any).mockResolvedValue({ text: "Bot response" });
  });

  it("should return a basic response when no functions or search are needed", async () => {
    const request = {
      chatHistory: [{ role: "user", message: "Hello" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.message).toBe("Bot response");
    expect(result.error).toBe(false);
  });

  it("should handle function calls when approved", async () => {
    const mockFuncCall = { name: "SendEmail", args: {} };
    (fetchFunctionCalls as any).mockResolvedValue({
      functionCall: mockFuncCall,
      error: false,
    });
    (fetchExcDecisionStruct as any).mockResolvedValue({ approve: true });

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: true,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.functionCall).toEqual(mockFuncCall);
  });

  it("should NOT return function call if NOT approved", async () => {
    const mockFuncCall = { name: "SendEmail", args: {} };
    (fetchFunctionCalls as any).mockResolvedValue({
      functionCall: mockFuncCall,
      error: false,
    });
    (fetchExcDecisionStruct as any).mockResolvedValue({ approve: false });

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: true,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.functionCall).toBeUndefined();
  });

  it("should perform search when requested by Gemini", async () => {
    (fetchStructQueryPrompt as any).mockResolvedValue({
      needSearch: true,
      synthesisQuery: "search query",
      searchQueryLimit: 3,
    });
    (fetchSearchResults as any).mockResolvedValue([{ id: "1", text: "search result" }]);

    const request = {
      chatHistory: [{ role: "user", message: "What is X?" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(fetchSearchResults).toHaveBeenCalledWith("search query", 3);
    expect(result.message).toBe("Bot response");
  });

  it("should return fallback message if Gemini generation fails", async () => {
    (GeminiService.generateContent as any).mockRejectedValue(new Error("Gemini explosion"));

    const request = {
      chatHistory: [{ role: "user", message: "Hello" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.error).toBe(true);
  });
});
