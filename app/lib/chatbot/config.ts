import { ProjectDemoType } from "@/app/enums/projectDemo";

//* ChatModal
export const CLOSE_MODAL_DELAY_ON_FUNC_CALL_MS = 300;
export const SCROLL_DELAY_MS = 500;

//* Reply Generation (Main)
export const REPLY_ERROR_FALLBACK_MSG =
  "Oops, it seems that something is happening from my end. Maybe refresh the page and try again later?";

export const MAX_CHAT_HISTORY_INSTANCE = 20;

export const CHATBOT_WAITING_PLACEHOLDER = "...";
export const CHAT_TIMEOUT_MS = 30000;

//* Function Call
export const PROJECT_DEMO_URL_DICT: Record<string, string> = {
  [ProjectDemoType.PersonalAI]: "https://www.zishenchan.com/projects/personal-ai",
  [ProjectDemoType.ReminderApi]: "https://reminder-demo-app.vercel.app/",
  [ProjectDemoType.Xcuisite]: "https://www.xcuisite.store/",
};

export const FETCH_FAIL_FALLBACK_MSG = "Error happened when fetching functions";
