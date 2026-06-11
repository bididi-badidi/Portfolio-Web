"use server";

import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText, type FlexibleSchema, type ToolSet } from "ai";
import { envServer } from "@/app/env/server";
import { MAX_RETRY_COUNT } from "@/app/config/api";
import { GEMINI_API_VERBOSE_MODE } from "./config";

const CHATBOT_AI_TIMEOUT_MS = 15000;

const google = createGoogleGenerativeAI({
  apiKey: envServer.GEMINI_API_KEY,
});

interface ChatbotTextOptions<TOOLS extends ToolSet> {
  model: string;
  prompt: string;
  system?: string;
  tools?: TOOLS;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

interface ChatbotObjectOptions<SCHEMA extends FlexibleSchema<unknown>> {
  model: string;
  prompt: string;
  system?: string;
  schema: SCHEMA;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

function googleModel(model: string) {
  return google(model as Parameters<typeof google>[0]);
}

function timeoutSignal() {
  return AbortSignal.timeout(CHATBOT_AI_TIMEOUT_MS);
}

export async function generateChatbotText<TOOLS extends ToolSet = ToolSet>({
  model,
  prompt,
  system,
  tools,
  ...settings
}: ChatbotTextOptions<TOOLS>) {
  if (GEMINI_API_VERBOSE_MODE) {
    console.log("--- AI SDK generateText request:", {
      model,
      prompt,
      system,
      tools: tools ? Object.keys(tools) : undefined,
      settings,
    });
  }

  const result = await generateText({
    model: googleModel(model),
    prompt,
    system,
    tools,
    maxRetries: MAX_RETRY_COUNT,
    abortSignal: timeoutSignal(),
    ...settings,
  });

  if (GEMINI_API_VERBOSE_MODE) {
    console.log("--- AI SDK generateText response:", {
      text: result.text,
      toolCalls: result.toolCalls,
      finishReason: result.finishReason,
      usage: result.usage,
      providerMetadata: result.providerMetadata,
    });
  }

  return result;
}

export async function generateChatbotObject<SCHEMA extends FlexibleSchema<unknown>>({
  model,
  prompt,
  system,
  schema,
  ...settings
}: ChatbotObjectOptions<SCHEMA>) {
  if (GEMINI_API_VERBOSE_MODE) {
    console.log("--- AI SDK generateObject request:", {
      model,
      prompt,
      system,
      settings,
    });
  }

  const result = await generateObject({
    model: googleModel(model),
    prompt,
    system,
    schema,
    maxRetries: MAX_RETRY_COUNT,
    abortSignal: timeoutSignal(),
    ...settings,
  });

  if (GEMINI_API_VERBOSE_MODE) {
    console.log("--- AI SDK generateObject response:", {
      object: result.object,
      finishReason: result.finishReason,
      usage: result.usage,
      providerMetadata: result.providerMetadata,
    });
  }

  return result;
}
