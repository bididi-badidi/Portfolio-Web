import { DottedBackground } from "@/components/ui/DottedBackground";
import { SpotlightRemainders } from "./SpotlightHero";
import { HeroVideo } from "./HeroVideo";
import { Features } from "./Features";
import { Implementations } from "./Implementations";
import { RemaindersTechStack } from "./RemainderTechStack";
import { FloatingNav, navItemInterface } from "@/components/ui/floating-navbar";

// TODO - Challenges, Arvhitecture overview

const navItems = [
  { name: "Idea", link: "#hero" },
  { name: "Video", link: "#video" },
  { name: "Tech", link: "#techstack" },
  { name: "Features", link: "#features" },
  { name: "Implementations", link: "#implementations" },
] as navItemInterface[];

export default function PersonalAiPage() {
  return (
    <DottedBackground>
      <FloatingNav navItems={navItems} className="bg-surface/80" />
      <div className="w-full items-center justify-center flex flex-col lg:pl-[6dvw] lg:pr-[5dvw]">
        <SpotlightRemainders id="hero" />

        <HeroVideo id="video" />

        <RemaindersTechStack id="techstack" />

        <Features id="features" />

        <Implementations id="implementations" />
      </div>
      <div className="h-50" />
    </DottedBackground>
  );
}
