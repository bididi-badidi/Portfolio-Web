import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "zod";

const ResumeEntrySchema = z.object({
  title: z.string(),
  role: z.string(),
  date: z.string(),
  bullets: z.array(z.string()),
});

const SkillsSchema = z.object({
  Technical: z.string(),
  "Soft Skills": z.string().optional().default(""),
  Interests: z.string().optional().default(""),
});

const ResumeDraftSchema = z.object({
  summary: z.string(),
  "Work Experiences & Internships": z.array(ResumeEntrySchema),
  "Personal Projects": z.array(ResumeEntrySchema),
  "Leadership Experiences": z.array(ResumeEntrySchema),
  skills: SkillsSchema,
});

const HeaderLinkSchema = z.object({
  label: z.string(),
  text: z.string(),
  url: z.string(),
});

const HeaderSchema = z.object({
  name: z.string(),
  contact: z.string(),
  links: z.array(HeaderLinkSchema),
});

const EducationEntrySchema = z.object({
  institution: z.string(),
  degree: z.string(),
  gpa: z.string(),
  date: z.string(),
});

const MasterResumeSchema = ResumeDraftSchema.extend({
  header: HeaderSchema,
  education: z.array(EducationEntrySchema),
});

const StageStatusSchema = z.enum(["pending", "running", "done", "error", "skipped"]);

const DraftStageSchema = z.object({
  status: StageStatusSchema,
  output: ResumeDraftSchema.optional(),
  ranAt: z.string().optional(),
  error: z.string().optional(),
});

const CommentStageSchema = z.object({
  status: StageStatusSchema,
  comments: z.string().optional(),
  ranAt: z.string().optional(),
  error: z.string().optional(),
});

export const RunStateSchema = z.object({
  version: z.literal(1),
  createdAt: z.string(),
  jobDescription: z.string(),
  outputFilename: z.string().optional(),
  masterResume: MasterResumeSchema,
  models: z.object({
    drafter: z.string(),
    reviewer: z.string(),
    refiner: z.string(),
  }),
  stages: z.object({
    draft: DraftStageSchema,
    review: CommentStageSchema,
    factcheck: CommentStageSchema,
    refine: DraftStageSchema,
  }),
});

export const CompleteDraftStageSchema = DraftStageSchema.extend({
  status: z.literal("done"),
  output: ResumeDraftSchema,
});

export const CompleteCommentStageSchema = CommentStageSchema.extend({
  status: z.literal("done"),
  comments: z.string().min(1),
});

export type RunState = z.infer<typeof RunStateSchema>;
export type ResumeDraft = z.infer<typeof ResumeDraftSchema>;
export type RunStage = keyof RunState["stages"];

export function createInitialState(input: {
  jobDescription: string;
  masterResume: RunState["masterResume"];
  models: RunState["models"];
}): RunState {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    jobDescription: input.jobDescription,
    masterResume: input.masterResume,
    models: input.models,
    stages: {
      draft: { status: "pending" },
      review: { status: "pending" },
      factcheck: { status: "pending" },
      refine: { status: "pending" },
    },
  };
}

export async function readRunState(path: string): Promise<RunState> {
  const raw = await readFile(path, "utf-8");
  return RunStateSchema.parse(JSON.parse(raw));
}

export async function writeRunState(path: string, state: RunState): Promise<void> {
  const parsed = RunStateSchema.parse(state);
  await mkdir(dirname(path), { recursive: true });

  const tmpPath = join(
    dirname(path),
    `.${Date.now()}-${Math.random().toString(16).slice(2)}.run-state.tmp`,
  );
  await writeFile(tmpPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf-8");
  await rename(tmpPath, path);
}

export async function patchRunState(
  path: string,
  patcher: (state: RunState) => RunState | void,
): Promise<RunState> {
  const state = await readRunState(path);
  const next = patcher(state) ?? state;
  await writeRunState(path, next);
  return next;
}

export function assertStageDone(state: RunState, stage: RunStage): void {
  const value = state.stages[stage];
  if (stage === "review" || stage === "factcheck") {
    CompleteCommentStageSchema.parse(value);
    return;
  }
  CompleteDraftStageSchema.parse(value);
}

export function buildFinalResumeData(state: RunState) {
  const refined = CompleteDraftStageSchema.parse(state.stages.refine).output;

  return {
    header: state.masterResume.header,
    education: state.masterResume.education,
    ...refined,
  };
}
