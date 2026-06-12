import { getErrorMessage } from "@/app/utils/handleReport";
import { gemini_client as ai } from "@/lib/gemini";
import type { GenerateContentConfig } from "./geminiTypes";
import { MAX_RETRY_COUNT } from "@/app/config/api";
import { GEMINI_API_VERBOSE_MODE, GEMINI_DEFAULT_TIMEOUT_MS } from "./config";

export class GeminiService {
  static async generateContent(
    model: string,
    contents: string | any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    config?: GenerateContentConfig,
    retries: number = MAX_RETRY_COUNT,
    timeout_ms: number = GEMINI_DEFAULT_TIMEOUT_MS,
  ) {
    let lastError: unknown;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (GEMINI_API_VERBOSE_MODE) {
          console.log("--- Gemini generateContent request:", {
            model,
            contents,
            config,
            attempt: attempt + 1,
          });
        }

        const response = await Promise.race([
          ai.models.generateContent({
            model,
            contents,
            config,
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Gemini API timeout")), timeout_ms)),
        ]);

        if (GEMINI_API_VERBOSE_MODE) {
          console.log("--- Gemini generateContent response:", response);
        }

        return response;
      } catch (err) {
        lastError = err;
        console.error(`Gemini attempt ${attempt + 1} failed: ${getErrorMessage(err)}`);
      }
    }
    throw lastError || new Error("Failed to generate content after retries");
  }

  static async generateJSON<T>(
    model: string,
    contents: string | any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    systemInstruction: string,
    schema: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    retries: number = MAX_RETRY_COUNT,
    timeout_ms: number = GEMINI_DEFAULT_TIMEOUT_MS,
  ): Promise<T> {
    const response = await this.generateContent(
      model,
      contents,
      {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
      retries,
      timeout_ms,
    );

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");

    try {
      return JSON.parse(text) as T;
    } catch (err) {
      console.error("Failed to parse Gemini JSON response:", text, getErrorMessage(err));
      throw new Error("Invalid JSON response from Gemini");
    }
  }
}
