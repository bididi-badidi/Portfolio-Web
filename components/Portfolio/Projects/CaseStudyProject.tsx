"use client";

import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  type HTMLMotionProps,
} from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Pause,
  Play,
  SquareTerminal,
  Workflow,
} from "lucide-react";
import { ProjectBuild } from "./ProjectBuild";
import { ProjectClosing } from "./ProjectClosing";
import { ProjectHero } from "./ProjectHero";
import { ProjectOverview } from "./ProjectOverview";
import { ProjectProcess } from "./ProjectProcess";
import { ProjectShell } from "./ProjectShell";
import { ProjectShowcaseSection } from "./ProjectShowcaseSection";
import {
  darkProjectContent,
  type DarkProjectId,
  type ProjectFeature,
} from "./projectContent";
import { spring, useMotionPreference } from "../Motion";
import base from "../dark.module.css";
import styles from "./project.module.css";

const projectLinks = [
  { label: "Overview", id: "about" },
  { label: "Highlights", id: "projects" },
  { label: "Process", id: "techstack" },
];
const projectExtraLinks = [{ label: "Keep exploring", id: "contact" }];

const FeaturePanel = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  function FeaturePanel(props, ref) {
    const present = useIsPresent();
    return (
      <motion.div
        {...props}
        ref={ref}
        id={present ? props.id : undefined}
        aria-hidden={!present}
        inert={!present}
      />
    );
  },
);

