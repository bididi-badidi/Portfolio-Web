export const TEST_CONFIG = {
  env: {
    devMode: "false",
  },
  processEnv: {
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: "test",
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "test",
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "test",
    NEXT_PUBLIC_AZURE_REMINDER_API_URL: "test",
    NEXT_PUBLIC_LOCAL_REMINDER_API_URL: "test",
    REMINDER_API_TOKEN: "test",
    AWS_REGION: "test",
    AWS_ACCESS_KEY_ID: "test",
    AWS_SECRET_ACCESS_KEY: "test",
    AWS_BUCKET_NAME: "test",
  },
  serverEnv: {
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
  },
  timeouts: {
    fetchAbortMs: 50,
    fetchAbortTestMs: 5000,
  },
} as const;

export function applyUnitTestEnv() {
  process.env.NEXT_PUBLIC_DEV_MODE = TEST_CONFIG.env.devMode;
  Object.assign(process.env, TEST_CONFIG.processEnv);
}
