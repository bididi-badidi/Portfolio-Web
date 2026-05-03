"use client";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";
import { FadeUpInView } from "../ui/FadeUpInView";

const headingClassName = cn(
  themeClasses.gradient.heading,
  "py-4 text-4xl font-bold tracking-tight md:text-5xl"
);

export function SectionHeading({
  children,
  className,
  animation = true,
}: {
  children: React.ReactNode | string;
  className?: string;
  animation?: boolean;
}) {
  return animation ? (
    <FadeUpInView
      className={cn("h-[5rem] mb-12 lg:h-[10rem] text-center", className)}
    >
      <h2 className={headingClassName}>{children}</h2>
    </FadeUpInView>
  ) : (
    <div className={cn("text-center", className)}>
      <h2 className={headingClassName}>{children}</h2>
    </div>
  );
}
