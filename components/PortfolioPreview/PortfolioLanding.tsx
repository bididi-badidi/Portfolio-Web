"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  MessageSquare,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Send,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { GlassButton } from "@/components/Buttons/GlassButton";
import { ResumeButton } from "@/components/Landing/Hero/ResumeButton";
import { SectionContact } from "@/components/Contact/SectionContact";
import { useUIState, useScrollTargetRegistration } from "@/app/context/UIStateContext";
import { featuredProjects } from "@/content/projects";
import {
  DEFAULT_BODY_ANIMATION,
  type AnimationControls,
  type BodyAnimation,
  type MouthSize,
  type UpperAnimation,
} from "./animationLayers";
import { Hologram } from "./Hologram";
import { useConcierge } from "./useConcierge";
import { INTRO_SESSION_KEY, introTimeline, introTitle, tourReducer, type IntroStage } from "./state";
import "./preview.css";

export function PortfolioLanding() {
  const { setChatOpen } = useUIState();
  const [stage, setStage] = useState<IntroStage>("ready");
  const [animationControls, setAnimationControls] = useState<AnimationControls>({});
  const sequenceId = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [chat, setChat] = useState(false);
  const [consent, setConsent] = useState(false);
  const [draft, setDraft] = useState("");
  const [tour, dispatch] = useReducer(
    (state: Parameters<typeof tourReducer>[0], event: Parameters<typeof tourReducer>[1]) =>
      tourReducer(state, event, featuredProjects.length),
    { status: "stopped", index: 0 },
  );
  const [active, setActive] = useState(0);
  const [away, setAway] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const chatTrigger = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const concierge = useConcierge();
  const { narrate, silence, stopListening } = concierge;
  useScrollTargetRegistration("hero");
  useScrollTargetRegistration("about");
  useScrollTargetRegistration("projects");
  const stopIntro = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    setStage("ready");
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "seen");
    } catch {
      /* Storage can be unavailable in private contexts. */
    }
  }, []);
  const replay = () => {
    if (reducedMotion) return;
    timers.current.forEach(window.clearTimeout);
    window.scrollTo({ top: 0, behavior: "instant" });
    setStage("boot");
    timers.current = introTimeline.map(([next, delay]) =>
      window.setTimeout(() => (next === "ready" ? stopIntro() : setStage(next)), delay),
    );
  };
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const change = () => {
      setReducedMotion(media.matches);
      if (media.matches) stopIntro();
    };
    media.addEventListener("change", change);
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(INTRO_SESSION_KEY);
    } catch {
      /* Intro remains skippable. */
    }
    if (!seen && !media.matches) {
      setStage("boot");
      timers.current = introTimeline.map(([next, delay]) =>
        window.setTimeout(() => (next === "ready" ? stopIntro() : setStage(next)), delay),
      );
    }
    return () => {
      timers.current.forEach(window.clearTimeout);
      media.removeEventListener("change", change);
    };
  }, [stopIntro]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-20% 0px -35% 0px" },
    );
    document.querySelectorAll("[data-project-panel]").forEach((node) => observer.observe(node));
    const onScroll = () => setAway(window.scrollY > window.innerHeight * 0.65);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  useEffect(() => {
    if (chat) input.current?.focus();
  }, [chat]);
  const pauseTour = useCallback(() => {
    dispatch({ type: "pause" });
    silence();
  }, [silence]);
  useEffect(() => {
    if (tour.status !== "playing") return;
    const project = featuredProjects[tour.index];
    document
      .getElementById(`project-${project.id}`)
      ?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "center" });
    narrate(project.tourScript);
    const timeout = window.setTimeout(
      () => dispatch({ type: "next" }),
      Math.max(15000, project.tourScript.split(/\s+/).length * 550),
    );
    const keyboard = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) pauseTour();
    };
    const hidden = () => {
      if (document.hidden) pauseTour();
    };
    window.addEventListener("wheel", pauseTour, { passive: true });
    window.addEventListener("touchmove", pauseTour, { passive: true });
    window.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("wheel", pauseTour);
      window.removeEventListener("touchmove", pauseTour);
      window.removeEventListener("keydown", keyboard);
      document.removeEventListener("visibilitychange", hidden);
      silence();
    };
  }, [tour.status, tour.index, narrate, reducedMotion, pauseTour, silence]);
  const startTour = () => {
    stopIntro();
    stopListening();
    setChat(false);
    dispatch({ type: "start" });
  };
  const closeChat = () => {
    stopListening();
    setChat(false);
    setConsent(false);
    chatTrigger.current?.focus();
  };
  const openChat = () => {
    stopIntro();
    pauseTour();
    setChat(true);
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    pauseTour();
    void concierge.send(draft);
    setDraft("");
  };
  const botState = concierge.state !== "idle" ? concierge.state : tour.status === "playing" ? "presentation" : "idle";
  return (
    <div className="portfolio-preview" data-intro={stage} data-presenting={away && tour.status !== "stopped"}>
      <a className="preview-skip" href="#projects" onClick={stopIntro}>
        Skip to selected work
      </a>
      <header className="preview-header">
        <Link href="/preview" className="preview-wordmark">
          Zi Shen Chan<span>Portfolio</span>
        </Link>
        <nav aria-label="Preview navigation">
          <Link href="/preview/ai">AI preview</Link>
          <a href="#projects" onClick={pauseTour}>
            Work
          </a>
          <a href="#about" onClick={pauseTour}>
            About
          </a>
          <a href="#contact" onClick={pauseTour}>
            Contact <ArrowRight size={14} />
          </a>
        </nav>
      </header>
      <section className="preview-hero" id="hero" aria-label="Introduction">
        <div className="hero-copy">
          <h1 className={introTitle(stage).length > 3 ? "long-title" : ""}>
            {introTitle(stage)}
            <span className="hero-period">.</span>
          </h1>
          <p>
            Building intelligent systems
            <br />
            that feel human.
          </p>
          <div className="hero-actions">
            <ResumeButton label="View resume" className="!mt-0 !text-base" />
            <a href="#projects" onClick={pauseTour}>
              Explore my work <ArrowDown size={16} />
            </a>
          </div>
          <div className="animation-debug">
            {/* Mode */}
            <section className="animation-debug-section">
              <h3 className="animation-debug-title">Mode</h3>

              <div role="group" aria-label="Animation modes">
                <GlassButton
                  type="button"
                  aria-pressed={animationControls.mode === "idle"}
                  onClick={() => setAnimationControls({ mode: "idle" })}
                >
                  Idle mode
                </GlassButton>

                <GlassButton
                  type="button"
                  aria-pressed={animationControls.mode === "presenting" && animationControls.sporadic !== false}
                  onClick={() =>
                    setAnimationControls({
                      mode: "presenting",
                      talking: true,
                    })
                  }
                >
                  Presenting mode
                </GlassButton>

                <GlassButton
                  type="button"
                  aria-pressed={animationControls.mode === "presenting" && animationControls.sporadic === false}
                  onClick={() =>
                    setAnimationControls({
                      mode: "presenting",
                      sporadic: false,
                      talking: true,
                    })
                  }
                >
                  Defaults only
                </GlassButton>
              </div>
            </section>

            {/* Body */}
            <section className="animation-debug-section">
              <h3 className="animation-debug-title">Body</h3>

              <div role="group" aria-label="Body animations">
                {(["IdleBody", "ListenBody", "ThinkBody", "WalkingBody"] as BodyAnimation[]).map((body) => (
                  <GlassButton
                    key={body}
                    type="button"
                    aria-pressed={(animationControls.body ?? DEFAULT_BODY_ANIMATION) === body}
                    onClick={() =>
                      setAnimationControls((c) => ({
                        ...c,
                        body,
                      }))
                    }
                  >
                    {body}
                  </GlassButton>
                ))}
              </div>
            </section>

            {/* Upper Body */}
            <section className="animation-debug-section">
              <h3 className="animation-debug-title">Upper Body</h3>

              <div role="group" aria-label="Upper body animations">
                {(
                  [
                    "PointUpperBody",
                    "PresentUpperBody",
                    "WaveUpperBody",
                    "FrameUpperBody",
                    "ThinkUpperBody",
                    "ActionUpperBody",
                    "WalkingUpperBody",
                  ] as UpperAnimation[]
                ).map((clip) => (
                  <GlassButton
                    key={clip}
                    type="button"
                    onClick={() =>
                      setAnimationControls((c) => ({
                        ...c,
                        sequence: {
                          id: ++sequenceId.current,
                          clips: [clip],
                        },
                      }))
                    }
                  >
                    {clip}
                  </GlassButton>
                ))}

                <GlassButton
                  type="button"
                  onClick={() =>
                    setAnimationControls((c) => ({
                      ...c,
                      mode: "presenting",
                      sequence: {
                        id: ++sequenceId.current,
                        clips: ["WaveUpperBody"],
                      },
                    }))
                  }
                >
                  Raise hand now
                </GlassButton>
              </div>
            </section>

            {/* Face / Mouth */}
            <section className="animation-debug-section">
              <h3 className="animation-debug-title">Face / Mouth</h3>

              <div role="group" aria-label="Face and mouth animations">
                <GlassButton
                  type="button"
                  aria-pressed={animationControls.talking === true}
                  onClick={() =>
                    setAnimationControls((c) => ({
                      ...c,
                      talking: !c.talking,
                    }))
                  }
                >
                  TalkFace
                </GlassButton>

                <GlassButton
                  type="button"
                  aria-pressed={animationControls.blinking === true}
                  onClick={() =>
                    setAnimationControls((c) => ({
                      ...c,
                      blinking: c.blinking !== true,
                    }))
                  }
                >
                  BlinkFace
                </GlassButton>

                {(["closed", "small", "medium", "large"] as MouthSize[]).map((mouth) => (
                  <GlassButton
                    key={mouth}
                    type="button"
                    aria-pressed={animationControls.mouth === mouth && !animationControls.talking}
                    onClick={() =>
                      setAnimationControls((c) => ({
                        ...c,
                        mouth,
                        talking: false,
                      }))
                    }
                  >
                    Mouth {mouth}
                  </GlassButton>
                ))}
              </div>
            </section>

            {/* Combos */}
            <section className="animation-debug-section">
              <h3 className="animation-debug-title">Combos</h3>

              <div role="group" aria-label="Animation combinations">
                <GlassButton
                  type="button"
                  onClick={() =>
                    setAnimationControls((c) => ({
                      ...c,
                      body: "WalkingBody",
                      upper: "WalkingUpperBody",
                      sequence: undefined,
                    }))
                  }
                >
                  Walking
                </GlassButton>

                <GlassButton
                  type="button"
                  onClick={() =>
                    setAnimationControls((c) => ({
                      ...c,
                      sequence: {
                        id: ++sequenceId.current,
                        clips: ["PointUpperBody", "PresentUpperBody", "WaveUpperBody", "FrameUpperBody"],
                      },
                    }))
                  }
                >
                  Test fixed sequence
                </GlassButton>

                <GlassButton
                  type="button"
                  onClick={() =>
                    setAnimationControls({
                      mode: "presenting",
                      body: DEFAULT_BODY_ANIMATION,
                      talking: true,
                      sequence: {
                        id: ++sequenceId.current,
                        clips: ["PresentUpperBody", "PointUpperBody"],
                      },
                    })
                  }
                >
                  Talk + Present + Point
                </GlassButton>

                <GlassButton
                  type="button"
                  onClick={() =>
                    setAnimationControls({
                      mode: "presenting",
                      body: "ThinkBody",
                      talking: false,
                      sequence: {
                        id: ++sequenceId.current,
                        clips: ["ThinkUpperBody"],
                      },
                    })
                  }
                >
                  Full Think
                </GlassButton>

                <GlassButton
                  type="button"
                  onClick={() =>
                    setAnimationControls((c) => ({
                      ...c,
                      mode: "idle",
                      sequence: {
                        id: ++sequenceId.current,
                        clips: [],
                      },
                    }))
                  }
                >
                  Stop gestures
                </GlassButton>

                <GlassButton type="button" onClick={() => setAnimationControls({})}>
                  Auto
                </GlassButton>
              </div>
            </section>
          </div>
        </div>
        <div className="hero-character">
          <Hologram
            intro={stage}
            state={botState}
            gesture={featuredProjects[tour.index].gesture}
            presenting={tour.status === "playing"}
            //* temporary reduce motion
            reducedMotion={false}
            animationControls={animationControls}
          />

          <div className="hero-concierge">
            <div className="concierge-controls">
              <GlassButton ref={chatTrigger} aria-label="Open chat" title="Open chat" onClick={openChat}>
                <MessageSquare size={20} />
              </GlassButton>
              <GlassButton
                aria-label="Use microphone"
                title="Use microphone"
                onClick={() => {
                  openChat();
                  if (concierge.voice) concierge.listen();
                  else setConsent(true);
                }}
              >
                <Mic size={20} />
              </GlassButton>
              <GlassButton
                aria-label="Start project tour"
                title="Start project tour"
                disabled={concierge.state === "thinking"}
                onClick={startTour}
              >
                <Send size={20} />
              </GlassButton>
            </div>
            <p className="hero-invitation">A little intelligence. A human touch.</p>
          </div>
        </div>
        <div className="hero-bottom">
          <span>AI · Harness engineering · User experience</span>
          <button onClick={replay} disabled={reducedMotion} aria-label="Replay introduction">
            <RotateCcw size={13} /> Replay intro
          </button>
        </div>
        {stage !== "ready" && (
          <button className="intro-skip" onClick={stopIntro}>
            Skip intro <ArrowRight size={15} />
          </button>
        )}
        <div className="intro-blackout" aria-hidden="true" />
      </section>
      {/*<section className="preview-about preview-section" id="about">
        <span className="section-label">01 / About</span>
        <div>
          <h2>
            From complex systems
            <br />
            to useful experiences.
          </h2>
          <p>
            I’m Zi Shen, a Math and Computer Science graduate from NTU. I build AI software and automation with a focus
            on the people using it.
          </p>
          <p className="about-secondary">Technical depth. Thoughtful interaction. Work that connects the two.</p>
        </div>
      </section>
      <section className="preview-work preview-section" id="projects">
        <div className="section-heading">
          <span className="section-label">02 / Selected work</span>
          <h2>Ideas, made useful.</h2>
        </div>
        <div className="project-sequence">
          {featuredProjects.map((project, index) => (
            <article
              id={`project-${project.id}`}
              data-project-panel
              data-index={index}
              data-active={active === index}
              key={project.id}
              className="preview-project"
            >
              <button
                className="project-number"
                aria-label={`Select ${project.title}`}
                aria-pressed={active === index}
                onClick={() => {
                  pauseTour();
                  dispatch({ type: "select", index });
                  setActive(index);
                  concierge.setCaption(project.tourScript);
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
              <div className="project-body">
                <div className="project-title">
                  <h3>{project.title}</h3>
                  {project.route ? (
                    <Link href={project.route} aria-label={`Read ${project.title} case study`}>
                      <ArrowRight size={23} />
                    </Link>
                  ) : (
                    <span className="project-status">Case study in preparation</span>
                  )}
                </div>
                <p className="project-summary">{project.summary}</p>
                <div className="project-tags">{project.technologies.join(" / ")}</div>
                <details
                  onToggle={(event) => {
                    if (event.currentTarget.open) pauseTour();
                  }}
                >
                  <summary>Behind the work</summary>
                  <div className="project-detail">
                    <p>
                      <strong>The problem</strong>
                      {project.problem}
                    </p>
                    <p>
                      <strong>The approach</strong>
                      {project.approach}
                    </p>
                    <p>
                      <strong>The outcome</strong>
                      {project.outcome}
                    </p>
                    <small>{project.evidenceNote}</small>
                  </div>
                </details>
              </div>
            </article>
          ))}
        </div>
        <Link href="/preview/projects" className="archive-link">
          View all projects <ArrowRight size={19} />
        </Link>
      </section>
      <section className="preview-contact preview-section">
        <span className="section-label">03 / Contact</span>
        <h2>
          Let’s build something
          <br />
          thoughtful.
        </h2>
        <SectionContact id="contact" />
      </section>
      <div className={`concierge-dock ${away || chat || tour.status !== "stopped" ? "dock-visible" : ""}`}>
        {away && (
          <button className="dock-chat" onClick={openChat}>
            <MessageSquare size={17} /> Ask about the work
          </button>
        )}
        <p className="concierge-caption" role="status" aria-live="polite">
          <span className="caption-indicator" />
          {concierge.caption}
        </p>
        {tour.status !== "stopped" && (
          <div className="tour-controls">
            <span>
              {tour.index + 1} / {featuredProjects.length} · {tour.status === "paused" ? "Paused" : "Project tour"}
            </span>
            <button
              aria-label={tour.status === "playing" ? "Pause tour" : "Resume tour"}
              onClick={() => (tour.status === "playing" ? pauseTour() : dispatch({ type: "resume" }))}
            >
              {tour.status === "playing" ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button
              aria-label="Next project"
              onClick={() => {
                dispatch({ type: "next" });
                if (tour.status === "paused" && tour.index + 1 < featuredProjects.length) dispatch({ type: "resume" });
              }}
            >
              <SkipForward size={17} />
            </button>
            <button
              aria-label="Stop tour"
              onClick={() => {
                dispatch({ type: "stop" });
                silence();
                concierge.setCaption("Tour stopped. Explore at your own pace.");
              }}
            >
              <Square size={15} />
            </button>
          </div>
        )}
        {concierge.voice && (
          <button
            className="mute-control"
            aria-label={concierge.muted ? "Unmute voice" : "Mute voice"}
            onClick={concierge.toggleMute}
          >
            {concierge.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        )}
      </div>
      {chat && (
        <section
          className="preview-chat"
          aria-label="Portfolio conversation"
          onKeyDown={(event) => {
            if (event.key === "Escape") closeChat();
          }}
        >
          <header>
            <div>
              <span className="caption-indicator" />
              Portfolio concierge
              <small>
                {concierge.state === "thinking"
                  ? "Thinking…"
                  : concierge.state === "listening"
                    ? "Listening…"
                    : "Let’s talk about the work"}
              </small>
            </div>
            <button aria-label="Close conversation" onClick={closeChat}>
              <X size={20} />
            </button>
          </header>
          <div className="chat-messages">
            {concierge.messages.length === 0 && (
              <p>What would you like to explore? Ask about a project, my approach, or where to start.</p>
            )}
            {concierge.messages.map((message, index) => (
              <p key={index} data-role={message.role}>
                <small>{message.role === "user" ? "You" : "Concierge"}</small>
                {message.message}
              </p>
            ))}
          </div>
          {consent && (
            <div className="voice-consent">
              <p>
                Enable voice replies and one-question microphone input. Your browser may send speech to its recognition
                service. This app keeps no raw audio; transcripts stay in this conversation.
              </p>
              <GlassButton
                onClick={() => {
                  concierge.setVoice(true);
                  setConsent(false);
                  concierge.setCaption("Voice enabled. Tap the microphone to ask one question.");
                }}
              >
                Enable voice
              </GlassButton>
              <button onClick={() => setConsent(false)}>Keep typing</button>
            </div>
          )}
          <form onSubmit={submit}>
            <label className="sr-only" htmlFor="concierge-question">
              Your question
            </label>
            <input
              id="concierge-question"
              ref={input}
              value={draft}
              maxLength={2000}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask me anything about the work…"
              disabled={concierge.state === "thinking"}
            />
            <button
              type="button"
              aria-label={concierge.state === "listening" ? "Cancel microphone" : "Ask with microphone"}
              disabled={concierge.state === "thinking"}
              onClick={() => (concierge.voice ? concierge.listen() : setConsent(true))}
            >
              <Mic size={18} />
            </button>
            <button type="submit" aria-label="Send question" disabled={!draft.trim() || concierge.state === "thinking"}>
              <ArrowRight size={20} />
            </button>
          </form>
          <button
            className="legacy-actions"
            onClick={() => {
              closeChat();
              setChatOpen(true);
            }}
          >
            More portfolio actions <ArrowRight size={13} />
          </button>
        </section>
      )} */}
    </div>
  );
}
