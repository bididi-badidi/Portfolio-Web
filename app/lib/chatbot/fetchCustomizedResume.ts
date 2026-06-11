"use server";

import { ResumeEntry, SkillsData } from "@/app/interfaces/Resume";
import { envClient } from "@/app/env/client";
import { getMasterResume } from "@/lib/s3-file-loader";
import { z } from "zod";
import { generateChatbotObject } from "./aiSdk";

const resumeEntrySchema = z.object({
  title: z.string().describe("Name of the company, organization, or project title."),
  role: z.string().describe("Job title or role held. If none, use an empty string."),
  date: z.string().describe("The duration of the experience (e.g., 'Jan 2025 - Present')."),
  bullets: z.array(z.string()).describe("List of bullet points describing achievements."),
});

const completeTemplateSchema = z.object({
  summary: z.string().describe("A professional summary tailored to the target job description."),
  "Work Experiences & Internships": z.array(resumeEntrySchema),
  "Personal Projects": z.array(resumeEntrySchema),
  "Leadership Experiences": z.array(resumeEntrySchema),
  skills: z
    .object({
      Technical: z.string().describe("A comma-separated string of technical tools and languages."),
      "Soft Skills": z.string().describe("A comma-separated string of interpersonal skills."),
      Interests: z.string().describe("A comma-separated string of personal hobbies or interests."),
    })
    .describe("A categorized list of skills and interests."),
});

interface CompleteTemplateStructure {
  summary: string;
  "Work Experiences & Internships": ResumeEntry[];
  "Personal Projects": ResumeEntry[];
  "Leadership Experiences": ResumeEntry[];
  skills: SkillsData;
}

export const fetchResumeData = async (job_description: string, master_data: string) => {
  const MASTER_RESUME_DATA = await getMasterResume();
  const resumeModel = envClient.NEXT_PUBLIC_GEMINI_MODEL_RESUME ?? envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT;

  const prompt = `instruction: You are a resume expert. 
  Filter and format the user's master resume data into the requested structure specifically for the Job Description: "${job_description}".
  
  User Master Data:
  ${master_data}`;

  const result = await generateChatbotObject({
    model: resumeModel,
    prompt,
    system: "You are a resume expert that tailors resumes to job descriptions.",
    schema: completeTemplateSchema,
  });
  const resume = result.object as CompleteTemplateStructure;

  return {
    header: MASTER_RESUME_DATA.header,
    education: MASTER_RESUME_DATA.education,
    summary: resume.summary,
    "Work Experiences & Internships": resume["Work Experiences & Internships"],
    "Personal Projects": resume["Personal Projects"],
    "Leadership Experiences": resume["Leadership Experiences"],
    skills: resume.skills,
  };
};
