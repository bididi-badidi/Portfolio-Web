import { DottedBackground } from "@/components/ui/DottedBackground";
import { SpotlightHero } from "./SpotlightHero";
import { FloatingNav, navItemInterface } from "@/components/ui/floating-navbar";
import { WhyItMatters } from "./WhyItMatters";
import { Features } from "./Features";
import { BeyondTheVeil } from "./BeyondTheVeil";
import { Workflows } from "./Workflows";
import { PersonalAITechStack } from "./TechStack";

const navItems = [
  { name: "Resume", link: "#hero" },
  { name: "Why", link: "#why" },
  { name: "Tech", link: "#techstack" },
  { name: "Features", link: "#features" },
  { name: "Workflows", link: "#workflows" },
  { name: "Beyond", link: "#beyond-the-veil" },
] as navItemInterface[];

export default function PersonalAiPage() {
  return (
    <DottedBackground>
      <FloatingNav navItems={navItems} className="bg-surface/80" />
      <div className="w-full items-center justify-center flex flex-col lg:px-[10dvw]">
        <SpotlightHero id="hero" />

        <WhyItMatters id="why" />

        {/*TODO : Links section */}
        <PersonalAITechStack id="techstack" />
        <Features id="features" />

        <Workflows id="workflows" />

        <BeyondTheVeil id="beyond-the-veil" />
      </div>

      <div className="h-50"></div>
    </DottedBackground>
  );
}
