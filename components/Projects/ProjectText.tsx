import { ReactNode } from "react";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";

export function ProjectText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn(themeClasses.text.primary, "text-sm lg:text-lg mb-4", className)}>
      {children}
    </p>
  );
}
