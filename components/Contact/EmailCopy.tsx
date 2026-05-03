"use client";

import { useState } from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import toast from "react-hot-toast";
import { FadeUpInView } from "../ui/FadeUpInView";
import { motion, AnimatePresence, useSpring, useMotionValue } from "motion/react";
import { EMAIL_ADDRESS } from "@/app/config";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";

export function EmailCopy() {
  const [isOpen, setOpen] = useState(false);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);

  const translateX = useSpring(x, springConfig);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseMove = (event: any) => {
    const targetRect = event.target.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2; // Reduce the effect to make it subtle
    x.set(offsetFromCenter);
  };

  const handleCopyEmail = () => {
    navigator.clipboard
      .writeText(EMAIL_ADDRESS)
      .then(() => {
        toast("Email address copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy email. Please copy it manually.");
      });
  };

  return (
    <HoverCardPrimitive.Root
      openDelay={50}
      closeDelay={200}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <FadeUpInView>
        <HoverCardPrimitive.Trigger asChild onMouseMove={handleMouseMove}>
          <div
            className={cn(themeClasses.gradient.heading, "font-bold py-4 cursor-pointer")}
            onClick={handleCopyEmail}
          >
            Email
          </div>
        </HoverCardPrimitive.Trigger>
      </FadeUpInView>
      <HoverCardPrimitive.Content
        align="center"
        side="top"
        sideOffset={10}
        className="[transform-origin:var(--radix-hover-card-content-transform-origin)]"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                },
              }}
              exit={{ opacity: 0, y: 20, scale: 0.6 }}
              className="shadow-xl rounded-xl  z-50 w-40 bg-elevated/55 backdrop-blur-md py-4 px-2 text-bright text-center text-sm outline-none"
              style={{
                x: translateX,
              }}
            >
              copy email address
            </motion.div>
          )}
        </AnimatePresence>
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Root>
  );
}
