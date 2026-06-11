"use client";

import type { ChatReply, ChatbotRequest } from "./types";
import { REPLY_ERROR_FALLBACK_MSG } from "./config";

export async function fetchChatbotReplyClient(request: ChatbotRequest): Promise<ChatReply> {
  const response = await fetch("/api/chatbot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    return {
      message: REPLY_ERROR_FALLBACK_MSG,
      error: true,
    };
  }

  return (await response.json()) as ChatReply;
}
