"use client";

import { SectionHeading } from "@/components/Headings/SectionHeading";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { ProjectGrid } from "@/components/Projects/ProjectGrid";
import { ProjectHeading } from "@/components/Projects/ProjectHeading";
import { ProjectText } from "@/components/Projects/ProjectText";
import { ProjectTextBox } from "@/components/Projects/ProjectTextBox";
import Image from "next/image";

export function DeepResearchDetails() {
  return (
    <>
      <ScrollableSection id="workflow" className="mb-[18dvh] place-items-center">
        <SectionHeading className="md:text-3xl">Workflow</SectionHeading>
        <ProjectGrid multipleCol className="place-items-center">
          <Image
            src="/image/deep-research-workflow.png"
            width={600}
            height={338}
            alt="Deep research workflow diagram"
            className="place-self-center rounded-xl"
          />
          <ProjectTextBox className="max-w-[70ch] lg:max-w-[50ch]">
            <ProjectHeading className="lg:text-start">Research Intake</ProjectHeading>
            <ProjectText>
              The reception agent holds a multiturn conversation until the
              topic, aim, scope, and preferred sources are explicit enough for
              reliable research.
            </ProjectText>
            <ProjectText>
              This structured intake becomes the contract for every downstream
              research agent.
            </ProjectText>
          </ProjectTextBox>
        </ProjectGrid>
      </ScrollableSection>

      <ScrollableSection id="details" className="mb-[18dvh] place-items-center">
        <SectionHeading className="md:text-3xl">Details</SectionHeading>
        <ProjectGrid multipleCol className="place-items-center">
          <ProjectTextBox className="max-w-[70ch] lg:max-w-[50ch]">
            <ProjectHeading className="lg:text-start">Lead Agent</ProjectHeading>
            <ProjectText>
              The lead agent decomposes the research topic into focused scopes,
              assigns each scope to a research agent, and keeps the final answer
              aligned with the original aim.
            </ProjectText>
          </ProjectTextBox>
          <ProjectTextBox className="max-w-[70ch] lg:max-w-[50ch]">
            <ProjectHeading className="lg:text-start">Citation Agent</ProjectHeading>
            <ProjectText>
              A complementary citation agent verifies cited sources before the
              lead agent compiles the result, making the final response easier
              to trust.
            </ProjectText>
          </ProjectTextBox>
        </ProjectGrid>
      </ScrollableSection>
    </>
  );
}
