import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { fetchFunctionCalls } from "../../fetchFunctionCalls";
import { fetchExcDecisionStruct } from "../../fetchFunctionApproval";
import { fetchChatbotReply } from "../../fetchReply";
import { GeminiService } from "../../geminiService";
import { FunctionCallType } from "@/app/enums/functionCall";
import { envClient } from "@/app/env/client";
import { envServer } from "@/app/env/server";
import { TEST_CONFIG, isLiveEvalMode } from "@/app/test/testConfig";
import { Type } from "@google/genai";

interface LiveGoldenThresholdConfig {
  overallPassRate: number;
  files?: Record<string, number>;
}

interface LiveGoldenCase {
  id: string;
  description: string;
  evalProfile?: string;
  useEvaluator?: boolean;
  timeoutMs?: number;
  request: {
    chatHistory: Array<{ role: string; message: string }>;
    enableFunctionCalling: boolean;
  };
  expected: {
    detectedFunctionName?: string | null;
    approved?: boolean | null;
    returnedFunctionCallName?: string | null;
    error?: boolean;
    messageContains?: string[];
    messageNotContains?: string[];
  };
}

interface LiveGoldenCaseGroup {
  group: string;
  cases: LiveGoldenCase[];
}

interface EvaluatorResult {
  verdict: "pass" | "fail";
  confidence: number;
  reasons: string[];
  notes?: string;
}

interface LoadedLiveGoldenCase extends LiveGoldenCase {
  sourceFile: string;
}

const rootJoin = (parts: readonly string[]) => join(process.cwd(), ...parts);
const CASES_DIR = rootJoin(TEST_CONFIG.live.casesDir);
const REPORT_DIR = rootJoin(TEST_CONFIG.live.reportDir);
const REPORT_PATH = join(REPORT_DIR, TEST_CONFIG.live.reportFilename);
const THRESHOLDS_PATH = join(CASES_DIR, TEST_CONFIG.live.thresholdsFilename);
const EVAL_DIR = join(CASES_DIR, TEST_CONFIG.live.evaluatorDirname);
const EVAL_SYSTEM_PATH = join(EVAL_DIR, TEST_CONFIG.live.evaluatorSystemFilename);
const EVAL_FUNCTIONS_PATH = join(EVAL_DIR, TEST_CONFIG.live.evaluatorFunctionsFilename);
const EVAL_PROFILES_PATH = join(EVAL_DIR, TEST_CONFIG.live.evaluatorProfilesFilename);
const DEFAULT_TIMEOUT_MS = TEST_CONFIG.timeouts.liveDefaultMs;
const describeLive = isLiveEvalMode() ? describe : describe.skip;

