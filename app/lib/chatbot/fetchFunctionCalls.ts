"use server";

import { functionCallList } from "./functionCalls";
import {
  FETCH_FAIL_FALLBACK_MSG,
  FUNCTION_CALL_SYS_INSTRUCTION,
} from "./config";
import { envClient } from "@/app/env/client";
import { GeminiService } from "./geminiService";
import { FunctionCallResponse } from "./types";
import { getErrorMessage } from "@/app/utils/handleReport";

export async function fetchFunctionCalls(conversation: string): Promise<FunctionCallResponse> {
  try {
    const response = await GeminiService.generateContent(
      envClient.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL,
      conversation,
      {
        systemInstruction: FUNCTION_CALL_SYS_INSTRUCTION,
        tools: [
          {
            functionDeclarations: [...functionCallList],
          },
        ],
      }
    );

    const funcCallRaw = response.functionCalls ? response.functionCalls[0] : undefined;
    const funcCall = funcCallRaw?.name ? {
      name: funcCallRaw.name,
      args: (funcCallRaw.args as Record<string, unknown>) || {},
    } : undefined;

    return {
      functionCall: funcCall,
      functionMessage: response.text || "",
      error: false,
    };
  } catch (err) {
    const errMsg = getErrorMessage(err);
    console.error(`fetchFunctionCalls error: ${errMsg}`);
    return {
      functionCall: undefined,
      functionMessage: FETCH_FAIL_FALLBACK_MSG,
      error: true,
    };
  }
}
