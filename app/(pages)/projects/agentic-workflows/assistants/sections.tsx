"use client";

import { SectionHeading } from "@/components/Headings/SectionHeading";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { ProjectGrid } from "@/components/Projects/ProjectGrid";
import { ProjectHeading } from "@/components/Projects/ProjectHeading";
import { ProjectText } from "@/components/Projects/ProjectText";
import { ProjectTextBox } from "@/components/Projects/ProjectTextBox";
import { WorkflowDiagram } from "../WorkflowDiagram";

export function AssistantsDetails() {
  return (
    <>
      <ScrollableSection id="workflow" className="mb-[18dvh] place-items-center">
        <SectionHeading className="md:text-3xl">Workflow</SectionHeading>
        <ProjectGrid multipleCol className="place-items-center">
          <WorkflowDiagram variant="assistants" />
          <ProjectTextBox className="max-w-[70ch] lg:max-w-[50ch]">
            <ProjectHeading className="lg:text-start">Chat-Native Agents</ProjectHeading>
            <ProjectText>
              Each assistant exposes a focused capability through Telegram,
              keeping recurring workflows available from a familiar messaging
              interface.
            </ProjectText>
            <ProjectText>
              The goal is to make useful agents feel like dependable contacts,
              not a dashboard users have to remember to open.
            </ProjectText>
          </ProjectTextBox>
        </ProjectGrid>
      </ScrollableSection>

      <ScrollableSection id="agents" className="mb-[18dvh] place-items-center">
        <SectionHeading className="md:text-3xl">Agents</SectionHeading>
        <ProjectGrid multipleCol className="place-items-center">
          <ProjectTextBox className="max-w-[70ch] lg:max-w-[50ch]">
            <ProjectHeading className="lg:text-start">Secretary</ProjectHeading>
            <ProjectText>
              Fetches, compiles, and reports useful headlines and mail updates.
            </ProjectText>
            <ProjectHeading className="lg:text-start">Coding Agent</ProjectHeading>
            <ProjectText>
              Runs subprocesses inside a project directory to start Gemini,
              Codex, or Claude CLI for coding tasks.
            </ProjectText>
          </ProjectTextBox>
          <ProjectTextBox className="max-w-[70ch] lg:max-w-[50ch]">
            <ProjectHeading className="lg:text-start">Financial Analyst</ProjectHeading>
            <ProjectText>
              Performs analysis on company earnings reports, business models,
              and related financial research tasks.
            </ProjectText>
          </ProjectTextBox>
        </ProjectGrid>
      </ScrollableSection>
    </>
  );
}
