"use server";

import { Type } from "../geminiTypes";
import { FinalResumeData } from "@/app/interfaces/Resume";
import { envClient } from "@/app/env/client";
import { GeminiService } from "../geminiService";
import { getErrorMessage } from "@/app/utils/handleReport";
import { ResumeDraft } from "./draftResume";
import { ReviewComments } from "./reviewResume";
import { REFINE_SYSTEM_INSTRUCTION, refineUserPrompt } from "./prompts";

const ResumeEntrySchema = {
  type: Type.OBJECT,
  required: ["title", "role", "date", "bullets"],
  properties: {
    title: {
      type: Type.STRING,
      description: "Name of the company, organization, or project title.",
    },
    role: {
      type: Type.STRING,
      description: "Job title or role held. If none, use an empty string.",
    },
    date: {
      type: Type.STRING,
      description: "The duration of the experience (e.g., 'Jan 2025 - Present').",
    },
    bullets: {
      type: Type.ARRAY,
      description: "List of bullet points describing achievements.",
      items: { type: Type.STRING },
    },
  },
};

export const refineResume = async (
  jobDescription: string,
  draft: ResumeDraft,
  comments: ReviewComments,
  masterDataStr: string
): Promise<FinalResumeData> => {
  const model =
    envClient.NEXT_PUBLIC_GEMINI_MODEL_RESUME ??
    envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT;

  try {
    const refined = await GeminiService.generateJSON<ResumeDraft>(
      model,
      refineUserPrompt(jobDescription, masterDataStr, JSON.stringify(draft, null, 2), JSON.stringify(comments, null, 2)),
      REFINE_SYSTEM_INSTRUCTION,
      {
        type: Type.OBJECT,
        required: [
          "summary",
          "Work Experiences & Internships",
          "Personal Projects",
          "Leadership Experiences",
          "skills",
        ],
        properties: {
          summary: {
            type: Type.STRING,
            description:
              "A refined professional summary tailored to the target job description.",
          },
          "Work Experiences & Internships": {
            type: Type.ARRAY,
            items: ResumeEntrySchema,
          },
          "Personal Projects": {
            type: Type.ARRAY,
            items: ResumeEntrySchema,
          },
          "Leadership Experiences": {
            type: Type.ARRAY,
            items: ResumeEntrySchema,
          },
          skills: {
            type: Type.OBJECT,
            required: ["Technical", "Soft Skills", "Interests"],
            properties: {
              Technical: { type: Type.STRING },
              "Soft Skills": { type: Type.STRING },
              Interests: { type: Type.STRING },
            },
          },
        },
      }
    );

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
