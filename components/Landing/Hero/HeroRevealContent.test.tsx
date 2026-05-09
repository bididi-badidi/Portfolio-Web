import { describe, expect, it, mock } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

let reducedMotion = false;

mock.module("motion/react", () => {
  const MotionElement = (tag: string) =>
    function MotionComponent({
      children,
      initial,
      animate,
      exit,
      transition,
      onAnimationComplete,
      ...props
    }: React.HTMLAttributes<HTMLElement> & {
      animate?: unknown;
      exit?: unknown;
      initial?: unknown;
      onAnimationComplete?: () => void;
      transition?: unknown;
    }) {
      return React.createElement(
        tag,
        {
          ...props,
          "data-animate": animate ? JSON.stringify(animate) : undefined,
          "data-exit": exit ? JSON.stringify(exit) : undefined,
          "data-initial": initial ? JSON.stringify(initial) : undefined,
          "data-transition": transition ? JSON.stringify(transition) : undefined,
          "data-has-animation-complete": onAnimationComplete ? "true" : undefined,
        },
        children,
      );
    };

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) => MotionElement(tag),
      },
    ),
    useAnimate: () => [() => undefined, mock()] as const,
    useInView: () => true,
    useReducedMotion: () => reducedMotion,
  };
});

mock.module("@/components/Contact/LinkPreview", () => ({
  LinkPreview: ({
    children,
    className,
    url,
  }: {
    children: React.ReactNode;
    className?: string;
    url: string;
  }) => (
    <a className={className} href={url}>
      {children}
    </a>
  ),
}));

mock.module("./AILink", () => ({
  AILink: () => <span>AI</span>,
}));

mock.module("./ResumeButton", () => ({
  ResumeButton: ({ className }: { className?: string }) => (
    <button className={className}>Resume</button>
  ),
}));

describe("HeroRevealContent", () => {
  it("renders an AI-only overlay before starting the summary animation", async () => {
    reducedMotion = false;

    const { HeroRevealContent } = await import("./HeroRevealContent");
    const html = renderToStaticMarkup(<HeroRevealContent />);

    expect(html).toContain("My name is Zi Shen");
    expect(html).toContain("I Build");
    expect(html).toContain("Solutions");
    expect(html).toContain("fixed inset-0");
    expect(html).toContain("place-items-center bg-background");
    expect(html).toContain("data-has-animation-complete=\"true\"");
    expect(html).toContain("data-hero-summary=\"true\"");
    expect(html).toContain("data-hero-resume=\"true\"");
  });

  it("skips the overlay and starts the summary immediately for reduced motion", async () => {
    reducedMotion = true;

    const { HeroRevealContent } = await import("./HeroRevealContent");
    const html = renderToStaticMarkup(<HeroRevealContent />);

    expect(html).not.toContain("fixed inset-0");
    expect(html).toContain("flex min-h-24 flex-col");
  });
});
