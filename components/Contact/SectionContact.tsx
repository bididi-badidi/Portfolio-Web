"use client";
import { LinkPreview } from "./LinkPreview";
import { Form } from "./Form";
import { SectionHeading } from "@/components/Headings/SectionHeading";
import { EmailCopy } from "./EmailCopy";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { GITHUB_URL, LINKEDIN_URL } from "@/app/config";

export function SectionContact({ id }: { id: string }) {
  return (
    <ScrollableSection id={id}>
      <SectionHeading>Contact Me</SectionHeading>
      <div className="flex flex-col md:flex-row align-center place-items-center justify-center gap-[10dvw]">
        <div className="text-xl md:text-3xl flex flex-row md:flex-col justify-around items-center gap-[10dvw]">
          <LinkPreview url={GITHUB_URL} className="font-bold">
            GitHub
          </LinkPreview>
          <LinkPreview url={LINKEDIN_URL} className="font-bold">
            LinkedIn
          </LinkPreview>
          <EmailCopy />
        </div>
        <div className="min-w-[min(90%,25rem)] md:min-w-[25rem]">
          <div className="items-center justify-center">
            <h3 className="text-lg text-center mb-[1rem] text-foreground">Or simply fill out this form</h3>
          </div>
          <Form />
        </div>
      </div>
    </ScrollableSection>
  );
}
