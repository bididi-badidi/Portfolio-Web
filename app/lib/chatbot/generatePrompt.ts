import { FunctionCall } from "@google/genai";
import { wrapWithTag } from "./promptUtils";

export function generatePrompt(
  conversationHistoryString: string,
  knowledgeContext: string,
  functionCall: FunctionCall | undefined,
) {
  const history = wrapWithTag("ConversationHistory", conversationHistoryString);
  const funcCall = wrapWithTag(
    "FunctionCallDetails",
    functionCall ? JSON.stringify(functionCall) : "No Function Call",
  );
  const info = wrapWithTag("AvailableInformation", knowledgeContext);

  return `${history}\n${funcCall}\n${info}`;
}
