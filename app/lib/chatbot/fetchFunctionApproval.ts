"use server";

import type { FunctionCall } from "./types";
import { envClient } from "@/app/env/client";
import { DECIDE_FUNCTION_CALL_SYS_INSTURCTION } from "./config";
import { FunctionExcDecision } from "./types";
import { getErrorMessage } from "@/app/utils/handleReport";
import { z } from "zod";
import { generateChatbotObject } from "./aiSdk";

const functionExcDecisionSchema = z.object({
  approve: z.boolean(),
  reason: z.string(),
});

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
    const result = await generateChatbotObject({
      model: envClient.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL_APPROVER,
      prompt,
      system: DECIDE_FUNCTION_CALL_SYS_INSTURCTION,
      schema: functionExcDecisionSchema,
    });

    return result.object as FunctionExcDecision;
  } catch (err) {
    const errMsg = getErrorMessage(err);
    console.error(`fetchExcDecisionStruct error: ${errMsg}`);
    return {
      approve: false,
      reason: "Failed to fetch decision",
    };
  }
}
