"use client";

import { LinkPreview } from "@/components/Contact/LinkPreview";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { ProjectDetail } from "@/components/Projects/ProjectDetail";
import { ProjectHeading } from "@/components/Projects/ProjectHeading";
import { ProjectText } from "@/components/Projects/ProjectText";

export function AgenticWorkflowsProject() {
  return (
    <ScrollableSection id="agentic-workflows">
      <ProjectHeading>Agentic Workflows</ProjectHeading>
      <ProjectDetail
        imgSrc="/image/agentic-workflow.png"
        alt="Agentic workflow diagram"
        width={600}
        height="300px"
        multipleCol
        className="sm:text-center place-items-center"
      >
        <ProjectText className="mb-2">
          Multi-agent systems for research, personal operations, coding, and
          analysis.
        </ProjectText>
        <ProjectText className="text-muted">
          Featuring Deep Research and Telegram-connected Assistants.
        </ProjectText>
        <LinkPreview
          url="./projects/agentic-workflows"
          className="text-xl lg:text-3xl font-bold"
          isStatic
          imageSrc="/image/agentic-workflow.png"
        >
          Learn More
        </LinkPreview>
      </ProjectDetail>
    </ScrollableSection>
  );
}
