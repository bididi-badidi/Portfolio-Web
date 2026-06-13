// All prompts for the 3-agent resume generation workflow.

import { writingRestrictions } from "../promptUtils";

export const DRAFT_SYSTEM_INSTRUCTION = `You are a resume expert that tailors resumes to job descriptions.\n\n${writingRestrictions()}`;

export const draftUserPrompt = (jobDescription: string, masterData: string) =>
  `instruction: You are a resume expert.
  Filter and format the user's master resume data into the requested structure specifically for the Job Description: "${jobDescription}". Make sure the summary section is concise and short.

  User Data:
  ${masterData}`;

export const REVIEW_SYSTEM_INSTRUCTION =
  "You are a senior technical recruiter reviewing a tailored resume against a job description. Only comment on relevance, gaps, and JD-keyword alignment. Do not rewrite content.";

export const reviewUserPrompt = (jobDescription: string, draftJson: string) =>
  `You are reviewing the following resume draft against the job description below. Make sure:
- Only the relevant projects/experiences with required skills are selected (for example if leadership experience is not mentioned in JD then there is no need for it)
- Exclude long bullet points that does not show them a strong candidate. Each experience or project should have only maximum 2 points (1 if not much relevant).
- Recommended 2 selected projects and maximum 3 projects if the third one is super important.
- Short and concise summary (this is a student resume not some experienced professional)

Job Description:
${jobDescription}

Resume Draft:
${draftJson}`;

export const FACTCHECK_SYSTEM_INSTRUCTION =
  "You are a fact-checker verifying a tailored resume against the candidate's original master data. Identify any claims, descriptions, or bullet points in the draft that overstate, misrepresent, or cannot be supported by the master data. Be specific: quote the offending text and explain what is inaccurate or unsupported.";

export const factcheckUserPrompt = (masterData: string, draftJson: string) =>
  `Compare the resume draft against the master data below. List every claim that is inaccurate, overstated, or unsupported. If the draft is fully accurate, say so.

Master Data (source of truth):
${masterData}

Resume Draft:
${draftJson}`;

export const REFINE_SYSTEM_INSTRUCTION = `You are a resume expert refining your earlier draft based on reviewer feedback. Apply the comments without exceeding the truthfulness of the original master data. Do not invent experience or skills not present in the original draft.\n\n${writingRestrictions()}`;

export const refineUserPrompt = (
  jobDescription: string,
  masterData: string,
  draftJson: string,
  reviewComments: string,
  factCheckComments: string,
) =>
  `You produced the following resume draft. A reviewer and a fact-checker have both critiqued it. Apply the actionable feedback while staying truthful to the user's master data.

Job Description:
${jobDescription}

Original Master Data (source of truth — do not invent anything beyond this):
${masterData}

Your Draft:
${draftJson}

Reviewer Comments:
${reviewComments}

Fact-Check Findings:
${factCheckComments}`;
