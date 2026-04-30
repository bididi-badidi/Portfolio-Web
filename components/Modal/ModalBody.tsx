"use client";
import React, { ReactNode, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/app/utils/cn";
import { Overlay } from "./ModalOverlay";
import { useUIState } from "@/app/context/UIStateContext";
import { ModalClose } from "./ModalClose";

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

          <motion.div
            ref={modalRef}
            className={cn(
              "h-[70%] max-w-[90%] lg:max-w-[70%] pt-3 bg-elevated/55 backdrop-blur-md overflow-hidden border border-slate-50/20 rounded-2xl relative z-50 flex flex-col flex-1",
              className
            )}
            variants={allowAnimation ? modalVariants : undefined}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ModalClose />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
