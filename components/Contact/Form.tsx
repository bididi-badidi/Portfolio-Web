"use client";
import React, { useRef } from "react";
import { Label } from "./Label";
import { Input } from "./Input";
import { cn } from "@/app/utils/cn";
import { themeClasses } from "@/app/styles/themeClasses";
import { sendFormEmail } from "@/app/api/sendEmail";
import { EMAIL_ADDRESS } from "@/app/config";

export function Form() {
  const form = useRef<HTMLFormElement>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.current) {
      sendFormEmail({ formDetails: form.current });
    }
  };
  return (
    <div className={cn(themeClasses.surface.elevated, "shadow-input w-full max-w-full md:max-w-lg p-4 rounded-2xl md:p-8 bg-elevated/85 backdrop-blur-md")}>
      <form className="my-8" onSubmit={handleSubmit} ref={form}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="name">Name*</Label>
          <Input name="name" id="name" required placeholder="Zi Shen" type="text" />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email*</Label>
          <Input name="email" id="email" required placeholder={EMAIL_ADDRESS} type="email" />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="title">Title*</Label>
          <Input name="title" id="title" placeholder="email title" required type="text" />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <Label htmlFor="content">Comments</Label>
          <Input name="content" id="content" placeholder="send some thoughts" type="text" />
        </LabelInputContainer>

        <button
          className={cn(
            themeClasses.gradient.primaryAction,
            themeClasses.text.onAccent,
            "group/btn relative block h-10 w-full rounded-md font-medium shadow-[0px_1px_0px_0px_var(--color-border-glass-strong)_inset,0px_-1px_0px_0px_var(--color-border-glass-strong)_inset] backdrop-blur-md cursor-pointer"
          )}
          type="submit"
        >
          Send Email &nbsp; &rarr;
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-heading-from to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-heading-from to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
};
