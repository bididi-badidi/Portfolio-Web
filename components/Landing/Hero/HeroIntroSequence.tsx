"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { HeroSummaryAction } from "./HeroSummaryAction";

const READ_DELAY_MS = 2600;

export function HeroIntroSequence() {
  const shouldReduceMotion = useReducedMotion();
  const [isModalVisible, setIsModalVisible] = useState(!shouldReduceMotion);
  const [canShowResume, setCanShowResume] = useState(Boolean(shouldReduceMotion));

  useEffect(() => {
    if (isModalVisible || canShowResume) return;

    const timeout = window.setTimeout(() => {
      setCanShowResume(true);
    }, READ_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [canShowResume, isModalVisible]);

  return (
    <>
      <HeroSummaryAction start={canShowResume} />

      <AnimatePresence>
        {isModalVisible && (
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 z-40 h-[100dvh] w-[100dvw] bg-background pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              delay: 1.1,
              duration: 1.8,
              ease: "easeInOut",
            }}
            onAnimationComplete={() => setIsModalVisible(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
