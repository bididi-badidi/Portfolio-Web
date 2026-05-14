"use client";
import { ProjectHeading } from "../../Projects/ProjectHeading";
import { ProjectText } from "../../Projects/ProjectText";
import { ProjectDetail } from "../../Projects/ProjectDetail";
import { LinkPreview } from "@/components/Contact/LinkPreview";
import { ScrollableSection } from "@/components/layout/ScrollableSection";

function PersonalAIProject() {
  return (
    <ScrollableSection id="personal-assistant">
      <ProjectHeading>Personal AI Assistant</ProjectHeading>
      <ProjectDetail
        className="sm:text-center"
        videoSrc="/videos/portfolio/conversation.mp4"
      >
        <ProjectText>Fine-tuned AI to handle queries.</ProjectText>
        <LinkPreview
          url="./projects/personal-ai"
          className="text-xl lg:text-3xl font-bold"
          isStatic
          imageSrc="/image/preview-personal-ai.png"
        >
          Learn More
        </LinkPreview>
      </ProjectDetail>
      <ProjectDetail
        className="sm:text-center"
        videoSrc="/videos/portfolio/scroll.mp4"
        multipleCol
      >
        <ProjectText>Action Execution</ProjectText>
        <LinkPreview
          url="./projects/personal-ai"
          className="text-xl lg:text-3xl font-bold"
          isStatic
          imageSrc="/image/preview-personal-ai.png"
        >
          Learn More
        </LinkPreview>
      </ProjectDetail>
    </ScrollableSection>
  );
}

export { PersonalAIProject };
