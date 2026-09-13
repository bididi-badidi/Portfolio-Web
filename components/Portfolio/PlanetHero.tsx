"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useMotionPreference } from "./Motion";
import styles from "./dark.module.css";

export function PlanetHero() {
  const section = useRef<HTMLElement>(null);
  const coveredRef = useRef(false);
  const [covered, setCovered] = useState(false);
  const reduceMotion = useMotionPreference();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  // Direct scroll mapping makes the eclipse reversible without a trailing timer.
  const planetY = useTransform(scrollYProgress, [0, 1], ["0svh", "-115svh"]);
  const planetScaleX = useTransform(scrollYProgress, [0, 1], [1, 2.8]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = progress > 0.22;
    if (next !== coveredRef.current) {
      coveredRef.current = next;
      setCovered(next);
    }
  });

  return (
    <section ref={section} id="hero" data-dark-section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroStage}>
        <motion.div
          className={styles.heroContent}
          style={{ y: reduceMotion ? 0 : contentY, scale: reduceMotion ? 1 : contentScale }}
          inert={!reduceMotion && covered}
        >
          <h1 id="hero-title">Intelligence.<br /><span>Made practical.</span></h1>
          <p>I’m Zi Shen. I build AI-powered software that turns<br className={styles.desktopBreak} /> complex problems into intuitive experiences.</p>
          <div className={styles.actions}>
            <a href="#projects" className={`${styles.button} ${styles.primary}`}>Explore my work <ArrowDown size={18} aria-hidden="true" /></a>
            <a href="/image/zi_shen_chan_resume.pdf" target="_blank" rel="noreferrer" className={styles.button}>View résumé <ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
        </motion.div>
        <div className={styles.planetTrack} aria-hidden="true">
          <motion.div className={styles.planet} style={{ y: reduceMotion ? 0 : planetY, scaleX: reduceMotion ? 1 : planetScaleX }} />
        </div>
        <motion.a className={styles.scrollHint} href="#about" style={{ opacity: reduceMotion ? 1 : hintOpacity }} tabIndex={!reduceMotion && covered ? -1 : 0}>Scroll to explore <ArrowDown size={15} aria-hidden="true" /></motion.a>
      </div>
    </section>
  );
}
