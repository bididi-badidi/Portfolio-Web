"use client";

import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/lib/utils";
import { motion, useAnimate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { ResumeButton } from "./ResumeButton";

export function HeroSummaryAction({ start = true }: { start?: boolean }) {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const [isResumeReady, setIsResumeReady] = useState(false);

  useEffect(() => {
    if (!start || !isInView) return;

    if (shouldReduceMotion) {
      setIsResumeReady(true);
      return;
    }

    let isCancelled = false;

    const runAnimation = async () => {
      await animate(
        "[data-hero-summary]",
        { opacity: 0.65, scaleX: 1 },
        { duration: 0.2, ease: "easeOut" },
      );

      if (isCancelled) return;

      await animate(
        "[data-hero-summary]",
        { opacity: 0.38, scaleX: 0.1, filter: "blur(0.7px)" },
        { type: "spring", stiffness: 150, damping: 22, mass: 0.85 },
      );

      if (isCancelled) return;

      await Promise.all([
        animate(
          "[data-hero-summary]",
          { opacity: 0, scaleX: 0.001, filter: "blur(1.5px)" },
          { duration: 0.18, ease: "easeOut" },
        ),
        animate(
          "[data-hero-resume]",
          { opacity: 1, scaleX: 1 },
          { type: "spring", stiffness: 300, damping: 23, mass: 0.75 },
        ),
      ]);

      if (!isCancelled) {
        setIsResumeReady(true);
      }
    };

    runAnimation();

    return () => {
      isCancelled = true;
    };
  }, [animate, isInView, shouldReduceMotion, start]);

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
    <div ref={scope} className="grid min-h-24 place-items-center">
      <motion.p
        data-hero-summary
        className={cn(
          themeClasses.text.primary,
          "col-start-1 row-start-1 w-[30ch] origin-center lg:w-[45ch] lg:text-lg",
        )}
        initial={{ opacity: 0.65, scaleX: 1, filter: "blur(0px)" }}
      >
        LLM integrations to automated data pipelines—turning manual tasks into intelligent systems.
      </motion.p>
      <motion.div
        data-hero-resume
        className="col-start-1 row-start-1 origin-center"
        initial={{ opacity: 0, scaleX: 0.06 }}
        style={{ pointerEvents: isResumeReady ? "auto" : "none" }}
      >
        <ResumeButton className="mt-0" />
      </motion.div>
    </div>
  );
}
