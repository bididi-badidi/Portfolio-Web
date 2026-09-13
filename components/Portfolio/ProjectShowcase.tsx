"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Play, X } from "lucide-react";
import { featuredWork } from "./content";
import { spring, useMotionPreference } from "./Motion";
import styles from "./dark.module.css";

export function ProjectShowcase() {
  const [selected, setSelected] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [panelHeight, setPanelHeight] = useState<number>();
  const reduceMotion = useMotionPreference();

  useLayoutEffect(() => {
    const panel = panels.current[selected];
    if (!panel) return;
    // Measure natural content, including late video metadata and responsive reflow.
    const measure = () => setPanelHeight(panel.offsetHeight + 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [selected]);

  function select(index: number) {
    videos.current.forEach((video) => video?.pause());
    setSelected(index);
    setShowDemo(false);
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % featuredWork.length;
    else if (event.key === "ArrowLeft") next = (index + featuredWork.length - 1) % featuredWork.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = featuredWork.length - 1;
    else return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }

  return (
    <>
      <div role="tablist" aria-label="Selected projects" className={styles.tabs}>
        {featuredWork.map((item, index) => (
          <motion.button
            key={item.id}
            ref={(element) => { tabs.current[index] = element; }}
            role="tab"
            type="button"
            id={`tab-${item.id}`}
            aria-selected={selected === index}
            aria-controls={`panel-${item.id}`}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => select(index)}
            onKeyDown={(event) => handleKey(event, index)}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            transition={spring}
          >
            {selected === index && <motion.span className={styles.tabSelection} layoutId="dark-project-tab" transition={reduceMotion ? { duration: 0 } : spring} />}
            <span>{item.name}</span>
          </motion.button>
        ))}
      </div>
      <motion.div className={styles.projectStage}
        initial={false}
        animate={{ height: panelHeight ?? "auto" }}
        transition={reduceMotion ? { duration: 0 } : spring}
      >
      {featuredWork.map((project, index) => {
        const active = index === selected;
        return (
      <motion.div
        key={project.id}
        ref={(element) => { panels.current[index] = element; }}
        role="tabpanel"
        id={`panel-${project.id}`}
        aria-labelledby={`tab-${project.id}`}
        aria-hidden={!active}
        inert={!active}
        tabIndex={active ? 0 : -1}
        className={styles.projectPanel}
        initial={false}
        animate={{ opacity: active ? 1 : 0, x: reduceMotion ? 0 : active ? 0 : index < selected ? -32 : 32, scale: reduceMotion ? 1 : active ? 1 : 0.985, visibility: "visible", transitionEnd: { visibility: active ? "visible" : "hidden" } }}
        transition={reduceMotion ? { duration: 0.12 } : { ...spring, opacity: { duration: 0.24 } }}
        style={{ zIndex: active ? 1 : 0, pointerEvents: active ? "auto" : "none" }}
      >
        <div className={styles.projectInner}>
          <motion.div layout={reduceMotion ? false : "position"} transition={spring} className={styles.projectCopy}>
            <p className={styles.category}>{project.category}</p>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <Link className={styles.textLink} href={project.href}>Explore {project.name} <ArrowUpRight size={19} aria-hidden="true" /></Link>
          </motion.div>
          <motion.div layout={reduceMotion ? false : "position"} transition={spring} className={styles.projectVisual}>
            <AnimatePresence initial={false} mode="popLayout">
            {active && showDemo ? (
              <motion.div key="video" className={styles.videoWrap}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8, pointerEvents: "none" }}
                transition={{ duration: reduceMotion ? 0.1 : 0.22 }}>
                <video ref={(element) => { videos.current[index] = element; }} src={project.video} controls autoPlay muted playsInline preload="metadata" aria-label={`${project.name} demonstration`} />
              </motion.div>
            ) : (
              <motion.div key="preview"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8, pointerEvents: "none" }}
                transition={{ duration: reduceMotion ? 0.1 : 0.22 }}>
                <div className={styles.productWindow}>
                  <div className={styles.windowBar}><span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span><span>{project.name}</span></div>
                  {project.id === "stockai" ? (
                    <div className={styles.terminal}>
                      <p><span className={styles.terminalPrompt}>›</span> StockAI <span className={styles.terminalMuted}>/ research workspace</span></p>
                      <p className={styles.terminalIntro}>Your research, streamlined.</p>
                      <dl><div><dt>Reports</dt><dd>Company insights</dd></div><div><dt>Earnings</dt><dd>Upcoming earnings</dd></div><div><dt>Events</dt><dd>Market events</dd></div></dl>
                    </div>
                  ) : project.id === "events" ? (
                    <div className={styles.workflowPreview}>
                      <p className={styles.sampleLabel}>SHORTCUT COLLECTION</p>
                      <p className={styles.sampleMessage}>Screen capture · Conversation · Batch scheduling</p>
                      <ArrowRight className={styles.workflowArrow} size={20} aria-hidden="true" />
                      <div className={styles.calendarRow}><span>10:00</span><strong>Coffee</strong></div>
                      <div className={styles.calendarRow}><span>14:00</span><strong>Design review</strong></div>
                    </div>
                  ) : (
                    <div className={styles.workflowPreview}>
                      <p className={styles.sampleLabel}>EXAMPLE CONVERSATION</p>
                      <p className={styles.sampleMessage}>“What has Zi Shen been building?”</p>
                      <p className={styles.sampleAnswer}>Explore AI assistants, automated workflows, and the software behind them.</p>
                      <span className={styles.sampleAction}>Answers connected to actions <ArrowUpRight size={16} aria-hidden="true" /></span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            </AnimatePresence>
            <motion.button layout={reduceMotion ? false : "position"} transition={spring} type="button"
              className={styles.demoToggle} aria-expanded={active && showDemo}
              onClick={() => { videos.current[index]?.pause(); setShowDemo(!showDemo); }}>
              {active && showDemo ? <><X size={14} aria-hidden="true" /> Close demo</> : <><Play size={13} aria-hidden="true" fill="currentColor" /> Watch demo</>}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
        );
      })}
      </motion.div>
      <div className={styles.moreProjects}>
        <Link href="/projects/remainder-api"><h3>Reminder API</h3><p>Secure reminders. AI-ready interactions.</p><ArrowRight aria-hidden="true" size={22} /></Link>
        <a href="https://xcuisite.store" target="_blank" rel="noreferrer"><h3>XCuisite</h3><p>A complete e-commerce experience.</p><ArrowUpRight aria-hidden="true" size={22} /></a>
      </div>
    </>
  );
}
