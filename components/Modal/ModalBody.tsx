"use client";
import React, { ReactNode, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/app/utils/cn";
import { Overlay } from "./ModalOverlay";
import { useUIState } from "@/app/context/UIStateContext";
import { ModalClose } from "./ModalClose";
import { FluidGlass } from "../ui/FluidGlass";
import { AnimatedBlobs } from "../ui/AnimatedBlobs";

const modalBgVariants = {
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

const modalVariants = {
  initial: {
    height: 0,
  },
  animate: {
    height: "70%",
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

export const ModalBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { isChatOpen, allowAnimation } = useUIState();

  const modalRef = useRef<HTMLDivElement>(null);
  const { setChatOpen } = useUIState();
  useOutsideClick(modalRef, () => setChatOpen(false));

  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          variants={modalBgVariants}
          initial="initial"
          animate="animate"
          exit={allowAnimation ? "exit" : "initial"}
          className="w-screen fixed inset-0 flex items-center justify-center z-50"
        >
          <Overlay />
          <AnimatedBlobs />

          <motion.div
            ref={modalRef}
            className={cn(
              "h-[70%] w-[95%] lg:w-[75%] relative z-50 flex flex-col",
              className
            )}
            variants={allowAnimation ? modalVariants : undefined}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FluidGlass 
              intensity={0.4} 
              className="flex-1 flex flex-col pt-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] shadow-black/50"
              containerClassName="h-full w-full"
              borderRadius="2.5rem"
            >
              <ModalClose />
              {children}
            </FluidGlass>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
