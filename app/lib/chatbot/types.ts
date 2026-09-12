import { ChatInstance } from "@/app/interfaces/Chatbot";

export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

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
