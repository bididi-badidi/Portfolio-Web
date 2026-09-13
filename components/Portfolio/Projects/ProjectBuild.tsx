import type { ReactNode } from "react";
import base from "../dark.module.css";
import styles from "./project.module.css";

export interface ProjectStackItem {
  label: string;
  value: ReactNode;
  description: ReactNode;
}

export function ProjectBuild({
  titleId,
  title,
  accent,
  items,
  children,
  label = "04 / The build",
}: {
  titleId: string;
  title: ReactNode;
  accent: ReactNode;
  items: readonly ProjectStackItem[];
  children?: ReactNode;
  label?: string;
}) {
  return (
    <section className={styles.build} aria-labelledby={titleId}>
      <p className={base.sectionLabel}>{label}</p>
      <div>
        <h2 id={titleId}>
          {title}
          <br />
          <span className={styles.secondary}>{accent}</span>
        </h2>
        <dl className={styles.stack}>
          {items.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}<p>{item.description}</p></dd>
            </div>
          ))}
        </dl>
        {children}
      </div>
    </section>
  );
}
