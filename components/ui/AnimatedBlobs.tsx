"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/app/utils/cn";

export const AnimatedBlobs = ({ variant = "modal" }: { variant?: "modal" | "trigger" }) => {
  const isTrigger = variant === "trigger";

  return (
    <div
      className={cn(
        "absolute overflow-hidden pointer-events-none",
        isTrigger ? "inset-[-120%] rounded-full z-0" : "inset-0",
      )}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
          rotate: [0, 120, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className={cn(
          "absolute rounded-full bg-indigo-500/10",
          isTrigger
            ? "-top-[10%] -left-[10%] w-[70%] h-[70%] blur-[60px]"
            : "-top-[10%] -left-[10%] w-[50%] h-[50%] blur-[120px]",
        )}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -100, 0],
          y: [0, -50, 0],
          rotate: [0, -120, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className={cn(
          "absolute rounded-full bg-purple-500/20",
          isTrigger
            ? "-bottom-[10%] -right-[10%] w-[70%] h-[80%] blur-[60px]"
            : "-bottom-[10%] -right-[10%] w-[60%] h-[60%] blur-[120px]",
        )}
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 50, 0],
          y: [0, -80, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className={cn(
          "absolute rounded-full bg-cyan-500/10",
          isTrigger
            ? "top-[20%] right-[10%] w-[50%] h-[50%] blur-[28px]"
            : "top-[20%] right-[10%] w-[30%] h-[30%] blur-[100px]",
        )}
      />
    </div>
  );
};
