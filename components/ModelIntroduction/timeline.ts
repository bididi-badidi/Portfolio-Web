export const CUE = { zoom: 2.8, glitch: 6.6, blackout: 9.2, arrival: 10.6, speak: 18.6, idle: 20.8 } as const;
export type Stage = "loading" | "eye" | "face" | "glitch" | "blackout" | "arrival" | "speaking" | "idle" | "error";

export function stageAt(time: number): Stage {
  if (time < CUE.zoom) return "eye";
  if (time < CUE.glitch) return "face";
  if (time < CUE.blackout) return "glitch";
  if (time < CUE.arrival) return "blackout";
  if (time < CUE.speak) return "arrival";
  if (time < CUE.idle) return "speaking";
  return "idle";
}

export function smooth(from: number, to: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}
