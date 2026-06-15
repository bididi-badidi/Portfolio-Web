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

export async function runClaude(options: AgentRunOptions): Promise<string> {
  const args = [
    "-p",
    "--add-dir",
    options.workdir,
    "--output-format",
    "text",
    ...(options.model ? ["--model", options.model] : []),
    options.prompt,
  ];

  if (options.dryRun) {
    await writeAgentLog(options.logPath, ["$ claude", ...args].join(" "));
    return "";
  }

  const { stdout, stderr, exitCode } = await runProcess("claude", args, options.workdir);

  await writeAgentLog(
    options.logPath,
    [
      ["$ claude", ...args].join(" "),
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
    throw new Error(`claude exited with ${exitCode}; see ${options.logPath}`);
  }

  const comments = stdout.trim();
  if (!comments) {
    throw new Error(`claude returned empty stdout; see ${options.logPath}`);
  }

  return comments;
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
