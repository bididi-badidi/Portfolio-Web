"use client";

import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ProjectHeroRings } from "./ProjectHeroRings";

interface ProjectSpotlightHeroProps {
  id: string;
  title: ReactNode;
  description: ReactNode;
  cta?: {
    href: string;
    label: string;
  };
}

export function ProjectSpotlightHero({
  id,
  title,
  description,
  cta,
}: ProjectSpotlightHeroProps) {
  const [isHeadingCompact, setIsHeadingCompact] = useState(false);
  const [isCaptionVisible, setIsCaptionVisible] = useState(false);
  const captionTimerRef = useRef<number | null>(null);

  const handleRingsStatic = useCallback(() => {
    setIsHeadingCompact(true);

    if (captionTimerRef.current) {
      window.clearTimeout(captionTimerRef.current);
    }

    captionTimerRef.current = window.setTimeout(() => {
      setIsCaptionVisible(true);
      captionTimerRef.current = null;
    }, 520);
  }, []);

  useEffect(() => {
    return () => {
      if (captionTimerRef.current) {
        window.clearTimeout(captionTimerRef.current);
      }
    };
  }, []);

  return (
    <ScrollableSection
      id={id}
      className="relative flex h-screen w-screen overflow-hidden rounded-md antialiased place-items-center md:items-center md:justify-center"
    >
      <ProjectHeroRings onStatic={handleRingsStatic} />
      <div className="relative z-10 mx-auto w-full max-w-7xl p-4">
        <h1
          className={cn(
            themeClasses.gradient.heroHeading,
            "text-center font-bold transition-[font-size,transform] duration-500 ease-out",
            isHeadingCompact
              ? "text-[clamp(2.5rem,9vw,4.5rem)]"
              : "text-[clamp(3.25rem,12vw,7rem)]",
          )}
        >
          {title}
        </h1>
        <div
          aria-hidden={!isCaptionVisible}
          inert={!isCaptionVisible}
          className={cn(
            "overflow-hidden transition-all duration-700 ease-out",
            isCaptionVisible
              ? "max-h-64 translate-y-0 opacity-100"
              : "max-h-0 translate-y-3 opacity-0",
          )}
        >
          <p
            className={cn(
              "mx-auto mt-4 max-w-lg text-center text-base font-normal text-bright",
              cta && "mb-8",
            )}
          >
            {description}
          </p>
          {cta && (
            <a
              className="block mx-auto max-w-lg text-center text-base font-bold underline text-bright"
              href={cta.href}
              tabIndex={isCaptionVisible ? undefined : -1}
            >
              {cta.label}
            </a>
          )}
        </div>
      </div>
    </ScrollableSection>
  );
}
