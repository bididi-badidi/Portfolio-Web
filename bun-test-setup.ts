import { mock } from "bun:test";
import { TEST_CONFIG, applyUnitTestEnv, isLiveEvalMode } from "@/app/test/testConfig";

const LIVE_EVAL_MODE = isLiveEvalMode();
applyUnitTestEnv();

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
    envServer: TEST_CONFIG.serverEnv,
  }));

  mock.module("@/app/env/client", () => ({
    envClient: TEST_CONFIG.clientEnv,
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

  mock.module("@/lib/s3-file-loader", () => ({
    getKnowledgeData: mockGetKnowledgeData,
    getMasterResume: mockGetMasterResume,
  }));

  // NOTE: The following modules are intentionally NOT mocked at the global preload
  // level so that they can be unit-tested directly in their own test files:
  //   - @/app/utils/fetchWithRetry
  //   - @/app/lib/chatbot/fetchFunctionCalls
  //   - @/app/lib/chatbot/fetchSearchResults
  //   - @/app/lib/chatbot/fetchFunctionApproval
  //
  // Test files that depend on these mocks must call mock.module themselves
  // using the exported mock instances above.
}
