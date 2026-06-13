"use server";

import { FinalResumeData } from "@/app/interfaces/Resume";
import { envClient } from "@/app/env/client";
import { getErrorMessage } from "@/app/utils/handleReport";
import { generateChatbotObject } from "../aiSdk";
import { ResumeDraft, resumeDraftSchema } from "./draftResume";
import { REFINE_SYSTEM_INSTRUCTION, refineUserPrompt } from "./prompts";

export const refineResume = async (
  jobDescription: string,
  draft: ResumeDraft,
  comments: string,
  masterDataStr: string,
  factCheckComments: string,
): Promise<FinalResumeData> => {
  const model = envClient.NEXT_PUBLIC_GEMINI_MODEL_RESUME ?? envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT;

  try {
    const result = await generateChatbotObject({
      model,
      prompt: refineUserPrompt(
        jobDescription,
        masterDataStr,
        JSON.stringify(draft, null, 2),
        comments,
        factCheckComments,
      ),
      system: REFINE_SYSTEM_INSTRUCTION,
      schema: resumeDraftSchema,
    });
    const refined = result.object as ResumeDraft;

    const masterResume = JSON.parse(masterDataStr) as FinalResumeData;

    return {
      header: masterResume.header,
      education: masterResume.education,
      ...refined,
    };
  } catch (err) {
    console.error("[agentic-resume:refine]", {
      jdLength: jobDescription.length,
      message: getErrorMessage(err),
    });
    throw new Error("AgentStageFailed:refine");
  }
};
