"use client";

import Link from "next/link";
import { ArrowLeft, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IntroductionScene } from "./scene";
import type { Stage } from "./timeline";
import styles from "./introduction.module.css";

function Falcon() {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
      <path d="m31 31-8-8L5 10l7 15 11 10-9-4 9 10 7 1-8 13 11-6 7-12 12-8 7-16-15 12-8 5-1-7 5-3-8-2-5 5z" />
      <path d="m6 19 8 14 8 4-9-12zm48 7-12 9-3 6 10-7z" opacity=".55" />
    </svg>
  );
}

export function ModelIntroduction() {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<IntroductionScene | null>(null);
  const voice = useRef<HTMLAudioElement>(null);
  const soundEnabled = useRef(false);
  const [stage, setStage] = useState<Stage>("loading");
  const [progress, setProgress] = useState<number | null>(0);
  const [sound, setSound] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const stopVoice = useCallback(() => {
    if (voice.current) {
      voice.current.pause();
      voice.current.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(preference.matches);
    setStage("loading");
    setProgress(0);
    setPaused(false);
    let cancelled = false;
    const abort = new AbortController();
    const motionChanged = () => {
      setReduced(preference.matches);
      scene.current?.setReducedMotion(preference.matches);
      stopVoice();
    };
    preference.addEventListener("change", motionChanged);
    void import("./scene").then(async ({ createIntroductionScene }) => {
      if (cancelled) return;
      const instance = await createIntroductionScene(container, {
        signal: abort.signal,
        reducedMotion: preference.matches,
        onProgress: setProgress,
        onStage: (next) => {
          if (cancelled) return;
          setStage(next);
          if (next === "speaking" && soundEnabled.current && voice.current) {
            voice.current.currentTime = 0;
            void voice.current.play().catch(() => { soundEnabled.current = false; setSound(false); });
          }
        },
        onError: () => { if (!cancelled) { setStage("error"); stopVoice(); } },
      });
      if (cancelled) instance?.dispose();
      else scene.current = instance;
    }).catch(() => { if (!cancelled) setStage("error"); });
    const visibilityChanged = () => {
      scene.current?.setHidden(document.hidden);
      if (document.hidden) voice.current?.pause();
      else if (scene.current?.isSpeaking() && soundEnabled.current && !scene.current.isPaused()) {
        void voice.current?.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      cancelled = true;
      abort.abort();
      preference.removeEventListener("change", motionChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
      scene.current?.dispose();
      scene.current = null;
      stopVoice();
    };
  }, [attempt, stopVoice]);

  const toggleSound = () => {
    const enabled = !soundEnabled.current;
    soundEnabled.current = enabled;
    setSound(enabled);
    if (!voice.current) return;
    voice.current.muted = !enabled;
    if (!enabled) stopVoice();
    else if (stage === "speaking" || stage === "idle") {
      voice.current.currentTime = 0;
      void voice.current.play().catch(() => { soundEnabled.current = false; setSound(false); });
    } else {
      // Unlock this audio element in the user gesture for its later cinematic cue.
      voice.current.muted = true;
      void voice.current.play().then(() => {
        stopVoice();
        if (voice.current) voice.current.muted = !soundEnabled.current;
      }).catch(() => { if (voice.current) voice.current.muted = !soundEnabled.current; });
    }
  };
  const skip = () => { stopVoice(); scene.current?.skip(); setPaused(false); };
  const replay = () => { stopVoice(); scene.current?.replay(); setPaused(false); };
  const playCinematic = () => {
    setReduced(false);
    scene.current?.setReducedMotion(false);
    replay();
  };
  const togglePause = () => {
    const next = !paused;
    setPaused(next);
    scene.current?.setPaused(next);
    if (next) voice.current?.pause();
    else if (stage === "speaking" && soundEnabled.current) void voice.current?.play().catch(() => {});
  };
  const loaded = stage !== "loading" && stage !== "error";
  const finished = stage === "idle" || stage === "speaking";

  return (
    <section className={styles.experience} data-stage={stage} aria-label="AI model introduction">
      <div className={styles.canvas} ref={host} role="img" aria-label="A sapphire AI: its eye opens, the face dissolves into a broken signal, then it walks out of darkness and comes to rest." />
      <audio ref={voice} src="/audio/ai-its-time.wav" preload="auto" />
      <header className={styles.header}>
        <Link href="/preview" className={styles.control}><ArrowLeft size={17} /> Portfolio</Link>
        <div className={styles.controls}>
          <button className={styles.control} onClick={toggleSound} aria-pressed={sound}>
            {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}<span>Sound {sound ? "on" : "off"}</span>
          </button>
          {loaded && !finished && <>
            <button className={styles.iconButton} onClick={togglePause} aria-label={paused ? "Resume introduction" : "Pause introduction"}>
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button className={styles.control} onClick={skip}>Skip intro</button>
          </>}
        </div>
      </header>

      {stage === "loading" && <div className={styles.loading}>
        <div className={styles.emblem} role="progressbar" aria-label="Loading AI model" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress ?? undefined}>
          <svg className={styles.ring} viewBox="0 0 160 160" aria-hidden="true">
            <circle className={styles.track} cx="80" cy="80" r="72" />
            <circle className={styles.meter} cx="80" cy="80" r="72" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - (progress ?? 18)} />
          </svg>
          <div className={styles.falcon}><Falcon /></div>
        </div>
        <p>Preparing the arrival</p>
        <span className={styles.percentage}>{progress === null ? "Loading…" : `${progress}%`}</span>
      </div>}

      {stage === "error" && <div className={styles.error} role="alert">
        <div className={styles.errorFalcon}><Falcon /></div>
        <h1>The arrival was interrupted.</h1>
        <p>The 3D model couldn’t load. Please try again.</p>
        <button className={styles.control} onClick={() => setAttempt((value) => value + 1)}><RotateCcw size={16} /> Try again</button>
      </div>}

      <div className={styles.caption} data-visible={finished} aria-hidden={!finished}>
        <h1>It’s time.</h1>
        {stage === "idle" && <button className={styles.replay} onClick={replay}>
          <RotateCcw size={14} />{reduced ? "Replay greeting" : "Replay introduction"}
        </button>}
      </div>
      {reduced && loaded && <div className={styles.motionNote}>
        <span>Reduced motion is on</span>
        <button className={styles.replay} onClick={playCinematic}>Play full introduction</button>
      </div>}
      <span className={styles.srOnly} role="status" aria-live="polite">
        {stage === "loading" ? "Loading the AI model." : stage === "idle" ? "The AI has arrived. It’s time." : ""}
      </span>
    </section>
  );
}
