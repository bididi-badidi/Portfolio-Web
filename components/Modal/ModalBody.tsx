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
      ambient={
        <div className="pointer-events-none absolute inset-0 opacity-45">
          <AnimatedBlobs />
        </div>
      }
      panelClassName={cn("relative z-50 flex w-[min(94vw,56rem)] flex-col", className)}
      panelHeight="min(78dvh,44rem)"
      glassClassName="bg-[linear-gradient(145deg,rgb(255_255_255_/_0.075),rgb(255_255_255_/_0.025)_45%,rgb(99_102_241_/_0.08))]"
      tintColor="rgb(2 6 23 / 0.72)"
      borderRadius="14px"
    >
      <ModalClose />
      {children}
    </AnimatedGlassWindow>
  );
};
