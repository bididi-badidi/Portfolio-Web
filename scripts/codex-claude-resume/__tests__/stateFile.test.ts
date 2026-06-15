import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "bun:test";
import {
  assertStageDone,
  buildFinalResumeData,
  createInitialState,
  patchRunState,
  readRunState,
  writeRunState,
} from "../agents/stateFile";

const masterResume = {
  header: {
    name: "Test Candidate",
    contact: "test@example.com",
    links: [{ label: "GitHub", text: "example", url: "https://example.com" }],
  },
  education: [
    {
      institution: "Test University",
      degree: "BSc Computer Science",
      gpa: "4.0",
      date: "2024 - 2027",
    },
  ],
  summary: "General summary",
  "Work Experiences & Internships": [],
  "Personal Projects": [],
  "Leadership Experiences": [],
  skills: {
    Technical: "TypeScript",
    "Soft Skills": "Communication",
    Interests: "AI",
  },
};

const draft = {
  summary: "Tailored summary",
  "Work Experiences & Internships": [],
  "Personal Projects": [
    {
      title: "Portfolio",
      role: "Developer",
      date: "2026",
      bullets: ["Built a portfolio."],
    },
  ],
  "Leadership Experiences": [],
  skills: {
    Technical: "TypeScript, Next.js",
    "Soft Skills": "Communication",
    Interests: "AI",
  },
};

describe("codex-claude resume state file", () => {
  it("writes, reads, and patches run state atomically", async () => {
    const dir = await mkdtemp(join(tmpdir(), "resume-state-"));
    const path = join(dir, "run-state.json");
    const state = createInitialState({
      jobDescription: "Build AI tools",
      masterResume,
      models: {
        drafter: "codex-test",
        reviewer: "claude-test",
        refiner: "codex-test",
      },
    });

    await writeRunState(path, state);
    await patchRunState(path, (next) => {
      next.outputFilename = "test-ai-tools-resume.docx";
      next.stages.draft = {
        status: "done",
        ranAt: "2026-06-14T00:00:00.000Z",
        output: draft,
      };
    });

    const raw = await readFile(path, "utf-8");
    expect(raw.endsWith("\n")).toBe(true);

    const updated = await readRunState(path);
    assertStageDone(updated, "draft");
    expect(updated.outputFilename).toBe("test-ai-tools-resume.docx");
    expect(updated.stages.draft.output?.summary).toBe("Tailored summary");
  });

  it("builds final resume data from the refined stage", async () => {
    const state = createInitialState({
      jobDescription: "Build AI tools",
      masterResume,
      models: {
        drafter: "codex-test",
        reviewer: "claude-test",
        refiner: "codex-test",
      },
    });
    state.stages.refine = {
      status: "done",
      ranAt: "2026-06-14T00:00:00.000Z",
      output: draft,
    };

    const finalData = buildFinalResumeData(state);
    expect(finalData.header.name).toBe("Test Candidate");
    expect(finalData.summary).toBe("Tailored summary");
    expect(finalData["Personal Projects"][0]?.title).toBe("Portfolio");
  });
});
