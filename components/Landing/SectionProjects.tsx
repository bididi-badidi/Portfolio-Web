"use client";
import { SectionHeading } from "../Headings/SectionHeading";
import { Timeline } from "@/components/ui/Timeline";
import { PersonalAIProject } from "../Landing/Project/PersonalAI";
import { XcuisiteProject } from "../Landing/Project/Xcuisite";
import { RemainderApiProject } from "../Landing/Project/RemainderApi";
import { StockAiProject } from "./Project/StockAi";
import { ShortcutsCalendar } from "./Project/ShortcutsCalendar";
import { AgenticWorkflowsProject } from "./Project/AgenticWorkflows";
import { ScrollableSection } from "../layout/ScrollableSection";
import { TimelineMobile } from "@/components/ui/TimelineMobile";
import { useMediaQuery } from "@/app/hooks/useMediaQuery";

export function SectionProjects({ id }: { id: string }) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const data = [
    {
      title: "Late 2025",
      content: (
        <>
          <AgenticWorkflowsProject />
          <StockAiProject />
          <ShortcutsCalendar />
        </>
      ),
    },
    {
      title: "Mid 2025",
      content: <RemainderApiProject />,
    },
    {
      title: "Early 2025",
      content: <PersonalAIProject />,
    },
    {
      title: "2024",
      content: <XcuisiteProject />,
    },
  ];
  return (
    <ScrollableSection id={id} className="w-full relative text-center bg-transparent lg:mb-[25dvh]">
      <div className="h-[18dvh]" />
      <SectionHeading>Projects</SectionHeading>
      {isMobile ? <TimelineMobile data={data} /> : <Timeline data={data} />}
    </ScrollableSection>
  );
}
