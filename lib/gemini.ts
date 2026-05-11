import "server-only";
import { envServer } from "@/app/env/server";
import type {
  GenerateContentConfig,
  GenerateContentResponse,
} from "@/app/lib/chatbot/geminiTypes";

interface GeminiPart {
  text?: string;
  functionCall?: {
    name?: string;
    args?: Record<string, unknown>;
  };
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

interface GeminiRestResponse {
  candidates?: GeminiCandidate[];
  error?: {
    message?: string;
  };
}

function toSystemInstruction(systemInstruction: string | undefined) {
  return systemInstruction
    ? {
        parts: [{ text: systemInstruction }],
      }
    : undefined;
}

function toRequestBody(contents: string | unknown[], config: GenerateContentConfig | undefined) {
  const { systemInstruction, tools, ...generationConfig } = config ?? {};

  return {
    contents: typeof contents === "string"
      ? [{ role: "user", parts: [{ text: contents }] }]
      : contents,
    systemInstruction: toSystemInstruction(systemInstruction),
    tools,
    generationConfig,
  };
}

function toGenerateContentResponse(response: GeminiRestResponse): GenerateContentResponse {
  const parts = response.candidates?.[0]?.content?.parts ?? [];

  return {
    text: parts
      .map((part) => part.text)
      .filter((text): text is string => typeof text === "string")
      .join(""),
    functionCalls: parts
      .map((part) => part.functionCall)
      .filter((functionCall): functionCall is NonNullable<GeminiPart["functionCall"]> => Boolean(functionCall)),
  };
}

export const gemini_client = {
  models: {
    async generateContent({
      model,
      contents,
      config,
    }: {
      model: string;
      contents: string | unknown[];
      config?: GenerateContentConfig;
    }): Promise<GenerateContentResponse> {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": envServer.GEMINI_API_KEY,
          },
          body: JSON.stringify(toRequestBody(contents, config)),
        },
      );

      const json = (await response.json()) as GeminiRestResponse;
      if (!response.ok) {
        throw new Error(json.error?.message ?? `Gemini API request failed with status ${response.status}`);
      }

      return toGenerateContentResponse(json);
    },
  },
};
