/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from "bun:test";
import {
  mockGeminiGenerateContent,
  mockGetKnowledgeData,
} from "../../../../../bun-test-setup";

import { fetchChatbotReply } from "../../fetchReply";
import { REPLY_ERROR_FALLBACK_MSG } from "../../config";

describe("fetchChatbotReply", () => {
  const noFunctionResponse = { text: "", functionCalls: undefined };
  const sendEmailResponse = {
    text: "",
    functionCalls: [{ name: "SendEmail", args: {} }],
  };
  const approvedResponse = { text: JSON.stringify({ approve: true, reason: "safe" }) };
  const deniedResponse = { text: JSON.stringify({ approve: false, reason: "unsafe" }) };
  const botResponse = { text: "Bot response" };

  function queueGeminiResponses(...responses: Array<Record<string, unknown> | Error>) {
    let callIndex = 0;
    mockGeminiGenerateContent.mockImplementation(() => {
      const response = responses[Math.min(callIndex, responses.length - 1)];
      callIndex++;

      if (response instanceof Error) {
        return Promise.reject(response);
      }

      return Promise.resolve(response);
    });
  }

  beforeEach(() => {
    mockGetKnowledgeData.mockReset();
    mockGeminiGenerateContent.mockReset();

    mockGetKnowledgeData.mockImplementation(() => Promise.resolve({ info: "knowledge" }));
    queueGeminiResponses(noFunctionResponse, botResponse);
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
    queueGeminiResponses(sendEmailResponse, approvedResponse, botResponse);

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: true,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.functionCall).toEqual({ name: "SendEmail", args: {} });
    expect(result.error).toBe(false);
    expect(mockGeminiGenerateContent).toHaveBeenCalled();
    const prompt = mockGeminiGenerateContent.mock.calls[2][0]?.contents as string;
    expect(prompt).toContain('"name":"SendEmail"');
  });

  it("should NOT return function call if NOT approved", async () => {
    queueGeminiResponses(sendEmailResponse, deniedResponse, botResponse);

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: true,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.functionCall).toBeUndefined();
  });

  it("should skip function approval when functionCallResponse has error", async () => {
    queueGeminiResponses(
      new Error("Function call detection down"),
      new Error("Function call detection down"),
      new Error("Function call detection down"),
      botResponse,
    );

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: true,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.functionCall).toBeUndefined();
    expect(result.error).toBe(false);
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
    queueGeminiResponses(
      noFunctionResponse,
      new Error("Gemini explosion"),
      new Error("Gemini explosion"),
      new Error("Gemini explosion"),
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
    queueGeminiResponses(noFunctionResponse, { text: "" });

    const request = {
      chatHistory: [{ role: "user", message: "Hello" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.error).toBe(true);
    expect(result.message).toBe(REPLY_ERROR_FALLBACK_MSG);
  });

  it("should return fallback message if Gemini returns whitespace text", async () => {
    queueGeminiResponses(noFunctionResponse, { text: "   " });

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
    queueGeminiResponses(sendEmailResponse, botResponse);

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: false,
    };

    const result = await fetchChatbotReply(request as any);
    expect(mockGeminiGenerateContent).toHaveBeenCalledTimes(2);
    expect(result.functionCall).toBeUndefined();
    expect(result.error).toBe(false);
  });

  it("should continue when function approval check fails", async () => {
    queueGeminiResponses(
      sendEmailResponse,
      new Error("Approver down"),
      new Error("Approver down"),
      new Error("Approver down"),
      botResponse,
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
    queueGeminiResponses(sendEmailResponse, deniedResponse, botResponse);

    const request = {
      chatHistory: [{ role: "user", message: "Email me" }],
      enableFunctionCalling: true,
    };

    const result = await fetchChatbotReply(request as any);
    expect(result.functionCall).toBeUndefined();
    expect(result.funcSysMsg).toBe("An email is sent on behalf of user.");
  });
});
