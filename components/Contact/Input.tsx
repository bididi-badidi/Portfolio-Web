// Input component extends from shadcnui - https://ui.shadcn.com/docs/components/input
"use client";
import * as React from "react";
import { cn } from "@/app/utils/cn";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <div className="rounded-[14px] p-[1px]">
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[13px] border border-glass-border bg-[rgb(255_255_255_/_0.035)] px-4 py-2 text-sm text-bright shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08)] transition duration-300 placeholder:text-foreground/55 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-glass-border-strong hover:bg-[rgb(255_255_255_/_0.055)] focus-visible:border-glass-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";

export { Input };
