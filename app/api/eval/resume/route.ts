import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { draftResume, ResumeDraft } from "@/app/lib/chatbot/agenticResume/draftResume";
import { ResumeEntry } from "@/app/interfaces/Resume";

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

function formatEntry(entry: ResumeEntry): string {
  const heading = [entry.title, entry.role, entry.date].filter(Boolean).join(" - ");
  const bullets = entry.bullets.map((bullet) => `  - ${bullet}`).join("\n");
  return `${heading}\n${bullets}`;
}

function formatEntries(title: string, entries: ResumeEntry[]): string {
  if (entries.length === 0) {
    return `${title}\nNone selected.`;
  }

  return `${title}\n${entries.map(formatEntry).join("\n\n")}`;
}

function formatResumeDraft(draft: ResumeDraft): string {
  return [
    `Summary\n${draft.summary}`,
    formatEntries("Work Experiences & Internships", draft["Work Experiences & Internships"]),
    formatEntries("Personal Projects", draft["Personal Projects"]),
    formatEntries("Leadership Experiences", draft["Leadership Experiences"]),
    `Skills\nTechnical: ${draft.skills.Technical}`,
  ].join("\n\n");
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
    answer: formatResumeDraft(draft),
    contexts: body.contexts ?? [masterResume],
  });
}
