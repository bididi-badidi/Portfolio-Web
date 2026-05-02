// "use client";

import { DottedBackground } from "@/components/ui/DottedBackground";
// import { SectionHeading } from "@/components/Headings/SectionHeading";
import { FloatingNav, navItemInterface } from "@/components/ui/floating-navbar";
// import { ProjectText } from "@/components/Projects/ProjectText";
import { SpotlightHero } from "./SpotlightHero";

export default function RemindersPage() {
  const navItems = [
    { name: "Idea", link: "#hero" },
    { name: "Why", link: "#why" },
    // { name: "Tech", link: "#techstack" },
    { name: "Features", link: "#features" },
    { name: "Workflows", link: "#workflows" },
    { name: "Beyond", link: "#beyond-the-veil" },
  ] as navItemInterface[];

  return (
    <DottedBackground>
      <FloatingNav navItems={navItems} className="bg-surface/80" />
      <div className="w-full items-center justify-center flex flex-col lg:px-[10dvw]">
        <SpotlightHero id="hero" />

        {/* <WhyItMatters id="why" /> */}

        {/*TODO : Links section */}
        {/* <Features id="features" /> */}

        {/* <Workflows id="workflows" /> */}

        {/* <BeyondTheVeil id="beyond-the-veil" /> */}
      </div>

      <div className="h-50"></div>
    </DottedBackground>
  );
}
