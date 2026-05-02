import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { fetchFunctionCalls } from "../fetchFunctionCalls";
import { fetchExcDecisionStruct } from "../fetchFunctionApproval";
import { fetchChatbotReply } from "../fetchReply";
import { GeminiService } from "../geminiService";
import { FunctionCallType } from "@/app/enums/functionCall";
import { envClient } from "@/app/env/client";
import { envServer } from "@/app/env/server";
import { Type } from "@google/genai";

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

const CASES_DIR = join(process.cwd(), "testdata", "chatbot-golden-live");
const REPORT_DIR = join(process.cwd(), "testdata", "chatbot-golden-live", "reports");
const REPORT_PATH = join(REPORT_DIR, "latest.json");
const EVAL_DIR = join(CASES_DIR, "evaluator");
const EVAL_SYSTEM_PATH = join(EVAL_DIR, "system.md");
const EVAL_FUNCTIONS_PATH = join(EVAL_DIR, "functions.json");
const EVAL_PROFILES_PATH = join(EVAL_DIR, "profiles.json");
const DEFAULT_TIMEOUT_MS = 45000;

async function runPreflight() {
  const missing: string[] = [];
  const requiredEnv = [
    ["GEMINI_API_KEY", envServer.GEMINI_API_KEY],
    ["NEXT_PUBLIC_GEMINI_MODEL_DEFAULT", envClient.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT],
    ["NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL", envClient.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL],
    ["NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL_APPROVER", envClient.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL_APPROVER],
    ["NEXT_PUBLIC_DEV_MODE", envClient.NEXT_PUBLIC_DEV_MODE],
  ] as const;

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
  .filter((f) => f.endsWith(".json") && (!caseFilter || f.includes(caseFilter)))
  .sort();
const allCases: LiveGoldenCase[] = [];
for (const file of files) {
  const raw = JSON.parse(readFileSync(join(CASES_DIR, file), "utf-8")) as LiveGoldenCase | LiveGoldenCaseGroup;
  if (Array.isArray((raw as LiveGoldenCaseGroup).cases)) {
    allCases.push(...(raw as LiveGoldenCaseGroup).cases);
  } else {
    allCases.push(raw as LiveGoldenCase);
  }
}
const evaluatorSystemInstruction = readFileSync(EVAL_SYSTEM_PATH, "utf-8");
const evaluatorFunctionCatalog = JSON.parse(readFileSync(EVAL_FUNCTIONS_PATH, "utf-8"));
const evaluatorProfiles = JSON.parse(readFileSync(EVAL_PROFILES_PATH, "utf-8")) as Record<
  string,
  { name: string; instruction: string }
>;

interface LiveGoldenSummary {
  reportId: string;
  reportPath?: string;
  timestamp: string;
  filesFound: number;
  total: number;
  passCount: number;
  failCount: number;
  models: {
    functionCallDetection: string;
    functionCallApprover: string;
    finalReply: string;
  };
  results: Array<{
    id: string;
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

describe("chatbot golden live eval", () => {
  beforeAll(async () => {
    await runPreflight();
    console.log(`live golden discovery: ${files.length} file(s), ${allCases.length} case(s)`);
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
        expect(failures.length).toBe(0);
      },
      testCase.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );
  }

  afterAll(() => {
    mkdirSync(REPORT_DIR, { recursive: true });
    const uniqueReportPath = join(REPORT_DIR, `${summary.timestamp.replace(/[:.]/g, "-")}__${summary.reportId}.json`);
    summary.reportPath = uniqueReportPath;
    writeFileSync(uniqueReportPath, JSON.stringify(summary, null, 2));
    writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2));
    console.log(`live golden report: ${REPORT_PATH}`);
    console.log(`live golden unique report: ${uniqueReportPath}`);
    console.log(`live golden summary: ${summary.passCount}/${summary.total} passed`);
  });
});
