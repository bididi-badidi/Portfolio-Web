"use client";

import { SectionHeading } from "@/components/Headings/SectionHeading";
import { ProjectDetail } from "@/components/Projects/ProjectDetail";
import { ProjectHeading } from "@/components/Projects/ProjectHeading";
import { ProjectText } from "@/components/Projects/ProjectText";
import { LinkPreview } from "@/components/Contact/LinkPreview";
import { ScrollableSection } from "@/components/layout/ScrollableSection";

export const Features = ({ id }: { id: string }) => {
  return (
    <ScrollableSection id={id} className="mb-[15dvh] place-items-center">
      <SectionHeading className="md:text-3xl">Features</SectionHeading>

      <ProjectDetail
        videoSrc="/videos/portfolio/conversation.mp4"
        multipleCol
        height="300px"
        className="mb-[10dvh] text-start place-items-center"
      >
        <ProjectHeading>Trustworthy Answers</ProjectHeading>
        <ProjectText className="sm:mb-4">
          - Information Retrieval from RAG architecture ensures users get the
          updated answer.
        </ProjectText>
        <ProjectText className="sm:mb-4">
          - Focused on delivering accurate answers grounded in my portfolio
          data, ensuring information is readily accessible.
        </ProjectText>
        <ProjectText>
          - Can&apos;t fit all the FAQs in a website? Let AI handle them!
        </ProjectText>
      </ProjectDetail>

      <ProjectText className="text-center text-foreground mb-[10dvh]">
        My AI can now perform helpful actions directly within the portfolio
        website!
      </ProjectText>

      <ProjectDetail
        videoSrc="/videos/portfolio/scroll.mp4"
        multipleCol
        height="300px"
        className="mb-[10dvh] place-items-center"
      >
        <ProjectHeading>Navigation</ProjectHeading>
        <ProjectText className="sm:mb-4">
          - Scrolling to target section upon request.
        </ProjectText>
        <ProjectText className="sm:mb-4">
          - Offers help when needed.
        </ProjectText>
        <ProjectText>- &quot;show me your projects section!&quot;</ProjectText>
      </ProjectDetail>

      <ProjectDetail
        videoSrc="/videos/portfolio/email.mp4"
        multipleCol
        height="300px"
        className="place-items-center mb-[10dvh]"
      >
        <ProjectHeading>Email Sending</ProjectHeading>
        <ProjectText className="sm:mb-4">
          - It is always better to have someone to do the job for you!
        </ProjectText>
        <ProjectText>
          - Say &quot;Send an email to Zi Shen&quot;. He knows what to do.
        </ProjectText>
      </ProjectDetail>

      <ProjectDetail
        videoSrc="/videos/remainderApi/interaction.mp4"
        multipleCol
        height="300px"
        className="place-items-center mb-[10dvh]"
      >
        <ProjectHeading>Reminders Creation</ProjectHeading>
        <ProjectText className="sm:mb-4">
          - Allows visitors to leave actionable follow-up requests.
        </ProjectText>
        <ProjectText>
          - &quot;Remind Zi Shen to reply to my invitation for meeting this
          after at 3pm.&quot;
        </ProjectText>
        <LinkPreview
          url="./reminders"
          className="text-xl lg:text-2xl font-bold"
          isStatic
          imageSrc="/image/preview-remainder-api.png"
        >
          Interact with AI to Create Reminders.
        </LinkPreview>
      </ProjectDetail>

      <ProjectText>And So Much More...</ProjectText>
    </ScrollableSection>
  );
};
