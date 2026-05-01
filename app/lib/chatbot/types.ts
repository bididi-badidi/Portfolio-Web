import { FunctionCall } from "@google/genai";
import { ChatInstance } from "@/app/interfaces/Chatbot";

export interface ChatReply {
  message: string;
  error: boolean;
  functionCall?: FunctionCall;
  funcSysMsg?: string;
}

export interface ChatbotRequest {
  chatHistory: ChatInstance[];
  enableFunctionCalling: boolean;
}

export interface FunctionCallResponse {
  functionCall: FunctionCall | undefined;
  functionMessage: string;
  error: boolean;
}

export interface FunctionExcDecision {
  approve: boolean;
  reason: string;
}

export interface QueryStructure {
  synthesisQuery: string;
  needSearch: boolean;
  searchQueryLimit: number;
}
