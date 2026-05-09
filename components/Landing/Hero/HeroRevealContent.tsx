"use client";

import { themeClasses } from "@/app/styles/themeClasses";
import { LinkPreview } from "@/components/Contact/LinkPreview";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { AILink } from "./AILink";
import { HeroSummaryAction } from "./HeroSummaryAction";

export function HeroRevealContent() {
  const shouldReduceMotion = useReducedMotion();
  const [showOverlay, setShowOverlay] = useState(!shouldReduceMotion);
  const heroTextClassName = cn(themeClasses.gradient.heroHeading, "hero-text");
  const canStartSummary = shouldReduceMotion || !showOverlay;

  return (
    <div className="relative text-center font-medium tracking-tight place-items-center">
      <h1 className={cn("py-4 text-4xl md:text-5xl lg:text-5xl mb-4 ")}>
        <span className={heroTextClassName}>
          My name is Zi Shen
          <br />
          <br />I Build{" "}
        </span>
        <LinkPreview
          url="./projects/personal-ai"
          className={cn(
            "relative text-5xl lg:text-6xl font-bold inline-block",
          )}
          isStatic
          imageSrc="/image/preview-personal-ai.png"
        >
          <AILink />
        </LinkPreview>{" "}
        <span className={heroTextClassName}>Solutions</span>
      </h1>
      <HeroSummaryAction start={canStartSummary} />

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            className="fixed inset-0 z-40 grid h-[100dvh] w-[100dvw] place-items-center bg-background"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.4, duration: 1, ease: "easeInOut" }}
            onAnimationComplete={() => setShowOverlay(false)}
          >
            <motion.span
              className="text-6xl font-bold text-transparent lg:text-7xl"
              initial={{
                background: "linear-gradient(to bottom right, #818cf8, #a855f7)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                scale: 1,
              }}
              animate={{ scale: 1.04 }}
              transition={{
                duration: 1.2,
                ease: "easeInOut",
                repeat: 1,
                repeatType: "reverse",
              }}
            >
              AI
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
