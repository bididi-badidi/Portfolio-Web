"use client";

import { motion } from "motion/react";
import { useSyncExternalStore, type ReactNode } from "react";

export const spring = { type: "spring", stiffness: 320, damping: 36 } as const;

function subscribeToMotionPreference(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

// Use the same quiet initial state for server rendering and hydration.
export function useMotionPreference() {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
}

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useMotionPreference();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduceMotion ? undefined : { opacity: [0.7, 1], y: [14, 0] }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
