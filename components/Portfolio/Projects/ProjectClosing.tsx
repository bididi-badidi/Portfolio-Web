import type { ReactNode } from "react";
import { Reveal } from "../Motion";
import base from "../dark.module.css";
import styles from "./project.module.css";

export function ProjectClosing({
  titleId,
  label,
  title,
  accent,
  description,
  action,
}: {
  titleId: string;
  label: string;
  title: ReactNode;
  accent: ReactNode;
  description: ReactNode;
  action: ReactNode;
}) {
  return (
    <section id="contact" data-dark-section className={styles.trySection} aria-labelledby={titleId}>
      <Reveal>
        <p className={base.sectionLabel}>{label}</p>
        <h2 id={titleId}>
          {title}
          <br />
          <span className={styles.secondary}>{accent}</span>
        </h2>
        <p className={styles.sectionDescription}>{description}</p>
      </Reveal>
      {action}
    </section>
  );
}
