export const TEST_CONFIG = {
  env: {
    liveEvalFlag: "CHATBOT_LIVE_EVAL",
    devMode: "false",
    txtaiBaseUrl: "https://txtai.example.com",
  },
  processEnv: {
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: "test",
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "test",
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "test",
    NEXT_PUBLIC_AZURE_REMINDER_API_URL: "test",
    NEXT_PUBLIC_LOCAL_REMINDER_API_URL: "test",
    NEXT_PUBLIC_GEMINI_MODEL_DEFAULT: "test",
    NEXT_PUBLIC_GEMINI_MODEL_QUERY: "test",
    NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL: "test",
    NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL_APPROVER: "test",
    NEXT_PUBLIC_GEMINI_MODEL_RESUME: "test",
    GEMINI_API_KEY: "test",
    TXTAI_BASE_URL: "test",
    REMINDER_API_TOKEN: "test",
    AWS_REGION: "test",
    AWS_ACCESS_KEY_ID: "test",
    AWS_SECRET_ACCESS_KEY: "test",
    AWS_BUCKET_NAME: "test",
  },
  serverEnv: {
    GEMINI_API_KEY: "test-key",
    TXTAI_BASE_URL: "test-url",
    REMINDER_API_TOKEN: "test-token",
    AWS_REGION: "test-region",
    AWS_ACCESS_KEY_ID: "test-key-id",
    AWS_SECRET_ACCESS_KEY: "test-secret",
    AWS_BUCKET_NAME: "test-bucket",
  },
  clientEnv: {
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
  },
  gemini: {
    model: "test-model",
    contents: "contents",
    systemInstruction: "my system instruction",
    successText: "Hello world",
    retrySuccessText: "Success",
    timeoutLateText: "too late",
    timeoutRecoveryText: "After timeout",
  },
  timeouts: {
    geminiSlowResponseMs: 20000,
    geminiTimeoutTestMs: 20000,
    fetchAbortMs: 50,
    fetchAbortTestMs: 5000,
    liveDefaultMs: 45000,
  },
  live: {
    casesDir: ["testdata", "chatbot-golden-live"],
    reportDir: ["testdata", "chatbot-golden-live", "reports"],
    reportFilename: "latest.json",
    thresholdsFilename: "thresholds.json",
    evaluatorDirname: "evaluator",
    evaluatorSystemFilename: "system.md",
    evaluatorFunctionsFilename: "functions.json",
    evaluatorProfilesFilename: "profiles.json",
    requiredEnvKeys: [
      "GEMINI_API_KEY",
      "NEXT_PUBLIC_GEMINI_MODEL_DEFAULT",
      "NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL",
      "NEXT_PUBLIC_GEMINI_MODEL_FUNC_CALL_APPROVER",
      "NEXT_PUBLIC_DEV_MODE",
    ],
  },
} as const;

export function isLiveEvalMode() {
  return process.env[TEST_CONFIG.env.liveEvalFlag] === "1";
}

export function applyUnitTestEnv() {
  process.env.NEXT_PUBLIC_DEV_MODE = TEST_CONFIG.env.devMode;

  if (isLiveEvalMode()) {
    return;
  }

  Object.assign(process.env, TEST_CONFIG.processEnv);
}
