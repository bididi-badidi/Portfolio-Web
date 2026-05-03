"use client";
import React, { ReactNode } from "react";
import { cn } from "@/app/utils/cn";
import { Overlay } from "./ModalOverlay";
import { useUIState } from "@/app/context/UIStateContext";
import { ModalClose } from "./ModalClose";
import { AnimatedBlobs } from "../ui/AnimatedBlobs";
import { AnimatedGlassWindow } from "../ui/AnimatedGlassWindow";

export const ModalBody = ({ children, className }: { children: ReactNode; className?: string }) => {
  const { isChatOpen, allowAnimation } = useUIState();
  const { setChatOpen } = useUIState();

  return (
    <AnimatedGlassWindow
      open={isChatOpen}
      allowAnimation={allowAnimation}
      onOutsideClick={() => setChatOpen(false)}
      backdrop={<Overlay />}
      ambient={<AnimatedBlobs />}
      panelClassName={cn("w-[95%] lg:w-[75%] relative z-50 flex flex-col", className)}
    >
      <ModalClose />
      {children}
    </AnimatedGlassWindow>
  );
};
