// All prompts for the 3-agent resume generation workflow.

export const DRAFT_SYSTEM_INSTRUCTION = "You are a resume expert that tailors resumes to job descriptions.";

export const draftUserPrompt = (jobDescription: string, masterData: string) =>
  `instruction: You are a resume expert.
  Filter and format the user's master resume data into the requested structure specifically for the Job Description: "${jobDescription}".

  User Data:
  ${masterData}`;

export const REVIEW_SYSTEM_INSTRUCTION =
  "You are a senior technical recruiter reviewing a tailored resume against a job description. Only comment on relevance, gaps, and JD-keyword alignment. Do not rewrite content.";

export const reviewUserPrompt = (jobDescription: string, draftJson: string) =>
  `You are reviewing the following resume draft against the job description below.

Job Description:
${jobDescription}

Resume Draft:
${draftJson}`;

export const REFINE_SYSTEM_INSTRUCTION =
  "You are a resume expert refining your earlier draft based on reviewer feedback. Apply the comments without exceeding the truthfulness of the original master data. Do not invent experience or skills not present in the original draft.";

export const refineUserPrompt = (jobDescription: string, masterData: string, draftJson: string, commentsJson: string) =>
  `You produced the following resume draft. A reviewer has critiqued it. Apply the actionable feedback while staying truthful to the user's master data.

Job Description:
${jobDescription}

Original Master Data (source of truth — do not invent anything beyond this):
${masterData}

Your Draft:
${draftJson}

Reviewer Comments:
${commentsJson}`;
