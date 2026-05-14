"use client";

import { SectionHeading } from "@/components/Headings/SectionHeading";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { ProjectGrid } from "@/components/Projects/ProjectGrid";
import { ProjectText } from "@/components/Projects/ProjectText";
import { ProjectTextBox } from "@/components/Projects/ProjectTextBox";
import { Timeline } from "@/components/ui/Timeline";
import { LinkPreview } from "@/components/Contact/LinkPreview";
import Image from "next/image";

export function Projects({ id }: { id: string }) {
  const data = [
    {
      title: "Deep Research",
      content: (
        <ProjectGrid multipleCol className="mb-[12dvh] place-items-center">
          <Image
            src="/image/deep-research-workflow-2.png"
            width={600}
            height={338}
            alt="Deep research workflow diagram"
            className="place-self-center rounded-xl"
          />
          <ProjectTextBox className="max-w-[70ch] lg:max-w-[50ch]">
            <ProjectText>
              A reception agent collects the research topic, aim, scope, and preferred sources through a multiturn
              conversation before any research begins.
            </ProjectText>
            <ProjectText>
              A lead agent breaks the topic into focused scopes, spins up multiple research agents, and asks a
              complementary citation agent to verify cited sources before compiling the final response.
            </ProjectText>
            <LinkPreview
              url="https://github.com/bididi-badidi/deep-research"
              className="text-xl lg:text-2xl font-bold"
              isStatic
              imageSrc="/image/deep-research-workflow-2.png"
            >
              Learn More
            </LinkPreview>
          </ProjectTextBox>
        </ProjectGrid>
      ),
    },
    {
      title: "Assistants",
      content: (
        <ProjectGrid multipleCol className="mb-[10dvh] place-items-center">
          <Image
            src="/image/assistants.png"
            width={600}
            height={338}
            alt="Deep research workflow diagram"
            className="place-self-center rounded-xl"
          />
          <ProjectTextBox className="max-w-[70ch] lg:max-w-[50ch]">
            <ProjectText>
              A set of individual agents with different capabilities communicate through Telegram, so operational tasks
              can happen from a familiar chat interface.
            </ProjectText>
            <ProjectText>
              Examples include a secretary for headlines and mail reports, a coding agent that starts Gemini, Codex, or
              Claude CLI processes in project directories, and a financial analyst for earnings reports and business
              model analysis.
            </ProjectText>
            <LinkPreview
              url="https://github.com/bididi-badidi/Agents"
              className="text-xl lg:text-2xl font-bold"
              isStatic
              imageSrc="/image/assistants.png"
            >
              Learn More
            </LinkPreview>
          </ProjectTextBox>
        </ProjectGrid>
      ),
    },
  ];

  return (
    <ScrollableSection id={id} className="mb-[15dvh] w-full place-items-center">
      <SectionHeading className="md:text-3xl">Projects</SectionHeading>
      <Timeline data={data} titleClassName="text-lg md:text-2xl lg:text-3xl" />
    </ScrollableSection>
  );
}
