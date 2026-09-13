"use client";

import {
  DottedBackground,
  DottedInnerWrapper,
} from "@/components/ui/DottedBackground";
import { SectionHeading } from "@/components/Headings/SectionHeading";
import { ProjectText } from "@/components/Projects/ProjectText";

import { ReminderProvider } from "@/app/context/ReminderContext";
import { ReminderGrid } from "./ReminderGrid";
import { ProjectShell } from "@/components/Portfolio/Projects/ProjectShell";

const links = [{ label: "Playground", id: "about" }];
const targets = ["about"];

export default function RemindersPage() {
  return (
    <ProjectShell links={links} extraLinks={[]} targets={targets}>
    <ReminderProvider>
      <section id="about" className="pt-24">
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
      </DottedBackground>
      </section>
    </ReminderProvider>
    </ProjectShell>
  );
}
