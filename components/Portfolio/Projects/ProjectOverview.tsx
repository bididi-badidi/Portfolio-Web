import type { ReactNode } from "react";
import { Reveal } from "../Motion";
import base from "../dark.module.css";
import styles from "./project.module.css";

export function ProjectOverview({
  titleId,
  title,
  accent,
  paragraphs,
  label = "01 / The idea",
}: {
  titleId: string;
  title: ReactNode;
  accent: ReactNode;
  paragraphs: readonly ReactNode[];
  label?: string;
}) {
  return (
    <section id="about" data-dark-section className={styles.overview} aria-labelledby={titleId}>
      <p className={base.sectionLabel}>{label}</p>
      <Reveal>
        <h2 id={titleId}>
          {title}
          <br />
          <span className={styles.secondary}>{accent}</span>
        </h2>
        {paragraphs.map((paragraph, index) => (
          <p className={styles.bodyCopy} key={index}>{paragraph}</p>
        ))}
      </Reveal>
    </section>
  );
}
