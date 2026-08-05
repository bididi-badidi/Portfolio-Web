import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import SoftAurora from "../SoftAurora";

afterEach(() => {
  cleanup();
});

describe("SoftAurora", () => {
  it("falls back without crashing and retries WebGL initialization once", () => {
    const getContextSpy = spyOn(window.HTMLCanvasElement.prototype, "getContext").mockImplementation(() => null);
    const warnSpy = spyOn(console, "warn").mockImplementation(() => undefined);
    let retryHandler: TimerHandler | undefined;
    const setTimeoutSpy = spyOn(window, "setTimeout").mockImplementation((handler: TimerHandler) => {
      retryHandler = handler;
      return 1;
    });

    try {
      const { container } = render(<SoftAurora />);

      expect(container.querySelector("canvas")).toBeNull();
      expect(getContextSpy).toHaveBeenCalledTimes(2);
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1_000);

      act(() => {
        if (typeof retryHandler === "function") retryHandler();
      });

      expect(container.querySelector("canvas")).toBeNull();
      expect(getContextSpy).toHaveBeenCalledTimes(4);
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledTimes(2);
    } finally {
      getContextSpy.mockRestore();
      warnSpy.mockRestore();
      setTimeoutSpy.mockRestore();
    }
  });
});
