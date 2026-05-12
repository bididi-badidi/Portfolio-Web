"use client";

import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/lib/utils";
import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ResumeButton } from "./ResumeButton";

const RESUME_LAYOUT_ID = "hero-resume-button";
const RESUME_MORPH_TRANSITION = {
  layout: {
    type: "spring",
    stiffness: 300,
    damping: 34,
    mass: 0.82,
  },
};

export function HeroSummaryAction({ start = true }: { start?: boolean }) {
  const scope = useRef<HTMLDivElement>(null);
  const isInView = useInView(scope, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"summary" | "square" | "button">("summary");
  const isResumeReady = phase === "button";

  useEffect(() => {
    if (!start || !isInView) return;

    if (shouldReduceMotion) {
      setPhase("button");
      return;
    }

    const revealPill = window.setTimeout(() => {
      setPhase("square");
    }, 120);

    const morphToResume = window.setTimeout(() => {
      setPhase("button");
    }, 700);

    return () => {
      window.clearTimeout(revealPill);
      window.clearTimeout(morphToResume);
    };
  }, [isInView, shouldReduceMotion, start]);

  if (shouldReduceMotion) {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center">
        <p className={cn(themeClasses.text.primary, "w-[30ch] opacity-65 lg:w-[45ch] lg:text-lg")}>
          LLM integrations to automated data pipelines—turning manual tasks into intelligent systems.
        </p>
        <ResumeButton className="mt-0" />
      </div>
    );
  }

  return (
    <LayoutGroup id="hero-summary-action">
      <div ref={scope} className="grid min-h-24 place-items-center">
        <AnimatePresence mode="popLayout">
          {phase === "summary" && (
            <motion.p
              key="summary"
              data-hero-summary
              className={cn(
                themeClasses.text.primary,
                "col-start-1 row-start-1 w-[30ch] overflow-hidden lg:w-[45ch] lg:text-lg",
              )}
              initial={{
                opacity: 0.65,
                clipPath: "inset(0% 0% 0% 0%)",
                filter: "blur(0px)",
              }}
              animate={{
                opacity: 0.65,
                clipPath: "inset(0% 0% 0% 0%)",
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                clipPath: "inset(0% 48% 0% 48%)",
                filter: "blur(1px)",
                transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              LLM integrations to automated data pipelines—turning manual tasks into intelligent systems.
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {phase === "square" && (
            <motion.div
              key="square"
              layoutId={RESUME_LAYOUT_ID}
              className="col-start-1 row-start-1 h-11 w-11 rounded-[14px] border border-white/10 bg-[rgb(255_255_255_/_0.025)] shadow-[0_0_16px_rgb(255_255_255_/_0.035)] backdrop-blur-xl"
              style={{ borderRadius: 14 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              transition={{
                ...RESUME_MORPH_TRANSITION,
                opacity: { duration: 0.16, ease: "easeOut" },
              }}
            />
          )}

          {phase === "button" && (
            <div
              key="button"
              className="col-start-1 row-start-1"
              style={{ pointerEvents: isResumeReady ? "auto" : "none" }}
            >
              <ResumeButton
                className="mt-0"
                labelDelay={0.22}
                labelInitialOpacity={0}
                layoutId={RESUME_LAYOUT_ID}
                layoutTransition={RESUME_MORPH_TRANSITION}
                reserveLabelSpace
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
