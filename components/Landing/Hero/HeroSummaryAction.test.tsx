import { describe, expect, it, mock } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

let reducedMotion = false;
let inView = true;

mock.module("motion/react", () => {
  const MotionElement = (tag: string) =>
    function MotionComponent({
      children,
      initial,
      ...props
    }: React.HTMLAttributes<HTMLElement> & { initial?: unknown }) {
      return React.createElement(
        tag,
        {
          ...props,
          "data-initial": initial ? JSON.stringify(initial) : undefined,
        },
        children,
      );
    };

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) => MotionElement(tag),
      },
    ),
    useAnimate: () => [() => undefined, mock()] as const,
    useInView: () => inView,
    useReducedMotion: () => reducedMotion,
  };
});

mock.module("./ResumeButton", () => ({
  ResumeButton: ({ className }: { className?: string }) => (
    <button className={className}>Resume</button>
  ),
}));

describe("HeroSummaryAction", () => {
  it("renders the compressed-to-resume animation targets with hidden initial states", async () => {
    reducedMotion = false;
    inView = true;

    const { HeroSummaryAction } = await import("./HeroSummaryAction");
    const html = renderToStaticMarkup(<HeroSummaryAction start={false} />);

    expect(html).toContain("data-hero-summary=\"true\"");
    expect(html).toContain("data-hero-resume=\"true\"");
    expect(html).toContain("LLM integrations to automated data pipelines");
    expect(html).toContain("Resume");
    expect(html).toContain("&quot;opacity&quot;:0");
    expect(html).toContain("&quot;scaleX&quot;:0.06");
    expect(html).toContain("pointer-events:none");
  });

  it("shows the paragraph and resume button without animation for reduced motion", async () => {
    reducedMotion = true;
    inView = true;

    const { HeroSummaryAction } = await import("./HeroSummaryAction");
    const html = renderToStaticMarkup(<HeroSummaryAction />);

    expect(html).toContain("LLM integrations to automated data pipelines");
    expect(html).toContain("Resume");
    expect(html).toContain("flex min-h-24 flex-col");
    expect(html).not.toContain("data-hero-resume");
  });
});
