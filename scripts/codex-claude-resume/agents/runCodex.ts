import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { spawn } from "node:child_process";

export interface AgentRunOptions {
  workdir: string;
  prompt: string;
  logPath: string;
  model?: string;
  dryRun?: boolean;
}

export async function runCodex(options: AgentRunOptions): Promise<void> {
  const args = [
    "exec",
    "--cd",
    options.workdir,
    "--skip-git-repo-check",
    ...(options.model ? ["--model", options.model] : []),
    options.prompt,
  ];

  if (options.dryRun) {
    await writeAgentLog(options.logPath, ["$ codex", ...args].join(" "));
    return;
  }

  const { stdout, stderr, exitCode } = await runProcess("codex", args, options.workdir);

  await writeAgentLog(
    options.logPath,
    [
      ["$ codex", ...args].join(" "),
      "",
      "## stdout",
      stdout.trim(),
      "",
      "## stderr",
      stderr.trim(),
      "",
      `## exitCode ${exitCode}`,
    ].join("\n"),
  );

  if (exitCode !== 0) {
    throw new Error(`codex exited with ${exitCode}; see ${options.logPath}`);
  }
}

async function writeAgentLog(path: string, contents: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${contents.trim()}\n`, "utf-8");
}

async function runProcess(
  command: string,
  args: string[],
  cwd: string,
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (exitCode) => {
      resolve({
        stdout: Buffer.concat(stdout).toString("utf-8"),
        stderr: Buffer.concat(stderr).toString("utf-8"),
        exitCode,
      });
    });
  });
}
