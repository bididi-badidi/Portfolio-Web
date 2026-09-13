export type BotState = "idle" | "listening" | "thinking" | "speaking" | "action" | "presentation";
export type IntroStage = "boot" | "eyes" | "distortion" | "blackout" | "ai" | "harness" | "experience" | "return" | "ready";
export const INTRO_SESSION_KEY = "portfolio-preview-intro-v1";
export const introTimeline: readonly [IntroStage, number][] = [
  ["eyes", 250], ["distortion", 1400], ["blackout", 2150], ["ai", 2650],
  ["harness", 3400], ["experience", 4550], ["return", 5700], ["ready", 6500],
];
export function introTitle(stage: IntroStage) {
  if (stage === "harness") return "Harness Engineering";
  if (stage === "experience") return "User Experience";
  return "AI";
}

export type TourState = { status: "stopped" | "playing" | "paused"; index: number };
export type TourEvent = { type: "start" | "pause" | "resume" | "next" | "stop" } | { type: "select"; index: number };
export function tourReducer(state: TourState, event: TourEvent, count = 5): TourState {
  switch (event.type) {
    case "start": return { status: "playing", index: 0 };
    case "stop": return { status: "stopped", index: 0 };
    case "pause": return state.status === "playing" ? { ...state, status: "paused" } : state;
    case "resume": return { ...state, status: "playing" };
    case "select": return { status: "paused", index: Math.max(0, Math.min(event.index, count - 1)) };
    case "next": return state.index + 1 < count ? { ...state, index: state.index + 1 } : { status: "stopped", index: 0 };
  }
}
