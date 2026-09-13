"use client";

import { forwardRef, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useIsPresent, type HTMLMotionProps } from "motion/react";
import { ArrowUpRight, Mail, MessageCircle, MousePointer2, Bell, Play, Pause } from "lucide-react";
import Link from "next/link";
import { spring, useMotionPreference } from "../Motion";
import base from "../dark.module.css";
import styles from "./project.module.css";

const demos = [
  { id: "answers", label: "Answers", icon: MessageCircle, title: "The work,\nin your words.", description: "Ask about skills, experience, or a specific project. The assistant brings relevant portfolio information into the conversation.", prompt: "What can you tell me about your projects?", video: "/videos/portfolio/conversation.mp4" },
  { id: "navigation", label: "Navigation", icon: MousePointer2, title: "Less searching.\nMore exploring.", description: "Ask to see a section and let the assistant guide you there. Navigation becomes part of the conversation when site actions are enabled.", prompt: "Show me your projects section.", video: "/videos/portfolio/scroll.mp4" },
  { id: "email", label: "Email", icon: Mail, title: "From a question\nto a connection.", description: "Request an email to Zi Shen through the assistant. The conversation gathers the details needed to hand the request to the site’s email function.", prompt: "I’d like to send Zi Shen an email.", video: "/videos/portfolio/email.mp4" },
  { id: "reminders", label: "Reminders", icon: Bell, title: "Give the next step\na place to start.", description: "Leave a follow-up request through conversation. The assistant collects the reminder details and connects them to the reminder workflow.", prompt: "Remind Zi Shen to follow up on my invitation.", video: "/videos/remainderApi/interaction.mp4" },
];

const DemoPanel = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(function DemoPanel(props, ref) {
  const present = useIsPresent();
  return <motion.div {...props} ref={ref} id={present ? props.id : undefined} aria-hidden={!present} inert={!present} />;
});

export function ProjectDemos() {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [height, setHeight] = useState<number>();
  const panel = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useMotionPreference();
  const demo = demos[selected];

  useLayoutEffect(() => {
    const element = panel.current;
    const player = video.current;
    if (!element) return;
    const measure = () => setHeight(element.offsetHeight + 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const visibility = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) player?.pause(); });
    visibility.observe(element);
    return () => { observer.disconnect(); visibility.disconnect(); player?.pause(); };
  }, [selected]);

  function select(index: number) {
    if (index === selected) return;
    video.current?.pause();
    setPlaying(false);
    setMediaError(false);
    setSelected(index);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const next = event.key === "ArrowRight" ? (selected + 1) % demos.length
      : event.key === "ArrowLeft" ? (selected + demos.length - 1) % demos.length
      : event.key === "Home" ? 0 : event.key === "End" ? demos.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }

  async function togglePlayback() {
    const player = video.current;
    if (!player) return;
    if (!player.paused) player.pause();
    else {
      try { await player.play(); } catch { setMediaError(true); }
    }
  }

  return <>
    <div role="tablist" aria-label="Personal AI demos" className={`${base.tabs} ${styles.demoTabs}`}>
      {demos.map((item, index) => <motion.button key={item.id} type="button" role="tab" id={`demo-tab-${item.id}`}
        ref={(element) => { tabs.current[index] = element; }} aria-selected={index === selected} aria-controls={`demo-panel-${item.id}`} tabIndex={index === selected ? 0 : -1}
        onClick={() => select(index)} onKeyDown={onKeyDown} whileTap={reduceMotion ? undefined : { scale: 0.96 }} transition={spring}>
        {selected === index && <motion.span className={base.tabSelection} layoutId="personal-ai-demo-tab" transition={reduceMotion ? { duration: 0 } : spring} />}
        <span>{item.label}</span>
      </motion.button>)}
    </div>
    {demos.map((item, index) => index !== selected && <div key={item.id} hidden role="tabpanel" id={`demo-panel-${item.id}`} aria-labelledby={`demo-tab-${item.id}`} />)}
    <motion.div className={styles.demoStage} initial={false} animate={{ height: height ?? "auto" }} transition={reduceMotion ? { duration: 0 } : spring}>
      <AnimatePresence initial={false} mode="popLayout">
        <DemoPanel key={demo.id} ref={panel} className={styles.demoPanel} role="tabpanel" id={`demo-panel-${demo.id}`} aria-labelledby={`demo-tab-${demo.id}`}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -8, pointerEvents: "none" }} transition={{ duration: reduceMotion ? 0.1 : 0.22 }}>
          <div className={styles.demoCopy}><demo.icon size={25} strokeWidth={1.35} aria-hidden="true" /><h3>{demo.title}</h3><p>{demo.description}</p><blockquote>“{demo.prompt}”</blockquote>
            <button className={`${base.button} ${styles.playButton}`} type="button" onClick={togglePlayback}>{playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />} {playing ? "Pause demo" : "Play demo"}</button>
            {demo.id === "reminders" && <Link href="/projects/reminders" className={base.textLink}>Explore reminders <ArrowUpRight size={15} aria-hidden="true" /></Link>}
          </div>
          <div className={styles.demoMedia}><div className={styles.recordingHeader}><span aria-hidden="true" /><span>{demo.label} in action</span><span>Recorded demo</span></div>
            <video ref={(element) => { if (element) video.current = element; }} src={demo.video} controls playsInline muted preload="metadata" aria-label={`Personal AI ${demo.label.toLowerCase()} recorded demonstration`}
              onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setMediaError(true)} />
            {mediaError && <p role="status" className={styles.mediaError}>This recording couldn’t play here. <a href={demo.video} target="_blank" rel="noreferrer">Open the video</a>.</p>}
          </div>
        </DemoPanel>
      </AnimatePresence>
    </motion.div>
    <p className={styles.recordingNote}>Recordings show the earlier interface. Try the assistant to experience the current version.</p>
  </>;
}
