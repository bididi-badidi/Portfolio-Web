import { mock } from "bun:test";
import { JSDOM } from "jsdom";
import { TEST_CONFIG, applyUnitTestEnv, isLiveEvalMode } from "@/app/test/testConfig";

const LIVE_EVAL_MODE = isLiveEvalMode();
applyUnitTestEnv();

mock.module("server-only", () => ({}));

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
});

const { window } = dom;

Object.defineProperty(globalThis, "window", { value: window, writable: true, configurable: true });
Object.defineProperty(globalThis, "document", { value: window.document, writable: true, configurable: true });
Object.defineProperty(globalThis, "navigator", { value: window.navigator, writable: true, configurable: true });
Object.defineProperty(globalThis, "HTMLElement", { value: window.HTMLElement, writable: true, configurable: true });
Object.defineProperty(globalThis, "Element", { value: window.Element, writable: true, configurable: true });
Object.defineProperty(globalThis, "Node", { value: window.Node, writable: true, configurable: true });
Object.defineProperty(globalThis, "NodeList", { value: window.NodeList, writable: true, configurable: true });
Object.defineProperty(globalThis, "Event", { value: window.Event, writable: true, configurable: true });
Object.defineProperty(globalThis, "CustomEvent", { value: window.CustomEvent, writable: true, configurable: true });
Object.defineProperty(globalThis, "MouseEvent", { value: window.MouseEvent, writable: true, configurable: true });
Object.defineProperty(globalThis, "getComputedStyle", {
  value: window.getComputedStyle.bind(window),
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, "requestAnimationFrame", {
  value: (cb: FrameRequestCallback) => setTimeout(cb, 16),
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, "cancelAnimationFrame", {
  value: (id: number) => clearTimeout(id),
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, "MutationObserver", { value: window.MutationObserver, writable: true, configurable: true });
Object.defineProperty(globalThis, "ResizeObserver", {
  value: class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  writable: true,
  configurable: true,
});

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
  mock.module("@/app/lib/chatbot/aiSdk", () => ({
    generateChatbotText: async (args: Record<string, unknown>) => {
      const response = await mockGeminiGenerateContent({
        ...args,
        contents: args.prompt,
        config: {
          systemInstruction: args.system,
        },
      });
      return {
        ...response,
        toolCalls:
          response.toolCalls ??
          response.functionCalls?.map((functionCall: { name?: string; args?: Record<string, unknown> }) => ({
            toolName: functionCall.name,
            input: functionCall.args,
          })),
      };
    },
    generateChatbotObject: async (args: Record<string, unknown>) => {
      const response = await mockGeminiGenerateContent({
        ...args,
        contents: args.prompt,
        config: {
          systemInstruction: args.system,
          schema: args.schema,
        },
      });

      if (response.object) return response;
      if (!response.text) throw new Error("Empty response from Gemini");

      try {
        return { object: JSON.parse(response.text) };
      } catch {
        throw new Error("Invalid JSON response from Gemini");
      }
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
