"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { spring, useMotionPreference } from "../Motion";
import styles from "./project.module.css";

export function PersonalAIEvolution() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useMotionPreference();

  return (
    <div className={styles.evolution}>
      <button
        type="button"
        id="earlier-build-toggle"
        className={styles.evolutionToggle}
        aria-expanded={open}
        aria-controls="earlier-build"
        onClick={() => setOpen(!open)}
      >
        The project’s earlier architecture{" "}
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={reduceMotion ? { duration: 0 } : spring}>
          <Plus size={17} aria-hidden="true" />
        </motion.span>
      </button>
      <motion.div
        id="earlier-build"
        role="region"
        aria-labelledby="earlier-build-toggle"
        aria-hidden={!open}
        inert={!open}
        className={styles.stepDisclosure}
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={reduceMotion ? { duration: 0.1 } : spring}
      >
        <div className={styles.evolutionBody}>
          <p>
            The original version explored a multi-agent pipeline: contextualize the conversation, retrieve semantic
            context and function intent in parallel, then synthesize the response. It used Gemini, Python, txtai/FAISS
            and Azure Functions.
          </p>
          <p>
            The recordings above show that earlier interface. The assistant available here uses the current
            implementation described in this case study.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
