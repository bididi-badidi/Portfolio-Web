import { TechGrid } from "@/components/Landing/TechGrid/TechStack";
import { SectionProjects } from "@/components/Landing/SectionProjects";
import { DottedBackground } from "@/components/ui/DottedBackground";
import { SectionContact } from "@/components/Contact/SectionContact";
import { SectionHero } from "@/components/Landing/Hero/SectionHero";
import { FloatingNav, navItemInterface } from "@/components/ui/floating-navbar";
import { SectionAbout } from "@/components/Landing/SectionAbout";
import { SectionExperience } from "@/components/Landing/SectionExperience";

const navItems = [
  { name: "About", link: "#about" },
  { name: "Tech Stack", link: "#techstack" },
  { name: "Experience", link: "#experience" },
  { name: "Project", link: "#projects" },
  { name: "Contact", link: "#contact" },
] as navItemInterface[];

export default function Home() {
  return (
    <>
      <FloatingNav navItems={navItems} showHome={false} />
      <SectionHero id="hero" />
      <div className="h-[10rem] bg-gradient-to-b from-background to-transparent" />
      <SectionAbout id="about" />
      <TechGrid id="techstack" />
      <DottedBackground>
        <SectionProjects id="projects" />
        <SectionExperience id="experience" />
        <SectionContact id="contact" />
      </DottedBackground>
    </>
  );
}
