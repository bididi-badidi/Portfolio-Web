"use client";

import { cn } from "@/app/utils/cn";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import type { ReactNode } from "react";
import { SoftAuroraBackground } from "./SoftAuroraBackground";

interface SoftAuroraHeroProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function SoftAuroraHero({ id, children, className }: SoftAuroraHeroProps) {
  return (
    <ScrollableSection
      id={id}
      className={cn(
        "relative grid min-h-dvh w-dvw place-items-center overflow-hidden bg-background mb-0 lg:mb-0",
        className,
      )}
    >
      <SoftAuroraBackground />
      <div className="absolute inset-0 bg-background/35" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-background/35 to-background" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/80 to-transparent" />
      <div className="relative">{children}</div>
    </ScrollableSection>
  );
}
