"use client";
import React, { useRef, useState } from "react";
import { Label } from "./Label";
import { Input } from "./Input";
import { cn } from "@/app/utils/cn";
import { sendFormEmail } from "@/app/api/sendEmail";
import { EMAIL_ADDRESS } from "@/app/config";
import { GlassButton } from "@/components/Buttons/GlassButton";
import { AnimatedBlobs } from "@/components/ui/AnimatedBlobs";
import { FluidGlass } from "@/components/ui/FluidGlass";
import { Send } from "lucide-react";

export function Form() {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.current || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await sendFormEmail({ formDetails: form.current });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <FluidGlass
      borderRadius="14px"
      tintColor="rgb(2 6 23 / 0.72)"
      containerClassName="h-auto w-full"
      className="relative overflow-hidden border-glass-border-strong bg-[linear-gradient(145deg,rgb(255_255_255_/_0.075),rgb(255_255_255_/_0.025)_45%,rgb(99_102_241_/_0.08))] p-4 shadow-[0_24px_80px_rgb(0_0_0_/_0.48),inset_0_1px_0_rgb(255_255_255_/_0.16)] md:p-8"
    >
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <AnimatedBlobs />
      </div>
      <form className="w-full max-w-full md:max-w-lg" onSubmit={handleSubmit} ref={form}>
        <div className="grid gap-4">
          <LabelInputContainer>
            <Label htmlFor="name">Name*</Label>
            <Input name="name" id="name" required placeholder="Zi Shen" type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="email">Email*</Label>
            <Input name="email" id="email" required placeholder={EMAIL_ADDRESS} type="email" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="title">Title*</Label>
            <Input name="title" id="title" placeholder="email title" required type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="content">Comments</Label>
            <Input name="content" id="content" placeholder="send some thoughts" type="text" />
          </LabelInputContainer>

          <GlassButton
            className="group/btn mt-4 h-11 w-full"
            contentClassName="gap-2"
            type="submit"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Send Email
            <BottomGradient />
          </GlassButton>
        </div>
      </form>
    </FluidGlass>
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