function ProductPreview({ projectId }: { projectId: DarkProjectId }) {
  if (projectId === "stock-ai") {
    return (
      <div className={`${styles.projectHeroWindow} ${styles.terminalHero}`}>
        <div className={styles.projectWindowBar}>
          <SquareTerminal size={15} aria-hidden="true" />
          <span>stock research</span>
          <span>workspace</span>
        </div>
        <div className={styles.heroTerminalBody}>
          <p><span>›</span> stock research NVDA</p>
          <small>Gathering company context…</small>
          <dl>
            <div><dt>Company</dt><dd>NVIDIA</dd></div>
            <div><dt>Next</dt><dd>Review earnings</dd></div>
            <div><dt>Status</dt><dd>Research ready</dd></div>
          </dl>
        </div>
      </div>
    );
  }

  if (projectId === "shortcuts") {
    return (
      <div className={`${styles.projectHeroWindow} ${styles.shortcutsHero}`}>
        <div className={styles.projectWindowBar}>
          <Workflow size={15} aria-hidden="true" />
          <span>Productivity Shortcuts</span>
          <span>3 workflows</span>
        </div>
        <div className={styles.shortcutList}>
          <div><span className={styles.shortcutIcon}><ArrowUpRight size={17} /></span><p><strong>Screen to Calendar</strong><small>Selected details → event</small></p><Check size={16} /></div>
          <div><span className={styles.shortcutIcon}><Workflow size={17} /></span><p><strong>Conversation to Calendar</strong><small>Spoken plan → event</small></p><Check size={16} /></div>
          <div><span className={styles.shortcutIcon}><CalendarDays size={17} /></span><p><strong>Batch Scheduler</strong><small>One list → many events</small></p><Check size={16} /></div>
        </div>
      </div>
    );
  }

  if (projectId === "remainder-api") {
    return (
      <div className={`${styles.projectHeroWindow} ${styles.apiHero}`}>
        <div className={styles.projectWindowBar}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span>Reminder API</span>
          <span>200 OK</span>
        </div>
        <div className={styles.apiBody}>
          <p><strong>POST</strong><span>/api/reminders</span></p>
          <pre>{`{
  "title": "Design review",
  "dueDate": "tomorrow"
}`}</pre>
          <div><Check size={15} aria-hidden="true" /> Reminder created</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.projectHeroWindow} ${styles.automationHero}`}>
      <div className={styles.projectWindowBar}>
        <Workflow size={15} aria-hidden="true" />
        <span>Automation Manager</span>
        <span>Generalized</span>
      </div>
      <div className={styles.automationFlow}>
        <div><span>01</span><strong>Configure test</strong><small>Web interface</small></div>
        <ArrowRight size={18} aria-hidden="true" />
        <div><span>02</span><strong>Run workflow</strong><small>Backend services</small></div>
        <ArrowRight size={18} aria-hidden="true" />
        <div><span>03</span><strong>Review result</strong><small>Visible feedback</small></div>
      </div>
    </div>
  );
}

function FeatureVisual({ feature, projectName }: { feature: ProjectFeature; projectName: string }) {
  const [playing, setPlaying] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  async function togglePlayback() {
    const player = video.current;
    if (!player) return;
    if (player.paused) {
      try {
        await player.play();
      } catch {
        setMediaError(true);
      }
    } else {
      player.pause();
    }
  }

  if (!feature.video) {
    const steps = feature.flow.split("→").map((step) => step.trim());
    return (
      <div className={styles.abstractFeature} aria-label={`${feature.label} generalized workflow`}>
        <p>GENERALIZED WORKFLOW</p>
        <div className={styles.abstractFlow}>
          {steps.map((step, index) => (
            <div key={step}>
              <span>0{index + 1}</span>
              <strong>{step}</strong>
              {index < steps.length - 1 && <ArrowRight size={17} aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.demoMedia}>
        <div className={styles.recordingHeader}>
          <span aria-hidden="true" />
          <span>{feature.label} in action</span>
          <span>Recorded demo</span>
        </div>
        <video
          ref={video}
          src={feature.video}
          controls
          playsInline
          muted
          preload="metadata"
          aria-label={`${projectName} ${feature.label.toLowerCase()} recorded demonstration`}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setMediaError(true)}
        />
        {mediaError && (
          <p role="status" className={styles.mediaError}>
            This recording couldn’t play here. <a href={feature.video} target="_blank" rel="noreferrer">Open the video</a>.
          </p>
        )}
      </div>
      <button className={`${base.button} ${styles.inlinePlayButton}`} type="button" onClick={togglePlayback}>
        {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        {playing ? "Pause recording" : "Play recording"}
      </button>
    </div>
  );
}

function FeatureShowcase({ projectId }: { projectId: DarkProjectId }) {
  const project = darkProjectContent[projectId];
  const [selected, setSelected] = useState(0);
  const [height, setHeight] = useState<number>();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const reduceMotion = useMotionPreference();
  const feature = project.features[selected];

  useLayoutEffect(() => {
    const element = panel.current;
    if (!element) return;
    const measure = () => setHeight(element.offsetHeight + 2);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [selected]);

  function select(index: number) {
    if (index !== selected) setSelected(index);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const next = event.key === "ArrowRight" ? (selected + 1) % project.features.length
      : event.key === "ArrowLeft" ? (selected + project.features.length - 1) % project.features.length
      : event.key === "Home" ? 0
      : event.key === "End" ? project.features.length - 1
      : null;
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }

  return (
    <>
      <div role="tablist" aria-label={`${project.name} highlights`} className={`${base.tabs} ${styles.demoTabs}`}>
        {project.features.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            role="tab"
            id={`${project.id}-tab-${item.id}`}
            ref={(element) => { tabs.current[index] = element; }}
            aria-selected={index === selected}
            aria-controls={`${project.id}-panel-${item.id}`}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => select(index)}
            onKeyDown={onKeyDown}
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
            transition={spring}
          >
            {selected === index && (
              <motion.span
                className={base.tabSelection}
                layoutId={`${project.id}-feature-tab`}
                transition={reduceMotion ? { duration: 0 } : spring}
              />
            )}
            <span>{item.label}</span>
          </motion.button>
        ))}
      </div>
      {project.features.map((item, index) => index !== selected && (
        <div key={item.id} hidden role="tabpanel" id={`${project.id}-panel-${item.id}`} aria-labelledby={`${project.id}-tab-${item.id}`} />
      ))}
      <motion.div
        className={styles.demoStage}
        initial={false}
        animate={{ height: height ?? "auto" }}
        transition={reduceMotion ? { duration: 0 } : spring}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <FeaturePanel
            key={feature.id}
            ref={panel}
            className={styles.demoPanel}
            role="tabpanel"
            id={`${project.id}-panel-${feature.id}`}
            aria-labelledby={`${project.id}-tab-${feature.id}`}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -8, pointerEvents: "none" }}
            transition={{ duration: reduceMotion ? 0.1 : 0.22 }}
          >
            <div className={styles.demoCopy}>
              <feature.icon size={25} strokeWidth={1.35} aria-hidden="true" />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <p className={styles.featureDetail}>{feature.detail}</p>
              <div className={styles.featureFormula}>{feature.flow}</div>
            </div>
            <FeatureVisual feature={feature} projectName={project.name} />
          </FeaturePanel>
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export function CaseStudyProject({ projectId }: { projectId: DarkProjectId }) {
  const project = darkProjectContent[projectId];

  return (
    <ProjectShell links={projectLinks} extraLinks={projectExtraLinks}>
      <ProjectHero
        title={project.heroTitle}
        accent={project.heroAccent}
        description={project.heroDescription}
        actions={[
          { label: "Explore the highlights", href: "#projects", primary: true, icon: <ArrowDown size={18} aria-hidden="true" /> },
          { label: "Read the story", href: "#about", icon: <ArrowDown size={18} aria-hidden="true" /> },
        ]}
        visualClassName={styles.caseStudyHeroVisual}
        visual={
          <>
          <div className={styles.contextRail}>
            <span className={styles.visualLabel}>{project.heroLabel}</span>
            {project.heroPoints.map((point) => <div key={point}><Check size={18} strokeWidth={1.5} aria-hidden="true" /><span>{point}</span></div>)}
            {project.disclosure && <p className={styles.disclosureNote}>{project.disclosure}</p>}
          </div>
          <ProductPreview projectId={project.id} />
          </>
        }
      />

      <div className={base.container}>
        <ProjectOverview
          titleId={`${project.id}-overview-title`}
          title={project.overviewTitle}
          accent={project.overviewAccent}
          paragraphs={project.overview}
        />

        <ProjectShowcaseSection
          titleId={`${project.id}-features-title`}
          label={project.featureLabel}
          title={project.featureTitle}
          accent={project.featureAccent}
          description={project.featureDescription}
        >
          <FeatureShowcase projectId={project.id} />
        </ProjectShowcaseSection>

        <ProjectProcess
          titleId={`${project.id}-process-title`}
          idPrefix={project.id}
          label="03 / How it works"
          title={project.processTitle}
          accent={project.processAccent}
          description={project.processDescription}
          steps={project.process}
        />

        <ProjectBuild
          titleId={`${project.id}-build-title`}
          title={project.buildTitle}
          accent={project.buildAccent}
          items={project.stack}
        />

        <ProjectClosing
          titleId={`${project.id}-closing-title`}
          label="Keep exploring"
          title={project.closingTitle}
          accent={project.closingAccent}
          description={project.closingDescription}
          action={
            <Link className={`${base.button} ${base.primary}`} href={project.actionHref}>
              {project.actionLabel} <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          }
        />
      </div>
    </ProjectShell>
  );
}
