import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const envServer = createEnv({
  emptyStringAsUndefined: true,
  server: {
    GEMINI_API_KEY: z.string(),
    REMINDER_API_TOKEN: z.string().optional(),
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_BUCKET_NAME: z.string(),
    RESUME_SERVER_URL: z.string().url(),
    RESUME_API_KEY: z.string(),
    EVAL_MODE: z.string().optional(),
  },
  experimental__runtimeEnv: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    REMINDER_API_TOKEN: process.env.REMINDER_API_TOKEN,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    RESUME_SERVER_URL: process.env.RESUME_SERVER_URL,
    RESUME_API_KEY: process.env.RESUME_API_KEY,
    EVAL_MODE: process.env.EVAL_MODE,
  },
});
