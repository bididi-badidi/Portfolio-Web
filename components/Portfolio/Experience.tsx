"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Plus } from "lucide-react";
import { experience } from "./content";
import { spring, useMotionPreference } from "./Motion";
import styles from "./dark.module.css";

export function Experience() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const reduceMotion = useMotionPreference();
  return (
    <div className={styles.experienceList}>
      {experience.map((item, index) => {
        const open = expanded === index;
        return (
          <article key={item.company} className={styles.experienceItem}>
            <button type="button" id={`experience-toggle-${index}`} className={styles.experienceToggle} aria-expanded={open} aria-controls={`experience-detail-${index}`} onClick={() => setExpanded(open ? null : index)}>
              <span className={styles.experienceYear}>{item.year}</span>
              <span className={styles.experienceSummary}><span className={styles.company}>{item.company}</span><span className={styles.role}>{item.role}</span><span className={styles.experienceDescription}>{item.description}</span></span>
              <motion.span className={styles.expandIcon} animate={{ rotate: open ? 45 : 0 }} transition={reduceMotion ? { duration: 0 } : spring}><Plus size={19} aria-hidden="true" /></motion.span>
            </button>
            <motion.div
              className={styles.experienceDisclosure}
              id={`experience-detail-${index}`}
              role="region"
              aria-labelledby={`experience-toggle-${index}`}
              aria-hidden={!open}
              inert={!open}
              initial={false}
              animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
              transition={reduceMotion ? { duration: 0.12 } : { ...spring, opacity: { duration: 0.2 } }}
            >
              <motion.div className={styles.experienceDetail} initial={false} animate={{ y: reduceMotion ? 0 : open ? 0 : -10 }} transition={reduceMotion ? { duration: 0 } : spring}>
                <p>{item.detail}</p>
                {item.href && <Link href={item.href} className={styles.textLink}>Explore the work <ArrowUpRight size={17} aria-hidden="true" /></Link>}
              </motion.div>
            </motion.div>
          </article>
        );
      })}
    </div>
  );
}
