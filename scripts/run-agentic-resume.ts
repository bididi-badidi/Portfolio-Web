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

import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import { resolve, dirname, extname } from "node:path";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { generateResume } from "../lib/docx";
import type { FinalResumeData, ResumeEntry, SkillsData } from "../app/interfaces/Resume";
import {
  DRAFT_SYSTEM_INSTRUCTION,
  draftUserPrompt,
  REVIEW_SYSTEM_INSTRUCTION,
  reviewUserPrompt,
  FACTCHECK_SYSTEM_INSTRUCTION,
  factcheckUserPrompt,
  REFINE_SYSTEM_INSTRUCTION,
  refineUserPrompt,
} from "../app/lib/chatbot/agenticResume/prompts";

// --- helpers ---

const getArg = (prefix: string) => process.argv.find((a) => a.startsWith(prefix))?.split("=")[1];

async function resolveOutputPath(requestedPath: string): Promise<string> {
  const ext = extname(requestedPath);
  const base = requestedPath.slice(0, -ext.length);
  let candidate = requestedPath;
  let version = 2;
  while (true) {
    try {
      await access(candidate);
      candidate = `${base}-v${version}${ext}`;
      version++;
    } catch {
      return candidate;
    }
  }
}

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
    "gemini-3.1-pro",
};

// --- AI SDK ---

const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
});

type GoogleTextModelId = Parameters<typeof google>[0];

async function aiSdkJSON<T>(
  model: string,
  systemInstruction: string,
  userPrompt: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const result = await generateObject({
    model: google(model as GoogleTextModelId),
    system: systemInstruction,
    prompt: userPrompt,
    schema,
  });

  return result.object;
}

async function aiSdkText(model: string, systemInstruction: string, userPrompt: string): Promise<string> {
  const result = await generateText({
    model: google(model as GoogleTextModelId),
    system: systemInstruction,
    prompt: userPrompt,
  });
  const text = result.text;
  if (!text) throw new Error("Empty Gemini response");
  return text;
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

const ResumeEntrySchema = z.object({
  title: z.string(),
  role: z.string(),
  date: z.string(),
  bullets: z.array(z.string()),
});

const DraftSchema = z.object({
  summary: z.string(),
  "Work Experiences & Internships": z.array(ResumeEntrySchema),
  "Personal Projects": z.array(ResumeEntrySchema),
  "Leadership Experiences": z.array(ResumeEntrySchema),
  skills: z.object({
    Technical: z.string(),
    "Soft Skills": z.string(),
    Interests: z.string(),
  }),
});

interface ResumeDraft {
  summary: string;
  "Work Experiences & Internships": ResumeEntry[];
  "Personal Projects": ResumeEntry[];
  "Leadership Experiences": ResumeEntry[];
  skills: SkillsData;
}


// --- main ---

const main = async () => {
  const jdFilePath = getArg("--jd-file=");
  const jdInline = getArg("--jd=");
  const outputPath = resolve(getArg("--out=") ?? `/Users/user/Downloads/zishenchan-resume.docx`);

  if (!jdFilePath && !jdInline) {
    console.error("Usage: bun --env-file=.env.local run scripts/run-agentic-resume.ts --jd-file=<path>|--jd=<text> [--out=<path>]");
    process.exit(1);
  }
  if (!env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY in environment.");
    process.exit(1);
  }

  const jobDescription = jdInline ?? await readFile(resolve(jdFilePath!), "utf-8");
  log("init", `JD loaded (${jobDescription.length} chars)`);
  log("init", `Models — draft/refine: ${env.MODEL_RESUME} | reviewer: ${env.MODEL_REVIEWER}`);

  log("master", "Fetching master resume from S3...");
  const masterResume = await fetchMasterResume();
  const masterDataStr = JSON.stringify(masterResume);
  log("master", "Done.");

  log("draft", "Agent 1: drafting tailored resume...");
  const draft = await aiSdkJSON(
    env.MODEL_RESUME,
    DRAFT_SYSTEM_INSTRUCTION,
    draftUserPrompt(jobDescription, masterDataStr),
    DraftSchema,
  );
  log("draft", "Done.");

  log("review", "Agent 2a + 2b: running reviewer and fact-checker concurrently...");
  const draftJson = JSON.stringify(draft, null, 2);
  const [reviewComments, factCheckComments] = await Promise.all([
    aiSdkText(env.MODEL_REVIEWER, REVIEW_SYSTEM_INSTRUCTION, reviewUserPrompt(jobDescription, draftJson)),
    aiSdkText(env.MODEL_REVIEWER, FACTCHECK_SYSTEM_INSTRUCTION, factcheckUserPrompt(masterDataStr, draftJson)),
  ]);
  log("factcheck", `\n${factCheckComments}`);

  log("refine", "Agent 3: refining based on feedback...");
  const refined = await aiSdkJSON(
    env.MODEL_RESUME,
    REFINE_SYSTEM_INSTRUCTION,
    refineUserPrompt(jobDescription, masterDataStr, draftJson, reviewComments, factCheckComments),
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

  const finalOutputPath = await resolveOutputPath(outputPath);
  await mkdir(dirname(finalOutputPath), { recursive: true });
  await writeFile(finalOutputPath, buffer);

  log("done", `Resume written to: ${finalOutputPath}`);
};

main().catch((err) => {
  console.error("[agentic-resume:error]", err instanceof Error ? err.message : err);
  process.exit(1);
});
