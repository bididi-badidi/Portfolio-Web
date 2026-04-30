"use client";

import { SectionHeading } from "@/components/Headings/SectionHeading";
import { ProjectText } from "@/components/Projects/ProjectText";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export const WhyItMatters = ({ id }: { id: string }) => {
  return (
    <ScrollableSection
      id={id}
      className="px-[2rem] md:px-0 text-sm md:text-lg mb-[18dvh] place-items-center"
    >
      <SectionHeading>Why It Matters</SectionHeading>
      <TextGenerateEffect
        className="md:text-xl max-w-[85ch] text-center mb-24 text-slate-50"
        delay={2}
        words="Why an AI assistant? To transform the way visitors interact with my
        portfolio. Instead of static Browse, this assistant provides an
        interactive way to access information about my skills, project
        details, or experience, 24/7. It makes finding relevant information
        effortless and engaging, offering a more personalized
        experience navigating through my work."
      />
      <ProjectText className="max-w-[70ch] text-center mb-24  text-bright">
        This project showcases practical application of working with Large
        Language Models (LLMs) to solve complex problems by implementing robust
        function calling.
      </ProjectText>
      <ProjectText className="text-center max-w-[60ch] text-slate-500 ">
        “Robots will not only replace existing jobs but also create new fields
        and opportunities for humans, focusing on unique human strengths like
        creativity and problem-solving.”
        <span className="text-center block mt-16">- Kevin Kelly</span>
      </ProjectText>
    </ScrollableSection>
  );
};
