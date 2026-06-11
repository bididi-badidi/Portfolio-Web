"use server";

import { Type } from "./geminiTypes";
import type { FunctionCall } from "./types";
import { envClient } from "@/app/env/client";
import { DECIDE_FUNCTION_CALL_SYS_INSTURCTION } from "./config";
import { GeminiService } from "./geminiService";
import { FunctionExcDecision } from "./types";
import { getErrorMessage } from "@/app/utils/handleReport";

export async function fetchExcDecisionStruct(
  conversation: string,
  functionCall: FunctionCall,
  specificDescription: string,
): Promise<FunctionExcDecision> {
  const prompt = `[Conversation]
${conversation}
[Proposed Function Call]
${JSON.stringify(functionCall)}
[Function Description]
${specificDescription}`;

  try {
    return await GeminiService.generateJSON<FunctionExcDecision>(
      envClient.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL_APPROVER,
      prompt,
      DECIDE_FUNCTION_CALL_SYS_INSTURCTION,
      {
        type: Type.OBJECT,
        required: ["approve", "reason"],
        properties: {
          approve: { type: Type.BOOLEAN },
          reason: { type: Type.STRING },
        },
      }
    );
  } catch (err) {
    const errMsg = getErrorMessage(err);
    console.error(`fetchExcDecisionStruct error: ${errMsg}`);
    return {
      approve: false,
      reason: "Failed to fetch decision",
    };
  }
}