async function runPreflight() {
  const missing: string[] = [];
  const envValues: Record<(typeof TEST_CONFIG.live.requiredEnvKeys)[number], string | undefined> = {
    GEMINI_API_KEY: envServer.GEMINI_API_KEY,
    NEXT_PUBLIC_GEMINI_MODEL_DEFAULT: envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT,
    NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL: envClient.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL,
    NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL_APPROVER: envClient.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL_APPROVER,
    NEXT_PUBLIC_DEV_MODE: envClient.NEXT_PUBLIC_DEV_MODE,
  };
  const requiredEnv = TEST_CONFIG.live.requiredEnvKeys.map((name) => [name, envValues[name]] as const);

  for (const [name, value] of requiredEnv) {
    if (!value || !String(value).trim()) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Live eval preflight failed: missing required env vars: ${missing.join(", ")}.`);
  }

  try {
    await fetch("https://generativelanguage.googleapis.com", { method: "HEAD" });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`Live eval preflight failed: Gemini endpoint is unreachable from this environment (${reason}).`);
  }
}

const caseFilter = process.env.CASE;
const files = readdirSync(CASES_DIR)
  .filter(
    (f) =>
      f.endsWith(".json") &&
      f !== TEST_CONFIG.live.thresholdsFilename &&
      (!caseFilter || f.includes(caseFilter)),
  )
  .sort();
const allCases: LoadedLiveGoldenCase[] = [];
for (const file of files) {
  const raw = JSON.parse(readFileSync(join(CASES_DIR, file), "utf-8")) as LiveGoldenCase | LiveGoldenCaseGroup;
  if (Array.isArray((raw as LiveGoldenCaseGroup).cases)) {
    allCases.push(...(raw as LiveGoldenCaseGroup).cases.map((testCase) => ({ ...testCase, sourceFile: file })));
  } else {
    allCases.push({ ...(raw as LiveGoldenCase), sourceFile: file });
  }
}
const evaluatorSystemInstruction = readFileSync(EVAL_SYSTEM_PATH, "utf-8");
const evaluatorFunctionCatalog = JSON.parse(readFileSync(EVAL_FUNCTIONS_PATH, "utf-8"));
const evaluatorProfiles = JSON.parse(readFileSync(EVAL_PROFILES_PATH, "utf-8")) as Record<
  string,
  { name: string; instruction: string }
>;

function normalizeThreshold(value: number, label: string) {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid live golden threshold for ${label}: expected a number.`);
  }

  const normalized = value > 1 ? value / 100 : value;
  if (normalized < 0 || normalized > 1) {
    throw new Error(`Invalid live golden threshold for ${label}: expected 0-1 or 0-100.`);
  }

  return normalized;
}

function parseFileThresholds(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return {};

  if (trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as Record<string, number>;
    return Object.fromEntries(
      Object.entries(parsed).map(([file, threshold]) => [file, normalizeThreshold(threshold, file)]),
    );
  }

  return Object.fromEntries(
    trimmed.split(",").map((entry) => {
      const [file, threshold] = entry.split("=").map((part) => part.trim());
      if (!file || !threshold) {
        throw new Error(`Invalid GOLDEN_LIVE_FILE_THRESHOLDS entry: ${entry}`);
      }
      return [file, normalizeThreshold(Number(threshold), file)];
    }),
  );
}

function loadThresholdConfig(): LiveGoldenThresholdConfig {
  const defaults: LiveGoldenThresholdConfig = {
    overallPassRate: 1,
    files: {},
  };

  let fromFile: LiveGoldenThresholdConfig = defaults;
  try {
    fromFile = {
      ...defaults,
      ...(JSON.parse(readFileSync(THRESHOLDS_PATH, "utf-8")) as LiveGoldenThresholdConfig),
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      throw err;
    }
  }

  const overallPassRate =
    process.env.GOLDEN_LIVE_PASS_RATE_THRESHOLD === undefined
      ? fromFile.overallPassRate
      : normalizeThreshold(Number(process.env.GOLDEN_LIVE_PASS_RATE_THRESHOLD), "overall");

  const fileOverrides =
    process.env.GOLDEN_LIVE_FILE_THRESHOLDS === undefined
      ? {}
      : parseFileThresholds(process.env.GOLDEN_LIVE_FILE_THRESHOLDS);

  return {
    overallPassRate: normalizeThreshold(overallPassRate, "overall"),
    files: {
      ...(fromFile.files ?? {}),
      ...fileOverrides,
    },
  };
}

const thresholdConfig = loadThresholdConfig();

