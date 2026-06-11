"use server";

import {
  FETCH_FAIL_FALLBACK_MSG,
  FUNCTION_CALL_SYS_INSTRUCTION,
} from "./config";
import { envClient } from "@/app/env/client";
import { FunctionCallResponse } from "./types";
import { getErrorMessage } from "@/app/utils/handleReport";
import { generateChatbotText } from "./aiSdk";
import { functionCallTools } from "./functionCalls";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function fetchFunctionCalls(conversation: string): Promise<FunctionCallResponse> {
  try {
    const response = await generateChatbotText({
      model: envClient.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL,
      prompt: conversation,
      system: FUNCTION_CALL_SYS_INSTRUCTION,
      tools: functionCallTools,
    });

    const funcCallRaw = response.toolCalls?.[0];
    let funcCall: FunctionCallResponse["functionCall"];

    if (funcCallRaw?.toolName) {
      if (funcCallRaw.input === undefined || isRecord(funcCallRaw.input)) {
        funcCall = {
          name: funcCallRaw.toolName,
          args: funcCallRaw.input ?? {},
        };
      } else {
        console.warn(
          `Ignoring malformed tool call args for ${funcCallRaw.toolName}: expected object input`,
        );
      }
    }

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
