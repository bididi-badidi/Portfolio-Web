"use client";

import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";
import { AnimatedBlobs } from "@/components/ui/AnimatedBlobs";
import { FluidGlass } from "@/components/ui/FluidGlass";
import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

type GlassButtonProps = HTMLMotionProps<"button"> & {
  children: ReactNode;
  borderRadius?: string;
  contentClassName?: string;
  surfaceClassName?: string;
  tintColor?: string;
  showHoverBlobs?: boolean;
};

export function GlassButton({
  children,
  borderRadius = "14px",
  className,
  contentClassName,
  surfaceClassName,
  tintColor = "rgb(255 255 255 / 0.025)",
  showHoverBlobs = true,
  style,
  type = "button",
  ...props
}: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      className={cn(
        "group relative isolate overflow-visible border-0 bg-transparent p-0 text-bright leading-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      style={{ borderRadius, ...style }}
      {...props}
    >
      <FluidGlass
        borderRadius={borderRadius}
        containerClassName="relative z-10 h-full w-full"
        tintColor={tintColor}
        className={cn(
          themeClasses.button.primary,
          "flex h-full w-full items-center justify-center leading-none",
          surfaceClassName,
        )}
      >
        {showHoverBlobs && (
          <div className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
            <AnimatedBlobs variant="trigger" />
          </div>
        )}
        <span
          className={cn(
            "relative z-10 flex h-full w-full items-center justify-center gap-2 whitespace-nowrap px-4 text-sm font-medium leading-none",
            contentClassName,
          )}
        >
          {children}
        </span>
      </FluidGlass>
    </motion.button>
  );
}
