import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { generateResume } from "../../lib/docx";
import { runClaude } from "./agents/runClaude";
import { runCodex } from "./agents/runCodex";
import {
  assertStageDone,
  buildFinalResumeData,
  createInitialState,
  patchRunState,
  readRunState,
  RunStateSchema,
  writeRunState,
  type RunStage,
} from "./agents/stateFile";

type CliStage = RunStage | "docx";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, "../..");
const PROMPT_DIR = join(SCRIPT_DIR, "prompts");
const DEFAULT_OUT_DIR = "/Users/user/Downloads";
const DEFAULT_OUT_FILENAME = "zishenchan-resume.docx";
const STAGE_ORDER: CliStage[] = ["draft", "review", "factcheck", "refine", "docx"];

const nowStamp = () => new Date().toISOString().replace(/[:.]/g, "-");
const log = (stage: string, message: string) => console.log(`[codex-claude-resume:${stage}] ${message}`);

function readArg(name: string): string | undefined {
  const prefix = `${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function parseStage(value: string | undefined, flag: string): CliStage | undefined {
  if (!value) return undefined;
  if ((STAGE_ORDER as string[]).includes(value)) return value as CliStage;
  throw new Error(`${flag} must be one of: ${STAGE_ORDER.join(", ")}`);
}

async function readJobDescription(): Promise<string> {
  const jdFilePath = readArg("--jd-file");
  const jdInline = readArg("--jd");

  if (jdInline) return jdInline;
  if (jdFilePath) return readFile(resolve(jdFilePath), "utf-8");

  throw new Error("Usage: bun run scripts/codex-claude-resume/run.ts --jd-file=<path>|--jd=<text> [--out=<path>]");
}

async function resolveOutputPath(requestedPath: string): Promise<string> {
  const ext = extname(requestedPath) || ".docx";
  const base = requestedPath.endsWith(ext) ? requestedPath.slice(0, -ext.length) : requestedPath;
  let candidate = requestedPath.endsWith(ext) ? requestedPath : `${requestedPath}${ext}`;
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

function sanitizeDocxFilename(filename: string | undefined): string {
  const fallback = DEFAULT_OUT_FILENAME;
  const base = basename(filename?.trim() || fallback)
    .replace(/\.docx$/i, "")
    .replace(/[^a-zA-Z0-9._ -]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[-_.]+$/g, "");

  return `${base || fallback.replace(/\.docx$/i, "")}.docx`;
}

function requestedOutputPath(statePath: string, explicitOutPath?: string): Promise<string> {
  if (explicitOutPath) return Promise.resolve(resolve(explicitOutPath));

  return readRunState(statePath).then((state) =>
    join(DEFAULT_OUT_DIR, sanitizeDocxFilename(state.outputFilename)),
  );
}

async function fetchMasterResume() {
  const masterFile = readArg("--master-file");
  if (masterFile) {
    const raw = await readFile(resolve(masterFile), "utf-8");
    return RunStateSchema.shape.masterResume.parse(JSON.parse(raw));
  }

  const required = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_BUCKET_NAME"] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing ${missing.join(", ")}. Pass --master-file=<path> to use a local master resume JSON.`);
  }

  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const key = process.env.MASTER_RESUME_S3_KEY ?? "master_data.json";
  const response = await s3.send(new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }));
  const raw = await response.Body?.transformToString();
  if (!raw) throw new Error(`Empty ${key} from S3`);
  return RunStateSchema.shape.masterResume.parse(JSON.parse(raw));
}

async function ensureRunState(runDir: string, statePath: string, fromStage?: CliStage) {
  if (fromStage) {
    await access(statePath);
    return readRunState(statePath);
  }

  try {
    await access(statePath);
    return readRunState(statePath);
  } catch {
    const jobDescription = await readJobDescription();
    log("init", `JD loaded (${jobDescription.length} chars)`);
    log("master", "Loading master resume...");
    const masterResume = await fetchMasterResume();
    const state = createInitialState({
      jobDescription,
      masterResume,
      models: {
        drafter: readArg("--codex-model") ?? "gpt-5.5",
        reviewer: readArg("--claude-model") ?? "sonnet",
        refiner: readArg("--codex-model") ?? "gpt-5.5",
      },
    });
    await mkdir(runDir, { recursive: true });
    await writeRunState(statePath, state);
    return state;
  }
}

