import { getErrorMessage } from "@/app/utils/handleReport";
import { gemini_client as ai } from "@/lib/gemini";
import type { GenerateContentConfig } from "./geminiTypes";
import { MAX_RETRY_COUNT } from "@/app/config/api";

const GEMINI_TIMEOUT_MS = 15000;

export class GeminiService {
  static async generateContent(
    model: string,
    contents: string | any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    config?: GenerateContentConfig,
    retries: number = MAX_RETRY_COUNT
  ) {
    let lastError: unknown;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await Promise.race([
          ai.models.generateContent({
            model,
            contents,
            config,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini API timeout")), GEMINI_TIMEOUT_MS)
          ),
        ]);
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
    retries: number = MAX_RETRY_COUNT
  ): Promise<T> {
    const response = await this.generateContent(
      model,
      contents,
      {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
      retries
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
