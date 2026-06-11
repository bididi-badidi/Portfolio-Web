import { ProjectDemoType } from "@/app/enums/projectDemo";
import { envClient } from "@/app/env/client";
import { REPLY_SYN_PROMPT } from "./prompts";

const parseBooleanConfig = (value: string | boolean | undefined): boolean => {
  if (typeof value === "boolean") return value;
  return value?.toLowerCase() === "true";
};

export const DEBUG_MODE = parseBooleanConfig(envClient.NEXT_PUBLIC_DEV_MODE);
export const GEMINI_API_VERBOSE_MODE = DEBUG_MODE;

//* ChatModal
export const CLOSE_MODAL_DELAY_ON_FUNC_CALL_MS = 300;
export const SCROLL_DELAY_MS = 500;

//* Reply Generation (Main)
export const REPLY_ERROR_FALLBACK_MSG =
  "Oops, it seems that something is happening from my end. Maybe refresh the page and try again later?";

export const GEMINI_GENERATION_CONFIG = {
  temperature: 0.25,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1020,
  system: REPLY_SYN_PROMPT,
};

export const INITIAL_CHAT_HISTORY = [
  {
    role: "user",
    parts: [{ text: "Hi" }],
  },
  {
    role: "model",
    parts: [{ text: "Hi, I'm Zi Shen. How can I help you?" }],
  },
];

export const MAX_CHAT_HISTORY_INSTANCE = 20;

export const CHATBOT_WAITING_PLACEHOLDER = "...";
export const CHAT_TIMEOUT_MS = 30000;

//* Query Searching
export const QUERY_SEARCH_LIMIT = 3;

//* Function Call
export const PROJECT_DEMO_URL_DICT: Record<string, string> = {
  [ProjectDemoType.PersonalAI]: "https://www.zishenchan.com/projects/personal-ai",
  [ProjectDemoType.ReminderApi]: "https://reminder-demo-app.vercel.app/",
  [ProjectDemoType.Xcuisite]: "https://www.xcuisite.store/",
};

export const FETCH_FAIL_FALLBACK_MSG = "Error happened when fetching functions";

export * from "./prompts";
