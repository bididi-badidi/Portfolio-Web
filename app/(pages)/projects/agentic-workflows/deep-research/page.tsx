import { DottedBackground } from "@/components/ui/DottedBackground";
import { FloatingNav, navItemInterface } from "@/components/ui/floating-navbar";
import { ProjectSpotlightHero } from "@/components/Projects/ProjectSpotlightHero";
import { DeepResearchDetails } from "./sections";

const navItems = [
  { name: "Introduction", link: "#hero" },
  { name: "Workflow", link: "#workflow" },
  { name: "Details", link: "#details" },
] as navItemInterface[];

export default function DeepResearchPage() {
  return (
    <DottedBackground>
      <FloatingNav navItems={navItems} className="bg-surface/80" />
      <div className="w-full items-center justify-center flex flex-col lg:px-[10dvw]">
        <ProjectSpotlightHero
          id="hero"
          title={<>Deep Research</>}
          description={
            <>
              A multi-agent research workflow that turns vague research needs
              into scoped investigation, source verification, and a compiled
              answer.
            </>
          }
          cta={{ href: "#workflow", label: "See Workflow" }}
        />
        <DeepResearchDetails />
      </div>
      <div className="h-50"></div>
    </DottedBackground>
  );
}
