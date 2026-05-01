import { FunctionCall } from "@google/genai";

export function generatePrompt(
  conversationHistoryString: string,
  knowledgeContext: string,
  functionCall: FunctionCall | undefined,
) {
  const prompt = `[Conversation History]
${conversationHistoryString}
[Function Call Details]
${functionCall ? JSON.stringify(functionCall) : "No Function Call\n"}
[Available Information]
${knowledgeContext}`;

  return prompt;
}
