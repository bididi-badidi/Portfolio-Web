"use server";

import { envClient } from "@/app/env/client";
import { getErrorMessage } from "@/app/utils/handleReport";
import { generateChatbotText } from "../aiSdk";
import { ResumeDraft } from "./draftResume";
import { REVIEW_SYSTEM_INSTRUCTION, reviewUserPrompt } from "./prompts";

export const reviewResume = async (jobDescription: string, draft: ResumeDraft): Promise<string> => {
  const model = envClient.NEXT_PUBLIC_GEMINI_MODEL_RESUME_REVIEWER ?? envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT;

  try {
    const response = await generateChatbotText({
      model,
      prompt: reviewUserPrompt(jobDescription, JSON.stringify(draft, null, 2)),
      system: REVIEW_SYSTEM_INSTRUCTION,
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return text;
  } catch (err) {
    console.error("[agentic-resume:review]", {
      jdLength: jobDescription.length,
      message: getErrorMessage(err),
    });
    throw new Error("AgentStageFailed:review");
  }
};