interface LiveGoldenSummary {
  reportId: string;
  reportPath?: string;
  timestamp: string;
  filesFound: number;
  total: number;
  passCount: number;
  failCount: number;
  passRate: number;
  thresholds: LiveGoldenThresholdConfig;
  fileSummaries: Array<{
    file: string;
    total: number;
    passCount: number;
    failCount: number;
    passRate: number;
    threshold: number | null;
    passedThreshold: boolean;
  }>;
  thresholdFailures: string[];
  models: {
    functionCallDetection: string;
    functionCallApprover: string;
    finalReply: string;
  };
  results: Array<{
    id: string;
    sourceFile: string;
    description: string;
    evalProfile: string;
    useEvaluator: boolean;
    passed: boolean;
    failures: string[];
    apiResults: Record<string, unknown>;
    trace: Record<string, unknown>;
    evaluatorSettings?: Record<string, unknown>;
    evaluatorInput?: Record<string, unknown>;
    evaluatorResult?: EvaluatorResult | null;
  }>;
  evaluator: {
    systemInstructionPath: string;
    functionCatalogPath: string;
    profilesPath: string;
    defaultModel: string;
  };
}

const summary: LiveGoldenSummary = {
  reportId: randomUUID(),
  timestamp: new Date().toISOString(),
  filesFound: files.length,
  total: allCases.length,
  passCount: 0,
  failCount: 0,
  passRate: 0,
  thresholds: thresholdConfig,
  fileSummaries: [],
  thresholdFailures: [],
  models: {
    functionCallDetection: envClient.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL,
    functionCallApprover: envClient.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL_APPROVER,
    finalReply: envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT,
  },
  results: [],
  evaluator: {
    systemInstructionPath: EVAL_SYSTEM_PATH,
    functionCatalogPath: EVAL_FUNCTIONS_PATH,
    profilesPath: EVAL_PROFILES_PATH,
    defaultModel: process.env.EVALUATOR_MODEL || envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT,
  },
};

interface DetectionResponse {
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionMessage?: string;
  error?: boolean;
}

interface ApprovalResponse {
  approve: boolean;
  reason: string;
}

interface ReplyResponse {
  message: string;
  error: boolean;
  functionCall?: { name: string; args?: Record<string, unknown> };
}

function updateSummaryThresholds() {
  summary.passRate = summary.total === 0 ? 0 : summary.passCount / summary.total;

  const fileSummaries = files.map((file) => {
    const fileResults = summary.results.filter((result) => result.sourceFile === file);
    const total = fileResults.length;
    const passCount = fileResults.filter((result) => result.passed).length;
    const failCount = total - passCount;
    const passRate = total === 0 ? 0 : passCount / total;
    const threshold = summary.thresholds.files?.[file] ?? null;

    return {
      file,
      total,
      passCount,
      failCount,
      passRate,
      threshold,
      passedThreshold: threshold === null || passRate >= threshold,
    };
  });

  const thresholdFailures: string[] = [];
  if (summary.passRate < summary.thresholds.overallPassRate) {
    thresholdFailures.push(
      `overall pass rate ${formatPassRate(summary.passRate)} is below ${formatPassRate(
        summary.thresholds.overallPassRate,
      )}`,
    );
  }

  for (const fileSummary of fileSummaries) {
    if (!fileSummary.passedThreshold && fileSummary.threshold !== null) {
      thresholdFailures.push(
        `${fileSummary.file} pass rate ${formatPassRate(fileSummary.passRate)} is below ${formatPassRate(
          fileSummary.threshold,
        )}`,
      );
    }
  }

  summary.fileSummaries = fileSummaries;
  summary.thresholdFailures = thresholdFailures;
}

function formatPassRate(passRate: number) {
  return `${(passRate * 100).toFixed(1)}%`;
}

