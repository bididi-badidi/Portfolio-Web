"use client";

import React, { ReactNode, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/app/utils/cn";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { FluidGlass } from "./FluidGlass";

const backdropVariants = {
  initial: { opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    backdropFilter: "blur(10px)",
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: { delay: 1 },
  },
};

export function AnimatedGlassWindow({
  open,
  allowAnimation = true,
  onOutsideClick,
  backdrop,
  ambient,
  children,
  className,
  panelClassName = "w-[95%] lg:w-[75%] relative z-50 flex flex-col",
  panelHeight = "70%",
  glassClassName,
  glassContainerClassName,
  tintColor,
  borderRadius = "2.5rem",
}: {
  open: boolean;
  allowAnimation?: boolean;
  onOutsideClick?: () => void;
  backdrop?: ReactNode;
  ambient?: ReactNode;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  panelHeight?: string | number;
  glassClassName?: string;
  glassContainerClassName?: string;
  tintColor?: string;
  borderRadius?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useOutsideClick(panelRef, () => onOutsideClick?.());

  const panelVariants = {
    initial: {
      height: 0,
    },
    animate: {
      height: panelHeight,
      transition: { delay: 0.5 },
    },
    exit: {
      height: 0,
      transition: { delay: 0.5 },
    },
    transition: {
      type: "spring",
      stiffness: 900,
      damping: 80,
    },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit={allowAnimation ? "exit" : "initial"}
          className={cn("w-screen fixed inset-0 flex items-center justify-center z-50", className)}
        >
          {backdrop}
          {ambient}

          <motion.div
            ref={panelRef}
            className={cn("overflow-hidden", panelClassName)}
            variants={allowAnimation ? panelVariants : undefined}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FluidGlass
              className={cn(
                "flex-1 flex flex-col pt-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] shadow-black/50",
                glassClassName,
              )}
              containerClassName={cn("h-full w-full", glassContainerClassName)}
              tintColor={tintColor}
              borderRadius={borderRadius}
            >
              {children}
            </FluidGlass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
