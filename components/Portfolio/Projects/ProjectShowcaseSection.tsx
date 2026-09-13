import type { ReactNode } from "react";
import { Reveal } from "../Motion";
import base from "../dark.module.css";
import styles from "./project.module.css";

export function ProjectShowcaseSection({
  titleId,
  label,
  title,
  accent,
  description,
  children,
}: {
  titleId: string;
  label: string;
  title: ReactNode;
  accent: ReactNode;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id="projects" data-dark-section className={styles.section} aria-labelledby={titleId}>
      <Reveal>
        <p className={base.sectionLabel}>{label}</p>
        <h2 id={titleId}>
          {title}
          <br />
          <span className={styles.secondary}>{accent}</span>
        </h2>
        <p className={styles.sectionDescription}>{description}</p>
      </Reveal>
      {children}
    </section>
  );
}
