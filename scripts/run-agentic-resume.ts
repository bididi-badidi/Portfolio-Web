/**
 * CLI runner for the agentic resume workflow.
 *
 * Usage:
 *   bun --env-file=.env.local run scripts/run-agentic-resume.ts --jd-file=<path> [--out=<path>]
 *   bun run resume:agentic -- --jd-file=<path>
 *
 * Self-contained: does not import Next.js server-only modules.
 * Requires env vars: GEMINI_API_KEY, AWS_*, NEXT_PUBLIC_GEMINI_MODEL_*
 */

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { generateResume } from "../lib/docx";
import type { FinalResumeData, ResumeEntry, SkillsData } from "../app/interfaces/Resume";

// --- helpers ---

const getArg = (prefix: string) => process.argv.find((a) => a.startsWith(prefix))?.split("=")[1];

const log = (stage: string, msg?: string) => console.log(`[agentic-resume:${stage}]${msg ? " " + msg : ""}`);

const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  AWS_REGION: process.env.AWS_REGION ?? "",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME ?? "",
  MODEL_RESUME:
    process.env.NEXT_PUBLIC_GEMINI_MODEL_RESUME ?? process.env.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT ?? "gemini-2.0-flash",
  MODEL_REVIEWER:
    process.env.NEXT_PUBLIC_GEMINI_MODEL_RESUME_REVIEWER ??
    process.env.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT ??
    "gemini-2.0-flash",
};

// --- Gemini ---

async function geminiJSON<T>(
  model: string,
  systemInstruction: string,
  userPrompt: string,
  schema: unknown,
): Promise<T> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  });

  const json = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    error?: { message?: string };
  };
  if (!response.ok) throw new Error(json.error?.message ?? `Gemini error ${response.status}`);

  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  if (!text) throw new Error("Empty Gemini response");
  return JSON.parse(text) as T;
}

// --- S3 ---

async function fetchMasterResume(): Promise<FinalResumeData> {
  const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const res = await s3.send(new GetObjectCommand({ Bucket: env.AWS_BUCKET_NAME, Key: "master_data.json" }));
  const str = await res.Body?.transformToString();
  if (!str) throw new Error("Empty master_data.json from S3");
  return JSON.parse(str) as FinalResumeData;
}

// --- schemas (mirrored from agent files) ---

const ResumeEntrySchema = {
  type: "OBJECT",
  required: ["title", "role", "date", "bullets"],
  properties: {
    title: { type: "STRING" },
    role: { type: "STRING" },
    date: { type: "STRING" },
    bullets: { type: "ARRAY", items: { type: "STRING" } },
  },
};

const DraftSchema = {
  type: "OBJECT",
  required: ["summary", "Work Experiences & Internships", "Personal Projects", "Leadership Experiences", "skills"],
  properties: {
    summary: { type: "STRING" },
    "Work Experiences & Internships": { type: "ARRAY", items: ResumeEntrySchema },
    "Personal Projects": { type: "ARRAY", items: ResumeEntrySchema },
    "Leadership Experiences": { type: "ARRAY", items: ResumeEntrySchema },
    skills: {
      type: "OBJECT",
      required: ["Technical", "Soft Skills", "Interests"],
      properties: {
        Technical: { type: "STRING" },
        "Soft Skills": { type: "STRING" },
        Interests: { type: "STRING" },
      },
    },
  },
};

interface ResumeDraft {
  summary: string;
  "Work Experiences & Internships": ResumeEntry[];
  "Personal Projects": ResumeEntry[];
  "Leadership Experiences": ResumeEntry[];
  skills: SkillsData;
}

interface ReviewComments {
  overallRelevance: number;
  summaryFeedback: string;
  sectionFeedback: { section: string; entryTitle?: string; issue: string; suggestion: string }[];
  missingKeywords: string[];
}

const ReviewSchema = {
  type: "OBJECT",
  required: ["overallRelevance", "summaryFeedback", "sectionFeedback", "missingKeywords"],
  properties: {
    overallRelevance: { type: "NUMBER" },
    summaryFeedback: { type: "STRING" },
    sectionFeedback: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["section", "issue", "suggestion"],
        properties: {
          section: { type: "STRING" },
          entryTitle: { type: "STRING" },
          issue: { type: "STRING" },
          suggestion: { type: "STRING" },
        },
      },
    },
    missingKeywords: { type: "ARRAY", items: { type: "STRING" } },
  },
};

// --- main ---

const main = async () => {
  const jdFilePath = getArg("--jd-file=");
  const outputPath = resolve(getArg("--out=") ?? `./zi-shen-chan-agentic-resume.docx`);

  if (!jdFilePath) {
    console.error("Usage: bun --env-file=.env.local run scripts/run-agentic-resume.ts --jd-file=<path> [--out=<path>]");
    process.exit(1);
  }
  if (!env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY in environment.");
    process.exit(1);
  }

  const jobDescription = await readFile(resolve(jdFilePath), "utf-8");
  log("init", `JD loaded (${jobDescription.length} chars)`);

  log("master", "Fetching master resume from S3...");
  const masterResume = await fetchMasterResume();
  const masterDataStr = JSON.stringify(masterResume);
  log("master", "Done.");

  log("draft", "Agent 1: drafting tailored resume...");
  const draft = await geminiJSON<ResumeDraft>(
    env.MODEL_RESUME,
    "You are a resume expert that tailors resumes to job descriptions.",
    `instruction: You are a resume expert.\nFilter and format the user's master resume data into the requested structure specifically for the Job Description: "${jobDescription}".\n\nUser Master Data:\n${masterDataStr}`,
    DraftSchema,
  );
  log("draft", "Done.");

  log("review", "Agent 2: reviewing draft against JD...");
  const comments = await geminiJSON<ReviewComments>(
    env.MODEL_REVIEWER,
    "You are a senior technical recruiter reviewing a tailored resume against a job description. Only comment on relevance, gaps, and JD-keyword alignment. Do not rewrite content.",
    `You are reviewing the following resume draft against the job description below.\n\nJob Description:\n${jobDescription}\n\nResume Draft:\n${JSON.stringify(draft, null, 2)}`,
    ReviewSchema,
  );
  log(
    "review",
    `Done. Relevance: ${comments.overallRelevance}/10. Issues: ${comments.sectionFeedback.length}. Missing keywords: ${comments.missingKeywords.join(", ") || "none"}.`,
  );

  log("refine", "Agent 3: refining based on feedback...");
  const refined = await geminiJSON<ResumeDraft>(
    env.MODEL_RESUME,
    "You are a resume expert refining your earlier draft based on reviewer feedback. Apply the comments without exceeding the truthfulness of the original master data. Do not invent experience or skills not present in the original draft.",
    `You produced the following resume draft. A reviewer has critiqued it. Apply the actionable feedback while staying truthful to the user's master data.\n\nJob Description:\n${jobDescription}\n\nOriginal Master Data (source of truth):\n${masterDataStr}\n\nYour Draft:\n${JSON.stringify(draft, null, 2)}\n\nReviewer Comments:\n${JSON.stringify(comments, null, 2)}`,
    DraftSchema,
  );
  log("refine", "Done.");

  const finalData: FinalResumeData = {
    header: masterResume.header,
    education: masterResume.education,
    ...refined,
  };

  log("docx", "Generating .docx...");
  const blob = await generateResume(finalData);
  const buffer = Buffer.from(await blob.arrayBuffer());

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);

  log("done", `Resume written to: ${outputPath}`);
};

main().catch((err) => {
  console.error("[agentic-resume:error]", err instanceof Error ? err.message : err);
  process.exit(1);
});
