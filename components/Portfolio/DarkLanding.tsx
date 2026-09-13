import { ArrowUpRight, Brain, Code2, Database } from "lucide-react";
import { GITHUB_URL, LINKEDIN_URL } from "@/app/config";
import { Navigation } from "./Navigation";
import { Reveal } from "./Motion";
import { ProjectShowcase } from "./ProjectShowcase";
import { Experience } from "./Experience";
import { Contact } from "./Contact";
import { PlanetHero } from "./PlanetHero";
import { ChatLauncher } from "./ChatLauncher";
import styles from "./dark.module.css";

const toolGroups = [
  { name: "Intelligence", icon: Brain, tools: ["Python", "LLM integrations", "AI workflows"] },
  { name: "Applications", icon: Code2, tools: ["React & Next.js", ".NET", "REST & gRPC"] },
  { name: "Infrastructure", icon: Database, tools: ["Azure & AWS", "Docker & Linux", "PostgreSQL & Redis"] },
];

export function DarkLanding() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#about">
        Skip to content
      </a>
      <Navigation />
      <PlanetHero />
      <ChatLauncher />

      <div className={styles.container}>
        <section id="about" data-dark-section className={styles.about} aria-labelledby="about-title">
          <p className={styles.sectionLabel}>01 / About</p>
          <Reveal className={styles.aboutCopy}>
            <h2 id="about-title">
              Analytical by nature.
              <br />
              <span>A builder at heart.</span>
            </h2>
            <p>
              I love discovering where AI and software meet. With a background in Math and Computer Science from NTU, I
              bring a rigorous analytical approach to building intuitive, reliable solutions.
            </p>
            <p className={styles.aboutClosing}>Less repetition. More possibility.</p>
          </Reveal>
        </section>

        <section id="techstack" data-dark-section className={styles.skills} aria-labelledby="skills-title">
          <p className={styles.sectionLabel}>02 / Tech stack</p>
          <Reveal>
            <h2 className={styles.skillsTitle} id="skills-title">
              The right tools.
              <br />
              Thoughtfully connected.
            </h2>
            <div className={styles.toolGroups}>
              {toolGroups.map((group) => (
                <div key={group.name}>
                  <group.icon aria-hidden="true" size={30} strokeWidth={1.35} />
                  <h3>{group.name}</h3>
                  <ul>
                    {group.tools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section id="projects" data-dark-section className={styles.projects} aria-labelledby="projects-title">
          <Reveal>
            <p className={styles.sectionLabel}>03 / Selected work</p>
            <h2 id="projects-title">Ideas into applications.</h2>
            <p className={styles.sectionIntro}>A few things I’ve built to make everyday work a little smarter.</p>
          </Reveal>
          <ProjectShowcase />
        </section>

        <section id="experience" data-dark-section className={styles.experience} aria-labelledby="experience-title">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>04 / Experience</p>
            <Reveal>
              <h2 id="experience-title">Built in the real world.</h2>
            </Reveal>
          </div>
          <Experience />
        </section>

        <section id="contact" data-dark-section className={styles.contact} aria-labelledby="contact-title">
          <Reveal>
            <p className={styles.sectionLabel}>05 / Contact</p>
            <h2 id="contact-title">
              Let’s build something
              <br />
              <span>worth making.</span>
            </h2>
            <p className={styles.sectionIntro}>Have an idea, a question, or an opportunity? I’d love to hear it.</p>
          </Reveal>
          <Contact />
        </section>

        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} Zi Shen Chan</p>
          <nav aria-label="Social and website links">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight aria-hidden="true" size={14} />
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
              LinkedIn <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
