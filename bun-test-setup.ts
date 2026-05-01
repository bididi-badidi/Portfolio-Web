import { mock } from "bun:test";
mock.module("server-only", () => ({}));
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
    NEXT_PUBLIC_DEV_MODE: false,
    NEXT_PUBLIC_GEMINI_MODEL_DEFAULT: "test-model",
  }
}));
