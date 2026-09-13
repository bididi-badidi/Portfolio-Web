import "server-only";
import { z } from "zod";

export interface ToolDefinition {
  type: "function";
  name: string;
  description: string;
  strict: true;
  parameters: Record<string, unknown>;
}
export interface ModelRequest {
  instructions: string;
  input: Record<string, unknown>[];
  tools: ToolDefinition[];
  tool_choice: "auto" | "none";
}
const outputItem = z.object({ type: z.string() }).passthrough();
const responseSchema = z.object({ status: z.literal("completed"), output: z.array(outputItem) });
export type ModelResponse = z.infer<typeof responseSchema>;

/** A single attempt; the caller owns the whole-turn deadline and call budget. */
export async function createResponse(request: ModelRequest, signal: AbortSignal): Promise<ModelResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST", cache: "no-store", signal,
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna",
      ...request, store: false, reasoning: { effort: "none" },
      max_output_tokens: 800, parallel_tool_calls: false,
    }),
  });
  // Never expose or log provider bodies, credentials, or conversation text.
  if (!response.ok) throw new Error(`OpenAI request failed (${response.status})`);
  return responseSchema.parse(await response.json());
}
