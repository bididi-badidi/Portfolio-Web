import { ReactNode } from "react";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";

export function ProjectHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(themeClasses.text.primary, "text-center text-xl md:text-3xl font-bold mb-8", className)}
    >
      {children}
    </h3>
  );
}
