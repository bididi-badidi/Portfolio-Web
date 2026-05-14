import { DottedBackground } from "@/components/ui/DottedBackground";
import { FloatingNav, navItemInterface } from "@/components/ui/floating-navbar";
import { ProjectSpotlightHero } from "@/components/Projects/ProjectSpotlightHero";
import { AssistantsDetails } from "./sections";

const navItems = [
  { name: "Introduction", link: "#hero" },
  { name: "Workflow", link: "#workflow" },
  { name: "Agents", link: "#agents" },
] as navItemInterface[];

export default function AssistantsPage() {
  return (
    <DottedBackground>
      <FloatingNav navItems={navItems} className="bg-surface/80" />
      <div className="w-full items-center justify-center flex flex-col lg:px-[10dvw]">
        <ProjectSpotlightHero
          id="hero"
          title={<>Assistants</>}
          description={
            <>
              A Telegram-connected assistant system where specialized agents
              handle operations, coding tasks, and financial analysis from chat.
            </>
          }
          cta={{ href: "#workflow", label: "See Workflow" }}
        />
        <AssistantsDetails />
      </div>
      <div className="h-50"></div>
    </DottedBackground>
  );
}
