"use client";

import type { ChatReply, ChatbotRequest } from "./types";
import { CHAT_TIMEOUT_MS, REPLY_ERROR_FALLBACK_MSG } from "./config";

export async function fetchChatbotReplyClient(request: ChatbotRequest): Promise<ChatReply> {
  const response = await fetch("/api/chatbot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
  });

  if (response.status === 429) {
    const body: unknown = await response.json().catch(() => null);
    const retryAfter = Number(response.headers.get("Retry-After"));
    const message = body && typeof body === "object" && "message" in body && typeof body.message === "string"
      ? body.message
      : "Rate limit reached. Please wait before sending another question.";
    const retryAfterSeconds = Number.isSafeInteger(retryAfter) && retryAfter > 0 ? retryAfter : undefined;
    return {
      message,
      error: true,
      ...(retryAfterSeconds
        ? { retryAfterSeconds, rateLimitResetAt: Date.now() + retryAfterSeconds * 1000 }
        : {}),
    };
  }

  if (!response.ok) {
    return {
      message: REPLY_ERROR_FALLBACK_MSG,
      error: true,
    };
  }

  return (await response.json()) as ChatReply;
}
