import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { fetchChatbotReply } from "@/app/lib/chatbot/fetchReply";
import type { ChatInstance, KnowledgeItem } from "@/app/interfaces/Chatbot";
import type { FinalResumeData, ResumeEntry } from "@/app/interfaces/Resume";

export const runtime = "nodejs";
export const maxDuration = 60;

type EvalChatbotRequest = {
  question?: string;
  chatHistory?: ChatInstance[];
  enableFunctionCalling?: boolean;
};

const defaultKnowledgePath = path.join(process.cwd(), ".ai/eval/fixtures/knowledge/knowledge.json");
const defaultResumePath = path.join(process.cwd(), ".ai/eval/fixtures/knowledge/master_resume.json");

async function loadKnowledgeContexts(): Promise<string[]> {
  const fixturePath = process.env.EVAL_KNOWLEDGE_FIXTURE_PATH ?? defaultKnowledgePath;
  const raw = await readFile(fixturePath, "utf8");
  const parsed = JSON.parse(raw) as KnowledgeItem[] | { knowledge?: KnowledgeItem[] };
  const items = Array.isArray(parsed) ? parsed : parsed.knowledge ?? [];

  return items.map((item) => [item.title, item.summary, item.content].filter(Boolean).join("\n"));
}

function serializeEntries(label: string, entries: ResumeEntry[]): string {
  return [
    label,
    ...entries.map((e) => [`${e.title} — ${e.role} (${e.date})`, ...e.bullets].join("\n")),
  ].join("\n");
}

async function loadResumeContexts(): Promise<string[]> {
  const fixturePath = process.env.EVAL_RESUME_FIXTURE_PATH ?? defaultResumePath;
  const raw = await readFile(fixturePath, "utf8");
  const data = JSON.parse(raw) as FinalResumeData;

  const { header, education, summary, skills } = data;
  const workEntries = data["Work Experiences & Internships"] ?? [];
  const projectEntries = data["Personal Projects"] ?? [];
  const leadershipEntries = data["Leadership Experiences"] ?? [];

  return [
    [header.name, header.contact, ...header.links.map((l) => `${l.label}: ${l.url}`)].join("\n"),
    summary,
    education.map((e) => `${e.institution} — ${e.degree} (${e.date})`).join("\n"),
    serializeEntries("Work Experiences & Internships", workEntries),
    serializeEntries("Personal Projects", projectEntries),
    serializeEntries("Leadership Experiences", leadershipEntries),
    `Technical: ${skills.Technical}\nSoft Skills: ${skills["Soft Skills"]}\nInterests: ${skills.Interests}`,
  ].filter(Boolean);
}

async function loadFixtureContexts(): Promise<string[]> {
  const [knowledge, resume] = await Promise.all([loadKnowledgeContexts(), loadResumeContexts()]);
  return [...knowledge, ...resume];
}

function buildHistory(body: EvalChatbotRequest): ChatInstance[] {
  if (Array.isArray(body.chatHistory) && body.chatHistory.length > 0) {
    return body.chatHistory;
  }

  const question = body.question?.trim();
  if (!question) {
    return [];
  }

  return [{ id: "eval-user-message", role: "user", message: question }];
}

export async function POST(request: NextRequest) {
  if (process.env.EVAL_MODE !== "1") {
    return NextResponse.json({ error: "Eval routes are disabled" }, { status: 404 });
  }

  const body = (await request.json()) as EvalChatbotRequest;
  const chatHistory = buildHistory(body);
  if (chatHistory.length === 0) {
    return NextResponse.json({ error: "question or chatHistory is required" }, { status: 400 });
  }

  const reply = await fetchChatbotReply({
    chatHistory,
    enableFunctionCalling: body.enableFunctionCalling ?? true,
  });

  return NextResponse.json({
    answer: reply.message,
    error: reply.error,
    functionCall: reply.functionCall,
    contexts: await loadFixtureContexts(),
  });
}
