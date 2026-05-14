"use client";

import { SectionHeading } from "@/components/Headings/SectionHeading";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { ProjectText } from "@/components/Projects/ProjectText";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export function WhyItMatters({ id }: { id: string }) {
  return (
    <ScrollableSection
      id={id}
      className="px-[2rem] md:px-0 text-sm md:text-lg mb-[18dvh] place-items-center"
    >
      <SectionHeading>Why It Matters</SectionHeading>
      <TextGenerateEffect
        className="md:text-xl max-w-[85ch] text-center mb-24 text-slate-50"
        delay={2}
        words="Agentic workflows turn open-ended requests into structured execution. Instead of asking one model to do everything at once, specialized agents collect requirements, plan the work, execute focused tasks, and verify the result before returning a polished answer."
      />
      <ProjectText className="max-w-[70ch] text-center text-bright">
        This category explores AI systems that behave less like single prompts
        and more like coordinated teams: they ask better questions, maintain
        task boundaries, communicate through practical interfaces, and produce
        results that can be checked.
      </ProjectText>
    </ScrollableSection>
  );
}
