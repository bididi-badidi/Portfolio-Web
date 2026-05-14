import { DottedBackground } from "@/components/ui/DottedBackground";
import { FloatingNav, navItemInterface } from "@/components/ui/floating-navbar";
import { AgenticWorkflowsTechStack } from "./TechStack";
import { Projects } from "./Projects";
import { SpotlightHero } from "./SpotlightHero";
import { WhyItMatters } from "./WhyItMatters";

const navItems = [
  { name: "Introduction", link: "#hero" },
  { name: "Why", link: "#why" },
  { name: "Tech", link: "#techstack" },
  { name: "Projects", link: "#projects" },
] as navItemInterface[];

export default function AgenticWorkflowsPage() {
  return (
    <DottedBackground>
      <FloatingNav navItems={navItems} className="bg-surface/80" />
      <div className="w-full items-center justify-center flex flex-col lg:px-[10dvw]">
        <SpotlightHero id="hero" />
        <WhyItMatters id="why" />
        <AgenticWorkflowsTechStack id="techstack" />
        <Projects id="projects" />
      </div>
      <div className="h-50"></div>
    </DottedBackground>
  );
}
