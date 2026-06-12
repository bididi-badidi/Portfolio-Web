"use server";

import { Type } from "../geminiTypes";
import { ResumeEntry, SkillsData } from "@/app/interfaces/Resume";
import { envClient } from "@/app/env/client";
import { GeminiService } from "../geminiService";
import { getErrorMessage } from "@/app/utils/handleReport";
import { DRAFT_SYSTEM_INSTRUCTION, draftUserPrompt } from "./prompts";

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

export interface ResumeDraft {
  summary: string;
  "Work Experiences & Internships": ResumeEntry[];
  "Personal Projects": ResumeEntry[];
  "Leadership Experiences": ResumeEntry[];
  skills: SkillsData;
}

export const draftResume = async (jobDescription: string, masterData: string): Promise<ResumeDraft> => {
  const model = envClient.NEXT_PUBLIC_GEMINI_MODEL_RESUME ?? envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT;

  try {
    return await GeminiService.generateJSON<ResumeDraft>(
      model,
      draftUserPrompt(jobDescription, masterData),
      DRAFT_SYSTEM_INSTRUCTION,
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
            description: "A professional summary tailored to the target job description.",
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
            description: "A list of relevant leadership experiences. Leave empty if not required.",
            items: ResumeEntrySchema,
          },
          skills: {
            type: Type.OBJECT,
            description: "A categorized list of skills.",
            required: ["Technical"],
            properties: {
              Technical: {
                type: Type.STRING,
                description: "A comma-separated string of technical tools and languages.",
              },
            },
          },
        },
      },
      undefined,
      30000,
    );
  } catch (err) {
    console.error("[agentic-resume:draft]", {
      jdLength: jobDescription.length,
      message: getErrorMessage(err),
    });
    throw new Error("AgentStageFailed:draft");
  }
};
