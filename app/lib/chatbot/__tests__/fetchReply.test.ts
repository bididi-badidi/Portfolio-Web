/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from "bun:test";
import {
  mockGeminiGenerateContent,
  mockFetchFunctionCalls,
  mockFetchStructQueryPrompt,
  mockFetchSearchResults,
  mockFetchExcDecisionStruct,
  mockGetKnowledgeData,
} from "../../../../bun-test-setup";
import { fetchChatbotReply } from "../fetchReply";
import { REPLY_ERROR_FALLBACK_MSG } from "../config";

describe("fetchChatbotReply", () => {
  beforeEach(() => {
    mockFetchFunctionCalls.mockReset();
    mockFetchStructQueryPrompt.mockReset();
    mockFetchSearchResults.mockReset();
    mockFetchExcDecisionStruct.mockReset();
    mockGetKnowledgeData.mockReset();
    mockGeminiGenerateContent.mockReset();

    mockFetchFunctionCalls.mockImplementation(() =>
      Promise.resolve({ functionCall: undefined, functionMessage: "", error: false })
    );
    mockFetchStructQueryPrompt.mockImplementation(() =>
      Promise.resolve({ needSearch: false, synthesisQuery: "fallback", searchQueryLimit: 3 })
    );
    mockFetchSearchResults.mockImplementation(() => Promise.resolve([]));
    mockGetKnowledgeData.mockImplementation(() => Promise.resolve({ info: "knowledge" }));
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: "Bot response" })
    );
  });

  it("should return a basic response when no functions or search are needed", async () => {
    const request = {
      chatHistory: [{ role: "user", message: "Hello" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.message).toBe("Bot response");
    expect(result.error).toBe(false);
    expect(result.functionCall).toBeUndefined();
  });

  it("should handle function calls when approved", async () => {
    const mockFuncCall = { name: "SendEmail", args: {} };
    mockFetchFunctionCalls.mockImplementation(() =>
      Promise.resolve({ functionCall: mockFuncCall, functionMessage: "", error: false })
    );
    mockFetchExcDecisionStruct.mockImplementation(() =>
      Promise.resolve({ approve: true, reason: "safe" })
    );

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: true,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.functionCall).toEqual(mockFuncCall);
    expect(result.error).toBe(false);
    expect(mockGeminiGenerateContent).toHaveBeenCalled();
    const prompt = mockGeminiGenerateContent.mock.calls[0][0]?.contents as string;
    expect(prompt).toContain('"name":"SendEmail"');
  });

  it("should NOT return function call if NOT approved", async () => {
    const mockFuncCall = { name: "SendEmail", args: {} };
    mockFetchFunctionCalls.mockImplementation(() =>
      Promise.resolve({ functionCall: mockFuncCall, functionMessage: "", error: false })
    );
    mockFetchExcDecisionStruct.mockImplementation(() =>
      Promise.resolve({ approve: false, reason: "unsafe" })
    );

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: true,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.functionCall).toBeUndefined();
  });

  it("should skip function approval when functionCallResponse has error", async () => {
    mockFetchFunctionCalls.mockImplementation(() =>
      Promise.resolve({ functionCall: undefined, functionMessage: "Error", error: true })
    );

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: true,
    };

    const result = await fetchChatbotReply(request as any);
    expect(mockFetchExcDecisionStruct).not.toHaveBeenCalled();
    expect(result.functionCall).toBeUndefined();
    expect(result.error).toBe(false);
  });

  it("should perform search when requested", async () => {
    mockFetchStructQueryPrompt.mockImplementation(() =>
      Promise.resolve({ needSearch: true, synthesisQuery: "search query", searchQueryLimit: 5 })
    );
    mockFetchSearchResults.mockImplementation(() =>
      Promise.resolve([{ id: "1", text: "search result" }])
    );

    const request = {
      chatHistory: [{ role: "user", message: "What is X?" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(mockFetchSearchResults).toHaveBeenCalledWith("search query", 5);
    expect(result.message).toBe("Bot response");
    expect(result.error).toBe(false);
  });

  it("should NOT call fetchSearchResults when needSearch is false", async () => {
    const request = {
      chatHistory: [{ role: "user", message: "Hello" }],
      enableFunctionCalling: false,
    };

    await fetchChatbotReply(request as any);
    expect(mockFetchSearchResults).not.toHaveBeenCalled();
  });

  it("should continue when fetchSearchResults fails", async () => {
    mockFetchStructQueryPrompt.mockImplementation(() =>
      Promise.resolve({ needSearch: true, synthesisQuery: "search", searchQueryLimit: 3 })
    );
    mockFetchSearchResults.mockImplementation(() =>
      Promise.reject(new Error("Search API down"))
    );

    const request = {
      chatHistory: [{ role: "user", message: "What is X?" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.error).toBe(false);
    expect(result.message).toBe("Bot response");
  });

  it("should continue when getKnowledgeData fails", async () => {
    mockGetKnowledgeData.mockImplementation(() =>
      Promise.reject(new Error("S3 down"))
    );

    const request = {
      chatHistory: [{ role: "user", message: "Hello" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.error).toBe(false);
    expect(result.message).toBe("Bot response");
  });

  it("should return fallback message if Gemini generation fails", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.reject(new Error("Gemini explosion"))
    );

    const request = {
      chatHistory: [{ role: "user", message: "Hello" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.error).toBe(true);
    expect(result.message).toBe(REPLY_ERROR_FALLBACK_MSG);
  });

  it("should return fallback message if Gemini returns empty text", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: "" })
    );

    const request = {
      chatHistory: [{ role: "user", message: "Hello" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.error).toBe(true);
    expect(result.message).toBe(REPLY_ERROR_FALLBACK_MSG);
  });

  it("should return fallback message if Gemini returns whitespace text", async () => {
    mockGeminiGenerateContent.mockImplementation(() =>
      Promise.resolve({ text: "   " })
    );

    const request = {
      chatHistory: [{ role: "user", message: "Hello" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.error).toBe(true);
    expect(result.message).toBe(REPLY_ERROR_FALLBACK_MSG);
  });

  it("should return fallback when chatHistory is empty", async () => {
    const request = {
      chatHistory: [],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.error).toBe(true);
    expect(result.message).toBe(REPLY_ERROR_FALLBACK_MSG);
  });

  it("should return fallback when latest message is missing", async () => {
    const request = {
      chatHistory: [{ role: "user" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.error).toBe(true);
    expect(result.message).toBe(REPLY_ERROR_FALLBACK_MSG);
  });

  it("should return fallback when latest message is whitespace", async () => {
    const request = {
      chatHistory: [{ role: "user", message: "   " }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.error).toBe(true);
    expect(result.message).toBe(REPLY_ERROR_FALLBACK_MSG);
  });

  it("should not call function approval when function calling is disabled", async () => {
    const mockFuncCall = { name: "SendEmail", args: {} };
    mockFetchFunctionCalls.mockImplementation(() =>
      Promise.resolve({ functionCall: mockFuncCall, functionMessage: "", error: false })
    );

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(mockFetchExcDecisionStruct).not.toHaveBeenCalled();
    expect(result.functionCall).toBeUndefined();
    expect(result.error).toBe(false);
  });

  it("should continue when function approval check fails", async () => {
    const mockFuncCall = { name: "SendEmail", args: {} };
    mockFetchFunctionCalls.mockImplementation(() =>
      Promise.resolve({ functionCall: mockFuncCall, functionMessage: "", error: false })
    );
    mockFetchExcDecisionStruct.mockImplementation(() =>
      Promise.reject(new Error("Approver down"))
    );

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: true,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.error).toBe(false);
    expect(result.message).toBe("Bot response");
    expect(result.functionCall).toBeUndefined();
  });

  it("should keep funcSysMsg when function is detected but denied", async () => {
    const mockFuncCall = { name: "SendEmail", args: {} };
    mockFetchFunctionCalls.mockImplementation(() =>
      Promise.resolve({ functionCall: mockFuncCall, functionMessage: "", error: false })
    );
    mockFetchExcDecisionStruct.mockImplementation(() =>
      Promise.resolve({ approve: false, reason: "unsafe" })
    );

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: true,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.functionCall).toBeUndefined();
    expect(result.funcSysMsg).toBe("An email is sent on behalf of user.");
  });
});
