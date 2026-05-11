import { NextRequest, NextResponse } from "next/server";
import { fetchChatbotReply } from "@/app/lib/chatbot/fetchReply";
import type { ChatReply, ChatbotRequest } from "@/app/lib/chatbot/types";
import { REPLY_ERROR_FALLBACK_MSG } from "@/app/lib/chatbot/config";
import { getErrorMessage } from "@/app/utils/handleReport";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ChatbotRequest>;
    const reply = await fetchChatbotReply({
      chatHistory: Array.isArray(body.chatHistory) ? body.chatHistory : [],
      enableFunctionCalling: body.enableFunctionCalling === true,
    });

    return NextResponse.json(reply satisfies ChatReply);
  } catch (err) {
    console.error(`chatbot API error: ${getErrorMessage(err)}`);
    return NextResponse.json(
      {
        message: REPLY_ERROR_FALLBACK_MSG,
        error: true,
      } satisfies ChatReply,
      { status: 500 },
    );
  }
}
