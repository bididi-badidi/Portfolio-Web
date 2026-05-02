import { mock } from "bun:test";

const LIVE_EVAL_MODE = process.env.CHATBOT_LIVE_EVAL === "1";
process.env.NEXT_PUBLIC_DEV_MODE ??= "false";

// Set process.env before any imports that might trigger T3 Env validation
if (!LIVE_EVAL_MODE) {
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID = "test";
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = "test";
  process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = "test";
  process.env.NEXT_PUBLIC_AZURE_REMINDER_API_URL = "test";
  process.env.NEXT_PUBLIC_LOCAL_REMINDER_API_URL = "test";
  process.env.NEXT_PUBLIC_GEMINI_MODEL_DEFAULT = "test";
  process.env.NEXT_PUBLIC_GEMINI_MODEL_QUERY = "test";
  process.env.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL = "test";
  process.env.NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL_APPROVER = "test";
  process.env.NEXT_PUBLIC_GEMINI_MODEL_RESUME = "test";
  process.env.GEMINI_API_KEY = "test";
  process.env.TXTAI_BASE_URL = "test";
  process.env.REMINDER_API_TOKEN = "test";
  process.env.AWS_REGION = "test";
  process.env.AWS_ACCESS_KEY_ID = "test";
  process.env.AWS_SECRET_ACCESS_KEY = "test";
  process.env.AWS_BUCKET_NAME = "test";
}

mock.module("server-only", () => ({}));

export const mockGeminiGenerateContent = mock();
export const mockFetchWithRetry = mock();
export const mockGetKnowledgeData = mock();
export const mockGetMasterResume = mock();
export const mockFetchFunctionCalls = mock();
export const mockFetchStructQueryPrompt = mock();
export const mockFetchSearchResults = mock();
export const mockFetchExcDecisionStruct = mock();

if (!LIVE_EVAL_MODE) {
  mock.module("@/app/env/server", () => ({
    envServer: {
      GEMINI_API_KEY: "test-key",
      TXTAI_BASE_URL: "test-url",
      REMINDER_API_TOKEN: "test-token",
      AWS_REGION: "test-region",
      AWS_ACCESS_KEY_ID: "test-key-id",
      AWS_SECRET_ACCESS_KEY: "test-secret",
      AWS_BUCKET_NAME: "test-bucket",
    }
  }));

  mock.module("@/app/env/client", () => ({
    envClient: {
      NEXT_PUBLIC_DEV_MODE: "false",
      NEXT_PUBLIC_EMAILJS_SERVICE_ID: "test-service",
      NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "test-template",
      NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "test-key",
      NEXT_PUBLIC_AZURE_REMINDER_API_URL: "test-url",
      NEXT_PUBLIC_LOCAL_REMINDER_API_URL: "test-url",
      NEXT_PUBLIC_GEMINI_MODEL_DEFAULT: "test-model",
      NEXT_PUBLIC_GEMINI_MODEL_QUERY: "test-model-query",
      NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL: "test-model-func",
      NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL_APPROVER: "test-model-approve",
      NEXT_PUBLIC_GEMINI_MODEL_RESUME: "test-model-resume",
    }
  }));

  // ── Shared mocks for all test files ──
  // bun:test mock.module is global, so ALL test files must share the same mock instances.
  mock.module("@/lib/gemini", () => ({
    gemini_client: {
      models: {
        generateContent: mockGeminiGenerateContent,
      },
    },
  }));

  mock.module("@/app/utils/fetchWithRetry", () => ({
    fetchWithRetry: mockFetchWithRetry,
  }));

  mock.module("@/lib/s3-file-loader", () => ({
    getKnowledgeData: mockGetKnowledgeData,
    getMasterResume: mockGetMasterResume,
  }));

  mock.module("@/app/lib/chatbot/fetchFunctionCalls", () => ({
    fetchFunctionCalls: mockFetchFunctionCalls,
  }));

  mock.module("@/app/lib/chatbot/fetchSearchResults", () => ({
    fetchStructQueryPrompt: mockFetchStructQueryPrompt,
    fetchSearchResults: mockFetchSearchResults,
  }));

  mock.module("@/app/lib/chatbot/fetchFunctionApproval", () => ({
    fetchExcDecisionStruct: mockFetchExcDecisionStruct,
  }));
}