async function promptFor(stage: RunStage, statePath: string): Promise<string> {
  const prompt = await readFile(join(PROMPT_DIR, `${stage}.md`), "utf-8");
  return `${prompt.trim()}\n\n-- ${statePath}`;
}

async function markRunning(statePath: string, stage: RunStage): Promise<void> {
  await patchRunState(statePath, (state) => {
    state.stages[stage] = { ...state.stages[stage], status: "running", ranAt: new Date().toISOString() };
  });
}

async function runAgentStage(stage: RunStage, statePath: string, runDir: string, dryRun: boolean): Promise<void> {
  const state = await readRunState(statePath);
  await markRunning(statePath, stage);

  const logPath = join(runDir, "logs", `${stage}.log`);
  const prompt = await promptFor(stage, statePath);

  try {
    if (stage === "draft" || stage === "refine") {
      await runCodex({
        workdir: ROOT,
        prompt,
        logPath,
        model: stage === "draft" ? state.models.drafter : state.models.refiner,
        dryRun,
      });
    } else {
      const comments = await runClaude({
        workdir: ROOT,
        prompt,
        logPath,
        model: state.models.reviewer,
        dryRun,
      });
      if (!dryRun) {
        await patchRunState(statePath, (next) => {
          next.stages[stage] = {
            status: "done",
            comments,
            ranAt: new Date().toISOString(),
          };
        });
      }
    }
  } catch (error) {
    await patchRunState(statePath, (next) => {
      next.stages[stage] = {
        ...next.stages[stage],
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      };
    });
    throw error;
  }

  if (dryRun) {
    await patchRunState(statePath, (next) => {
      next.stages[stage] = { ...next.stages[stage], status: "skipped" };
    });
    log(stage, `dry run command written to ${logPath}`);
    return;
  }

  const updated = await readRunState(statePath);
  assertStageDone(updated, stage);
  log(stage, "done");
}

async function writeDocx(statePath: string, outPath: string): Promise<string> {
  const state = await readRunState(statePath);
  assertStageDone(state, "refine");

  const finalData = buildFinalResumeData(state);
  const blob = await generateResume(finalData);
  const buffer = Buffer.from(await blob.arrayBuffer());

  const finalOutputPath = await resolveOutputPath(resolve(outPath));
  await mkdir(dirname(finalOutputPath), { recursive: true });
  await writeFile(finalOutputPath, buffer);
  return finalOutputPath;
}

function stagesToRun(fromStage?: CliStage, onlyStage?: CliStage): CliStage[] {
  if (onlyStage) return [onlyStage];
  if (!fromStage) return STAGE_ORDER;

  const index = STAGE_ORDER.indexOf(fromStage);
  return STAGE_ORDER.slice(index);
}

async function main() {
  const fromStage = parseStage(readArg("--from"), "--from");
  const onlyStage = parseStage(readArg("--only"), "--only");
  const dryRun = hasFlag("--dry-run");
  const runDir = resolve(readArg("--run-dir") ?? join(".ai", "runs", `resume-${nowStamp()}`));
  const statePath = join(runDir, "run-state.json");
  const outPath = readArg("--out");

  await ensureRunState(runDir, statePath, fromStage);
  log("init", `run dir: ${runDir}`);

  for (const stage of stagesToRun(fromStage, onlyStage)) {
    if (stage === "docx") {
      if (dryRun) {
        log("docx", `dry run; would write ${await requestedOutputPath(statePath, outPath)}`);
        continue;
      }
      const finalPath = await writeDocx(statePath, await requestedOutputPath(statePath, outPath));
      log("docx", `resume written to ${finalPath}`);
      continue;
    }

    await runAgentStage(stage, statePath, runDir, dryRun);
  }

  log("done", `state file: ${statePath}`);
}

main().catch((error) => {
  console.error("[codex-claude-resume:error]", error instanceof Error ? error.message : error);
  process.exit(1);
});
