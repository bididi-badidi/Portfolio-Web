import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { draftResume } from "@/app/lib/chatbot/agenticResume/draftResume";

export const runtime = "nodejs";
export const maxDuration = 60;

type EvalResumeRequest = {
  question?: string;
  jobDescription?: string;
  contexts?: string[];
};

const defaultMasterResumePath = path.join(process.cwd(), ".ai/eval/fixtures/knowledge/master_resume.json");

async function loadMasterResume() {
  const fixturePath = process.env.EVAL_MASTER_RESUME_FIXTURE_PATH ?? defaultMasterResumePath;
  return readFile(fixturePath, "utf8");
}

export async function POST(request: NextRequest) {
  if (process.env.EVAL_MODE !== "1") {
    return NextResponse.json({ error: "Eval routes are disabled" }, { status: 404 });
  }

  const body = (await request.json()) as EvalResumeRequest;
  const jobDescription = (body.jobDescription ?? body.question)?.trim();
  if (!jobDescription) {
    return NextResponse.json({ error: "jobDescription or question is required" }, { status: 400 });
  }

  const masterResume = await loadMasterResume();
  const draft = await draftResume(jobDescription, masterResume);

  return NextResponse.json({
    answer: JSON.stringify(draft),
    contexts: body.contexts ?? [masterResume],
  });
}
