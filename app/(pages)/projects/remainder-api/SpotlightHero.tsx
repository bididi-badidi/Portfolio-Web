"use client";

import { useState } from "react";
import { ProjectHeroRings } from "@/components/Projects/ProjectHeroRings";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";

export function SpotlightRemainders({ id }: { id: string }) {
  const [isHeadingCompact, setIsHeadingCompact] = useState(false);
  const [isCaptionVisible, setIsCaptionVisible] = useState(false);

  const handleRingsStatic = () => {
    setIsHeadingCompact(true);
    window.setTimeout(() => setIsCaptionVisible(true), 520);
  };

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
          RemAInders
        </h1>
        <p
          className={cn(
            "mx-auto mt-4 max-w-lg overflow-hidden text-center text-base font-normal text-bright transition-all duration-700 ease-out",
            isCaptionVisible
              ? "max-h-64 translate-y-0 opacity-100"
              : "max-h-0 translate-y-3 opacity-0",
          )}
        >
          Flexibility and extensibility are key to integrating new features into
          digital ecosystem. For example, automatically reminding your
          colleagues to attend meeting happening this afternoon via an AI.
        </p>
      </div>
    </ScrollableSection>
  );
}
