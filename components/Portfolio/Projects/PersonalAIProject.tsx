"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  MessageCircle,
  MousePointer2,
} from "lucide-react";
import { useUIState } from "@/app/context/UIStateContext";
import { ProjectBuild } from "./ProjectBuild";
import { ProjectClosing } from "./ProjectClosing";
import { ProjectDemos } from "./ProjectDemos";
import { ProjectHero } from "./ProjectHero";
import { ProjectOverview } from "./ProjectOverview";
import { ProjectProcess } from "./ProjectProcess";
import { ProjectShell } from "./ProjectShell";
import { ProjectShowcaseSection } from "./ProjectShowcaseSection";
import { PersonalAIConversationPreview } from "./PersonalAIConversationPreview";
import { PersonalAIEvolution } from "./PersonalAIEvolution";
import base from "../dark.module.css";

const processSteps = [
  {
    title: "Find the relevant context",
    subtitle: "Local portfolio retrieval",
    detail:
      "The server searches the portfolio’s local knowledge corpus before generating a reply. The latest question and short follow-up context help select the relevant profile and project information.",
    formula: "Question + conversation → portfolio sources",
    icon: BookOpen,
  },
  {
    title: "Reason with the right tools",
    subtitle: "One agent, a focused toolset",
    detail:
      "An OpenAI agent receives the conversation and retrieved sources. It can search the portfolio again when more context is needed. With site actions enabled, it can also request navigation, an email, or a reminder.",
    formula: "Context + question → answer or tool request",
    icon: MessageCircle,
  },
  {
    title: "Check before acting",
    subtitle: "Typed inputs and explicit intent",
    detail:
      "Tool names and arguments are validated against strict schemas. Missing fields must be supplied, and browser actions are available only when the visitor enables them. The agent can queue at most one browser action per turn.",
    formula: "Tool request → validation → queued action",
    icon: Code2,
  },
  {
    title: "Bring the answer to the interface",
    subtitle: "A reply, then the next step",
    detail:
      "The response updates the conversation. If a valid action was requested, the browser runs the corresponding site function. An action request is treated as queued, not as proof that the action has completed.",
    formula: "Reply → conversation · action → browser",
    icon: MousePointer2,
  },
] as const;

const stack = [
  {
    label: "Interface",
    value: "Next.js · React · TypeScript",
    description: "The portfolio and conversational interface.",
  },
  {
    label: "Intelligence",
    value: "OpenAI Responses API",
    description: "An agent with local portfolio search and tools.",
  },
  {
    label: "Validation",
    value: "Zod · Typed function handlers",
    description: "Structured arguments checked before browser actions.",
  },
] as const;

export function PersonalAIProject() {
  const { setChatOpen } = useUIState();
  const openChat = () => setChatOpen(true);

  return (
    <ProjectShell>
      <ProjectHero
        title="Concierge AI"
        accent="With Harness."
        description={
          <>
            A conversational guide to my work. Built to answer questions,
            <br className={base.desktopBreak} /> find the right project, and help with what comes next.
          </>
        }
        actions={[
          { label: "Try the assistant", onClick: openChat, primary: true, icon: <ArrowUpRight size={18} aria-hidden="true" /> },
          { label: "See it in action", href: "#projects", icon: <ArrowDown size={18} aria-hidden="true" /> },
        ]}
        visual={<PersonalAIConversationPreview onOpen={openChat} />}
      />

      <div className={base.container}>
        <ProjectOverview
          titleId="overview-title"
          title="A portfolio you can"
          accent="have a conversation with."
          paragraphs={[
            "There’s a story behind every project. Finding the part that matters to you should be easy. Personal AI gives visitors a way to ask about my skills, explore the work, and take a useful next step—all in a conversation.",
            "The project brings portfolio knowledge and optional site actions into one interface, with the visitor in control of when the assistant acts.",
          ]}
        />

        <ProjectShowcaseSection
          titleId="demos-title"
          label="02 / In action"
          title="A question is"
          accent="just the beginning."
          description="From finding an answer to making a request. Explore the recordings."
        >
          <ProjectDemos />
        </ProjectShowcaseSection>

        <ProjectProcess
          titleId="architecture-title"
          idPrefix="personal-ai"
          label="03 / Under the hood"
          title="Context first."
          accent="Action with intent."
          description="The current implementation connects local portfolio knowledge, one AI agent, and validated site tools."
          steps={processSteps}
        />

        <ProjectBuild
          titleId="build-title"
          title="A focused stack."
          accent="A connected experience."
          items={stack}
        >
          <PersonalAIEvolution />
        </ProjectBuild>

        <ProjectClosing
          titleId="try-title"
          label="Your turn"
          title="The best way to understand it?"
          accent="Start a conversation."
          description="Ask about a project. Follow your curiosity."
          action={
            <button className={`${base.button} ${base.primary}`} type="button" onClick={openChat}>
              Say hello to Personal AI <ArrowRight size={18} aria-hidden="true" />
            </button>
          }
        />
      </div>
    </ProjectShell>
  );
}
