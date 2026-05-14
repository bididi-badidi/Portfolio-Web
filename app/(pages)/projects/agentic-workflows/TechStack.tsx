"use client";

import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { ProjectTechStack } from "@/components/Projects/ProjectTechStack";

export function AgenticWorkflowsTechStack({ id }: { id: string }) {
  const iconList = [
    "chatgpt",
    "claude",
    "langchain",
    "gemini",
    "python",
    "aws",
  ];

  return (
    <ScrollableSection id={id} className="mb-[20dvh]">
      <ProjectTechStack
        title="Core Technologies"
        postTitle="and agent orchestration patterns."
        iconList={iconList}
      />
    </ScrollableSection>
  );
}
