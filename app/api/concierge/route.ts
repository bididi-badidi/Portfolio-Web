import { handleChatRequest } from "@/lib/chatbot/http";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  return handleChatRequest(request, "concierge");
}
