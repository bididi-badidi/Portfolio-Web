"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Plus, type LucideIcon } from "lucide-react";
import { spring, useMotionPreference } from "../Motion";
import base from "../dark.module.css";
import styles from "./project.module.css";

export interface ProjectProcessStep {
  title: string;
  subtitle: string;
  detail: ReactNode;
  formula: ReactNode;
  icon: LucideIcon;
}

export function ProjectProcess({
  titleId,
  idPrefix,
  label,
  title,
  accent,
  description,
  steps,
}: {
  titleId: string;
  idPrefix: string;
  label: string;
  title: ReactNode;
  accent: ReactNode;
  description: ReactNode;
  steps: readonly ProjectProcessStep[];
}) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const reduceMotion = useMotionPreference();

  return (
    <section id="techstack" data-dark-section className={styles.architecture} aria-labelledby={titleId}>
      <div className={styles.architectureIntro}>
        <p className={base.sectionLabel}>{label}</p>
        <h2 id={titleId}>
          {title}
          <br />
          <span className={styles.secondary}>{accent}</span>
        </h2>
        <p className={styles.sectionDescription}>{description}</p>
      </div>
      <div className={styles.steps}>
        {steps.map((step, index) => {
          const open = expanded === index;
          const toggleId = `${idPrefix}-step-toggle-${index}`;
          const detailId = `${idPrefix}-step-detail-${index}`;
          return (
            <article className={styles.step} key={step.title}>
              <button
                type="button"
                id={toggleId}
                className={styles.stepToggle}
                aria-expanded={open}
                aria-controls={detailId}
                onClick={() => setExpanded(open ? null : index)}
              >
                <span className={styles.stepNumber}>0{index + 1}</span>
                <span className={styles.stepHeading}>
                  <span>{step.title}</span>
                  <small>{step.subtitle}</small>
                </span>
                <motion.span
                  className={base.expandIcon}
                  animate={{ rotate: open ? 45 : 0 }}
                  transition={reduceMotion ? { duration: 0 } : spring}
                >
                  <Plus size={18} aria-hidden="true" />
                </motion.span>
              </button>
              <motion.div
                id={detailId}
                role="region"
                aria-labelledby={toggleId}
                aria-hidden={!open}
                inert={!open}
                className={styles.stepDisclosure}
                initial={false}
                animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                transition={reduceMotion ? { duration: 0.1 } : { ...spring, opacity: { duration: 0.2 } }}
              >
                <div className={styles.stepBody}>
                  <p>{step.detail}</p>
                  <div className={styles.stepFormula}>
                    <step.icon size={17} aria-hidden="true" />
                    <span>{step.formula}</span>
                  </div>
                </div>
              </motion.div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
