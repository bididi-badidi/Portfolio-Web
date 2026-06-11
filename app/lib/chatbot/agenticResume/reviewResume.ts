"use server";

import { Type } from "../geminiTypes";
import { envClient } from "@/app/env/client";
import { GeminiService } from "../geminiService";
import { getErrorMessage } from "@/app/utils/handleReport";
import { ResumeDraft } from "./draftResume";
import { REVIEW_SYSTEM_INSTRUCTION, reviewUserPrompt } from "./prompts";

export interface SectionFeedback {
  section:
    | "summary"
    | "Work Experiences & Internships"
    | "Personal Projects"
    | "Leadership Experiences"
    | "skills";
  entryTitle?: string;
  issue: string;
  suggestion: string;
}

export interface ReviewComments {
  overallRelevance: number;
  summaryFeedback: string;
  sectionFeedback: SectionFeedback[];
  missingKeywords: string[];
}

export const reviewResume = async (
  jobDescription: string,
  draft: ResumeDraft
): Promise<ReviewComments> => {
  const model =
    envClient.NEXT_PUBLIC_GEMINI_MODEL_RESUME_REVIEWER ??
    envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT;

  try {
    return await GeminiService.generateJSON<ReviewComments>(
      model,
      reviewUserPrompt(jobDescription, JSON.stringify(draft, null, 2)),
      REVIEW_SYSTEM_INSTRUCTION,
      {
        type: Type.OBJECT,
        required: [
          "overallRelevance",
          "summaryFeedback",
          "sectionFeedback",
          "missingKeywords",
        ],
        properties: {
          overallRelevance: {
            type: Type.NUMBER,
            description:
              "A score from 1 to 10 indicating how well the resume matches the JD.",
          },
          summaryFeedback: {
            type: Type.STRING,
            description:
              "Specific critique of the summary section's relevance to the JD.",
          },
          sectionFeedback: {
            type: Type.ARRAY,
            description:
              "Specific critiques for individual entries or sections.",
            items: {
              type: Type.OBJECT,
              required: ["section", "issue", "suggestion"],
              properties: {
                section: {
                  type: Type.STRING,
                  description:
                    "The section name: summary, Work Experiences & Internships, Personal Projects, Leadership Experiences, or skills.",
                },
                entryTitle: {
                  type: Type.STRING,
                  description:
                    "The title of the specific entry being critiqued, if applicable.",
                },
                issue: {
                  type: Type.STRING,
                  description:
                    "A concise description of the relevance gap or weakness.",
                },
                suggestion: {
                  type: Type.STRING,
                  description:
                    "An actionable suggestion for improvement without rewriting.",
                },
              },
            },
          },
          missingKeywords: {
            type: Type.ARRAY,
            description:
              "Keywords or phrases present in the JD but absent from the resume draft.",
            items: { type: Type.STRING },
          },
        },
      }
    );
  } catch (err) {
    console.error("[agentic-resume:review]", {
      jdLength: jobDescription.length,
      message: getErrorMessage(err),
    });
    throw new Error("AgentStageFailed:review");
  }
};
