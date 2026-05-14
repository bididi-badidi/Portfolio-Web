"use client";

import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";
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
  const [compactWrapWidth, setCompactWrapWidth] = useState<number | null>(null);
  const captionTimerRef = useRef<number | null>(null);
  const largeHeadingMeasureRef = useRef<HTMLDivElement | null>(null);
  const compactHeadingMeasureRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  useEffect(() => {
    const measureHeadingWrap = () => {
      if (!isMobile) {
        setCompactWrapWidth(null);
        return;
      }

      const largeMeasure = largeHeadingMeasureRef.current;
      const compactMeasure = compactHeadingMeasureRef.current;

      if (!largeMeasure || !compactMeasure) {
        return;
      }

      const largeMeasureStyles = window.getComputedStyle(largeMeasure);
      const computedLineHeight = Number.parseFloat(
        largeMeasureStyles.lineHeight,
      );
      const largeLineHeight = Number.isFinite(computedLineHeight)
        ? computedLineHeight
        : Number.parseFloat(largeMeasureStyles.fontSize) * 1.2;
      const largeIsWrapped =
        largeMeasure.scrollHeight > Math.ceil(largeLineHeight * 1.5);

      if (!largeIsWrapped) {
        setCompactWrapWidth(null);
        return;
      }

      const compactSingleLineWidth = Math.ceil(compactMeasure.scrollWidth);
      const maxHeadingWidth = window.innerWidth * 0.8;

      setCompactWrapWidth(
        compactSingleLineWidth <= maxHeadingWidth
          ? Math.max(1, compactSingleLineWidth - 1)
          : null,
      );
    };

    measureHeadingWrap();
    window.addEventListener("resize", measureHeadingWrap);

    return () => window.removeEventListener("resize", measureHeadingWrap);
  }, [isMobile, title]);

  return (
    <ScrollableSection
      id={id}
      className="relative flex h-screen w-screen overflow-hidden rounded-md antialiased place-items-center md:items-center md:justify-center"
    >
      <ProjectHeroRings onStatic={handleRingsStatic} />
      <div className="relative z-10 mx-auto w-full max-w-7xl p-4">
        <div
          ref={largeHeadingMeasureRef}
          aria-hidden="true"
          className="invisible pointer-events-none absolute left-0 top-0 -z-10 max-w-[80vw] text-center font-bold text-[clamp(2.75rem,10vw,6rem)]"
        >
          {title}
        </div>
        <div
          ref={compactHeadingMeasureRef}
          aria-hidden="true"
          className="invisible pointer-events-none absolute left-0 top-0 -z-10 whitespace-nowrap text-center font-bold text-[clamp(2.5rem,9vw,4.5rem)]"
        >
          {title}
        </div>
        <h1
          style={{
            maxWidth:
              isHeadingCompact && compactWrapWidth
                ? `${compactWrapWidth}px`
                : undefined,
          }}
          className={cn(
            themeClasses.gradient.heroHeading,
            "mx-auto max-w-[80vw] text-center font-bold transition-[font-size,transform,max-width] duration-500 ease-out",
            isHeadingCompact
              ? "text-[clamp(2.5rem,9vw,4.5rem)]"
              : "text-[clamp(2.75rem,10vw,6rem)]",
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
