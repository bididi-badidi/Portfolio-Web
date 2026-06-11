"use client";

import {
  DottedBackground,
  DottedInnerWrapper,
} from "@/components/ui/DottedBackground";
import { SectionHeading } from "@/components/Headings/SectionHeading";
import { ProjectText } from "@/components/Projects/ProjectText";

import { ReminderProvider } from "@/app/context/ReminderContext";
import { ReminderGrid } from "./ReminderGrid";

export default function RemindersPage() {
  return (
    <ReminderProvider>
      <DottedBackground>
        <DottedInnerWrapper className="py-[5dvh]">
          <SectionHeading className="md:text-5xl " animation={false}>
            Reminders Playground
          </SectionHeading>
          <ProjectText className="text-muted text-center max-w-[70ch]">
            For security reasons, reminders created via chat window are not
            displayed here. <br />
            To observe the reminder creation process, use the input field below.
          </ProjectText>
          <ReminderGrid />
        </DottedInnerWrapper>
        ++
      </DottedBackground>
    </ReminderProvider>
  );
}
