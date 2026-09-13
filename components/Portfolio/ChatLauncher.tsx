"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import { useUIState } from "@/app/context/UIStateContext";
import { spring, useMotionPreference } from "./Motion";
import styles from "./dark.module.css";

const defaultTargets = ["hero", "about", "techstack", "projects", "experience", "contact"];

export function ChatLauncher({ targets = defaultTargets }: { targets?: readonly string[] }) {
  const { isChatOpen, setChatOpen, registerScrollTarget, unregisterScrollTarget } = useUIState();
  const reduceMotion = useMotionPreference();
  const trigger = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    targets.forEach(registerScrollTarget);
    return () => targets.forEach(unregisterScrollTarget);
  }, [targets, registerScrollTarget, unregisterScrollTarget]);

  useEffect(() => {
    if (!isChatOpen) {
      if (wasOpen.current) trigger.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setChatOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isChatOpen, setChatOpen]);

  return (
    <motion.button
      ref={trigger}
      type="button"
      className={styles.chatLauncher}
      aria-label="Ask my AI, open agent chat"
      aria-haspopup="dialog"
      aria-expanded={isChatOpen}
      tabIndex={isChatOpen ? -1 : 0}
      initial={false}
      animate={{ opacity: isChatOpen ? 0 : 1, scale: reduceMotion ? 1 : isChatOpen ? 0.92 : 1 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={reduceMotion ? { duration: 0.12 } : spring}
      style={{ pointerEvents: isChatOpen ? "none" : "auto" }}
      onClick={() => setChatOpen(true)}
    >
      <MessageCircle size={19} strokeWidth={1.6} aria-hidden="true" />
      <span>Ask my AI</span>
      <ArrowUpRight size={16} aria-hidden="true" />
    </motion.button>
  );
}
