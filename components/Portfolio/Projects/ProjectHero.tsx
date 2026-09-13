import type { ReactNode } from "react";
import { Reveal } from "../Motion";
import base from "../dark.module.css";
import styles from "./project.module.css";

export type ProjectHeroAction = {
  label: string;
  icon?: ReactNode;
  primary?: boolean;
} & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
);

export function ProjectHero({
  title,
  accent,
  description,
  actions,
  visual,
  visualClassName,
}: {
  title: ReactNode;
  accent: ReactNode;
  description: ReactNode;
  actions: readonly ProjectHeroAction[];
  visual: ReactNode;
  visualClassName?: string;
}) {
  return (
    <section
      id="hero"
      data-dark-section
      className={`${base.container} ${styles.hero}`}
      aria-labelledby="project-title"
    >
      <h1 id="project-title">
        {title}
        <br />
        <span>{accent}</span>
      </h1>
      <p className={styles.heroDescription}>{description}</p>
      <div className={base.actions}>
        {actions.map((action) => {
          const className = `${base.button} ${action.primary ? base.primary : ""}`;
          if (action.href) {
            return (
              <a key={action.label} href={action.href} className={className}>
                {action.label} {action.icon}
              </a>
            );
          }
          return (
            <button key={action.label} type="button" className={className} onClick={action.onClick}>
              {action.label} {action.icon}
            </button>
          );
        })}
      </div>
      <Reveal className={`${styles.heroVisual} ${visualClassName ?? ""}`}>{visual}</Reveal>
    </section>
  );
}
