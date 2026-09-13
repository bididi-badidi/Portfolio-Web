import { mock } from "bun:test";
import { JSDOM } from "jsdom";
import { TEST_CONFIG, applyUnitTestEnv } from "@/app/test/testConfig";

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

// Tests never inherit a real model key, and there is no live-evaluation bypass.
process.env.OPENAI_API_KEY = "test-key";
process.env.OPENAI_MODEL = "gpt-5.6-luna";
mock.module("@/app/env/server", () => ({ envServer: TEST_CONFIG.serverEnv }));
mock.module("@/app/env/client", () => ({ envClient: TEST_CONFIG.clientEnv }));
