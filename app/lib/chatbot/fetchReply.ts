"use server";

import { envClient } from "@/app/env/client";
import { getErrorMessage } from "@/app/utils/handleReport";
import { fetchFunctionCalls } from "./fetchFunctionCalls";
import { funcSysMsgDict } from "./functionCalls";
import { fetchStructQueryPrompt } from "./fetchSearchResults";
import {
  REPLY_ERROR_FALLBACK_MSG,
  GEMINI_GENERATION_CONFIG,
  DEBUG_MODE,
} from "./config";
import { fetchExcDecisionStruct } from "./fetchFunctionApproval";
import { FunctionCallType } from "@/app/enums/functionCall";
import { getKnowledgeData } from "@/lib/s3-file-loader";
import { GeminiService } from "./geminiService";
import { ChatReply, ChatbotRequest } from "./types";
import { generatePrompt } from "./generatePrompt";

export async function fetchChatbotReply(request: ChatbotRequest): Promise<ChatReply> {
  try {
    const conversationHistoryString = JSON.stringify(request.chatHistory);

    const [functionCallResponse, searchQuery] = await Promise.all([
      fetchFunctionCalls(conversationHistoryString),
      fetchStructQueryPrompt(conversationHistoryString, request.chatHistory[request.chatHistory.length - 1].message),
    ]);

    if (DEBUG_MODE) {
      console.log(`--- Function Call: ${JSON.stringify(functionCallResponse)}`);
      console.log(`--- Struct query: ${JSON.stringify(searchQuery)}`);
    }

    let functionExecApproved = false;
    if (request.enableFunctionCalling && functionCallResponse.functionCall) {
      const functionType = Object.values(FunctionCallType).find(
        (func) => func.name === functionCallResponse.functionCall?.name,
      );
      const funcExecApproveObj = await fetchExcDecisionStruct(
        conversationHistoryString,
        functionCallResponse.functionCall,
        functionType?.description ?? "",
      );
      functionExecApproved = funcExecApproveObj.approve;
      
      if (DEBUG_MODE) {
        console.log(`--- Func Approver: ${JSON.stringify(funcExecApproveObj)}`);
      }
    }

    const funcSysMsg = functionCallResponse?.functionCall?.name
      ? funcSysMsgDict.get(functionCallResponse?.functionCall?.name)
      : "";

    const knowledgeData = getKnowledgeData();

    const prompt = await generatePrompt(
      conversationHistoryString,
      JSON.stringify(knowledgeData),
      functionExecApproved ? functionCallResponse.functionCall : undefined,
    );

    const response = await GeminiService.generateContent(
      envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT,
      prompt,
      GEMINI_GENERATION_CONFIG
    );

    const replyText = response.text;
    if (!replyText) throw new Error("Unable to fetch response");

    return {
      message: replyText,
      error: false,
      functionCall: functionExecApproved ? functionCallResponse.functionCall : undefined,
      funcSysMsg: funcSysMsg,
    };
  } catch (err) {
    const errMsg = getErrorMessage(err);
    console.error(`fetchChatbotReply error: ${errMsg}`);
    return {
      message: REPLY_ERROR_FALLBACK_MSG,
      error: true,
    };
  }
}
