"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function AILink({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{
        background: "linear-gradient(to bottom right, #cbd5e1, #64748b)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      }}
      whileInView={{
        background: "linear-gradient(to bottom right, #818cf8, #a855f7)",
      }}
      viewport={{ once: true }}
      transition={{
        delay: 0,
        duration: 0.4,
        ease: "easeInOut",
      }}
      className={cn(className)}
    >
      AI
    </motion.div>
  );
}
