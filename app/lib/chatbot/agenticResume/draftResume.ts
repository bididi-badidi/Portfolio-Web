"use server";

import { ResumeEntry, SkillsData } from "@/app/interfaces/Resume";
import { envClient } from "@/app/env/client";
import { getErrorMessage } from "@/app/utils/handleReport";
import { z } from "zod";
import { generateChatbotObject } from "../aiSdk";
import { DRAFT_SYSTEM_INSTRUCTION, draftUserPrompt } from "./prompts";

const resumeEntrySchema = z.object({
  title: z.string().describe("Name of the company, organization, or project title."),
  role: z.string().describe("Job title or role held. If none, use an empty string."),
  date: z.string().describe("The duration of the experience (e.g., 'Jan 2025 - Present')."),
  bullets: z.array(z.string()).describe("List of bullet points describing achievements."),
});

export const resumeDraftSchema = z.object({
  summary: z.string().describe("A professional summary tailored to the target job description."),
  "Work Experiences & Internships": z.array(resumeEntrySchema),
  "Personal Projects": z.array(resumeEntrySchema),
  "Leadership Experiences": z
    .array(resumeEntrySchema)
    .describe("A list of relevant leadership experiences. Leave empty if not required."),
  skills: z
    .object({
      Technical: z.string().describe("A comma-separated string of technical tools and languages."),
      "Soft Skills": z.string().describe("A comma-separated string of interpersonal skills."),
      Interests: z.string().describe("A comma-separated string of personal hobbies or interests."),
    })
    .describe("A categorized list of skills."),
});

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
    const result = await generateChatbotObject({
      model,
      prompt: draftUserPrompt(jobDescription, masterData),
      system: DRAFT_SYSTEM_INSTRUCTION,
      schema: resumeDraftSchema,
    });
    return result.object as ResumeDraft;
  } catch (err) {
    console.error("[agentic-resume:draft]", {
      jdLength: jobDescription.length,
      message: getErrorMessage(err),
    });
    throw new Error("AgentStageFailed:draft");
  }
};
