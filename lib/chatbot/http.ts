import "server-only";
import { z } from "zod";
import { messagesSchema, runPortfolioAgent } from "./agent";
import { checkChatbotQuota } from "./rateLimit";
import { REPLY_ERROR_FALLBACK_MSG } from "@/app/lib/chatbot/config";

const legacySchema = z.object({
  chatHistory: z.array(z.object({ role: z.enum(["user", "bot", "assistant", "system"]), message: z.string().trim().min(1).max(2000), isError: z.boolean().optional() })).min(1).max(20),
  enableFunctionCalling: z.boolean().default(false),
});
const conciergeSchema = z.object({ messages: messagesSchema });

/** Read a bounded body even when Content-Length is absent or misleading. */
async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 48_000) {
        await reader.cancel();
        throw new RangeError("Body too large");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function handleChatRequest(request: Request, format: "chatbot" | "concierge") {
  const json = (body: unknown, status = 200, headers?: HeadersInit) => Response.json(body, { status, headers: { "Cache-Control": "no-store", ...Object.fromEntries(new Headers(headers)) } });
  let messages;
  let enableActions = false;
  try {
    const body = await readBody(request);
    if (format === "concierge") messages = conciergeSchema.parse(body).messages;
    else {
      const parsed = legacySchema.parse(body);
      // Client-authored system entries are UI notices, never model instructions.
      if (parsed.chatHistory.at(-1)?.role !== "user") throw new Error("Expected a user question");
      messages = messagesSchema.parse(parsed.chatHistory.filter(m => m.role !== "system" && !m.isError).map(m => ({ role: m.role === "user" ? "user" : "assistant", message: m.message })));
      enableActions = parsed.enableFunctionCalling;
    }
  } catch (error) {
    return json(format === "chatbot" ? { message: "Please send a question of up to 2,000 characters.", error: true } : { error: "Please send a valid question of up to 2,000 characters." }, error instanceof RangeError ? 413 : 400);
  }
  if (format === "chatbot") {
    try {
      const quota = await checkChatbotQuota(request);
      if (!quota.allowed) {
        return json(
          { message: quota.reason === "ip" ? "Rate limit reached. You can send another question when the timer resets." : "Daily request limit reached. The portfolio assistant will be available again after the reset.", error: true },
          429,
          { "Retry-After": String(quota.retryAfterSeconds) },
        );
      }
    } catch {
      return json({ message: REPLY_ERROR_FALLBACK_MSG, error: true }, 503);
    }
  }
  try {
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(25_000)]);
    const reply = await runPortfolioAgent(messages, enableActions, signal);
    return json(format === "chatbot" ? reply : { message: reply.message });
  } catch {
    return json(format === "chatbot" ? { message: REPLY_ERROR_FALLBACK_MSG, error: true } : { error: "I can’t connect right now. Please try again, explore the project tour, or use Contact." }, 503);
  }
}