describeLive("chatbot golden live eval", () => {
  beforeAll(async () => {
    await runPreflight();
    console.log(`live golden discovery: ${files.length} file(s), ${allCases.length} case(s)`);
    console.log(
      `live golden thresholds: overall=${formatPassRate(thresholdConfig.overallPassRate)}, files=${JSON.stringify(
        thresholdConfig.files ?? {},
      )}`,
    );
    expect(allCases.length).toBeGreaterThan(0);
  });

  for (const testCase of allCases) {
    it(
      `${testCase.id}: ${testCase.description}`,
      async () => {
        const conversationHistoryString = JSON.stringify(testCase.request.chatHistory);

        let detectionError: string | null = null;
        let detectionRaw: unknown = null;
        try {
          detectionRaw = await fetchFunctionCalls(conversationHistoryString);
        } catch (err) {
          detectionError = err instanceof Error ? err.message : String(err);
        }
        const detection = (detectionRaw as DetectionResponse) ?? {
          functionCall: undefined,
          functionMessage: detectionError ?? "Detector returned undefined response",
          error: true,
        };
        const detectedFunctionName = detection.functionCall?.name ?? null;

        let approveDecision: boolean | null = null;
        let approveReason: string | null = null;
        let approvalRaw: unknown = null;
        let approvalError: string | null = null;
        if (detection.functionCall) {
          const functionType = Object.values(FunctionCallType).find(
            (func) => func.name === detection.functionCall?.name,
          );
          try {
            approvalRaw = await fetchExcDecisionStruct(
              conversationHistoryString,
              detection.functionCall,
              functionType?.description ?? "",
            );
            approveDecision = (approvalRaw as ApprovalResponse).approve;
            approveReason = (approvalRaw as ApprovalResponse).reason;
          } catch (err) {
            approvalError = err instanceof Error ? err.message : String(err);
          }
        }

        let replyRaw: unknown = null;
        let replyError: string | null = null;
        try {
          replyRaw = await fetchChatbotReply(testCase.request);
        } catch (err) {
          replyError = err instanceof Error ? err.message : String(err);
        }
        const reply = (replyRaw as ReplyResponse) ?? {
          message: "",
          error: true,
        };
        const returnedFunctionCallName = reply.functionCall?.name ?? null;

        const failures: string[] = [];
        if (
          testCase.expected.detectedFunctionName !== undefined &&
          (testCase.expected.detectedFunctionName ?? null) !== detectedFunctionName
        ) {
          failures.push(
            `detectedFunctionName mismatch: expected=${testCase.expected.detectedFunctionName} actual=${detectedFunctionName}`,
          );
        }
        if (testCase.expected.approved !== undefined && (testCase.expected.approved ?? null) !== approveDecision) {
          failures.push(`approved mismatch: expected=${testCase.expected.approved} actual=${approveDecision}`);
        }
        if (
          testCase.expected.returnedFunctionCallName !== undefined &&
          (testCase.expected.returnedFunctionCallName ?? null) !== returnedFunctionCallName
        ) {
          failures.push(
            `returnedFunctionCallName mismatch: expected=${testCase.expected.returnedFunctionCallName} actual=${returnedFunctionCallName}`,
          );
        }
        if (testCase.expected.error !== undefined && testCase.expected.error !== reply.error) {
          failures.push(`error mismatch: expected=${testCase.expected.error} actual=${reply.error}`);
        }
        for (const phrase of testCase.expected.messageContains ?? []) {
          if (!reply.message.includes(phrase)) {
            failures.push(`message missing expected phrase: "${phrase}"`);
          }
        }
        for (const phrase of testCase.expected.messageNotContains ?? []) {
          if (reply.message.includes(phrase)) {
            failures.push(`message contained forbidden phrase: "${phrase}"`);
          }
        }

        const passed = failures.length === 0;
        if (passed) summary.passCount += 1;
        else summary.failCount += 1;
        const profileName = testCase.evalProfile ?? "default";
        const profile = evaluatorProfiles[profileName] ?? evaluatorProfiles.default;
        const evaluatorEnabled = Boolean(testCase.useEvaluator);

        let evaluatorResult: EvaluatorResult | null = null;
        let evaluatorError: string | null = null;
        if (evaluatorEnabled) {
          const evaluatorModel = process.env.EVALUATOR_MODEL || envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT;
          const evaluatorInput = {
            systemInstruction: evaluatorSystemInstruction,
            profileInstruction: profile?.instruction ?? "",
            functionCatalog: evaluatorFunctionCatalog,
            case: {
              id: testCase.id,
              description: testCase.description,
              request: testCase.request,
              expected: testCase.expected,
            },
            trace: {
              detectedFunctionName,
              approveDecision,
              approveReason,
              returnedFunctionCallName,
              finalError: reply.error,
              finalMessage: reply.message,
            },
            deterministicCheck: {
              failures,
              passed,
            },
          };

          try {
            evaluatorResult = await GeminiService.generateJSON<EvaluatorResult>(
              evaluatorModel,
              JSON.stringify(evaluatorInput),
              `${evaluatorSystemInstruction}\n\n${profile?.instruction ?? ""}`,
              {
                type: Type.OBJECT,
                required: ["verdict", "confidence", "reasons"],
                properties: {
                  verdict: { type: Type.STRING, enum: ["pass", "fail"] },
                  confidence: { type: Type.NUMBER },
                  reasons: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  notes: { type: Type.STRING },
                },
              },
            );
          } catch (err) {
            evaluatorError = err instanceof Error ? err.message : String(err);
            evaluatorResult = {
              verdict: "fail",
              confidence: 0,
              reasons: [`Evaluator invocation failed: ${evaluatorError}`],
              notes: "Evaluator failure recorded by harness.",
            };
          }
        }

        const resultEntry: LiveGoldenSummary["results"][0] = {
          id: testCase.id,
          sourceFile: testCase.sourceFile,
          description: testCase.description,
          evalProfile: profileName,
          useEvaluator: evaluatorEnabled,
          passed,
          failures,
          apiResults: {
            detection: {
              response: detectionRaw,
              normalized: detection,
              error: detectionError,
            },
            approval: {
              response: approvalRaw,
              error: approvalError,
            },
            finalReply: {
              response: replyRaw,
              normalized: reply,
              error: replyError,
            },
            evaluator: {
              response: evaluatorResult,
              error: evaluatorError,
            },
          },
          trace: {
            detectedFunctionName,
            approveDecision,
            approveReason,
            returnedFunctionCallName,
            finalError: reply.error,
            finalMessage: reply.message,
          },
        };

        if (evaluatorEnabled) {
          resultEntry.evaluatorSettings = {
            enabled: true,
            model: process.env.EVALUATOR_MODEL || envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT,
            profile: profileName,
          };
          resultEntry.evaluatorInput = {
            systemInstruction: evaluatorSystemInstruction,
            profileInstruction: profile?.instruction ?? "",
            functionCatalog: evaluatorFunctionCatalog,
            case: {
              id: testCase.id,
              description: testCase.description,
              request: testCase.request,
              expected: testCase.expected,
            },
          };
          resultEntry.evaluatorResult = evaluatorResult;
        }

        summary.results.push(resultEntry);
      },
      testCase.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );
  }

  it("meets configured pass-rate thresholds", () => {
    updateSummaryThresholds();
    expect(summary.results.length).toBe(summary.total);
    expect(summary.thresholdFailures).toEqual([]);
  });

  afterAll(() => {
    updateSummaryThresholds();
    mkdirSync(REPORT_DIR, { recursive: true });
    const uniqueReportPath = join(REPORT_DIR, `${summary.timestamp.replace(/[:.]/g, "-")}__${summary.reportId}.json`);
    summary.reportPath = uniqueReportPath;
    writeFileSync(uniqueReportPath, JSON.stringify(summary, null, 2));
    writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2));
    console.log(`live golden report: ${REPORT_PATH}`);
    console.log(`live golden unique report: ${uniqueReportPath}`);
    console.log(
      `live golden summary: ${summary.passCount}/${summary.total} passed (${formatPassRate(summary.passRate)})`,
    );
    if (summary.thresholdFailures.length > 0) {
      console.log(`live golden threshold failures: ${summary.thresholdFailures.join("; ")}`);
    }
  });
});
