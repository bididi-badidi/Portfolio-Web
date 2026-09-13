import {
  AnimationMixer,
  AnimationClip,
  Quaternion,
  LoopOnce,
  LoopRepeat,
  type AnimationAction,
  type Object3D,
} from "three";

export type BodyAnimation = "IdleBody" | "ListenBody" | "ThinkBody" | "WalkingBody";
export const DEFAULT_BODY_ANIMATION: BodyAnimation = "ListenBody";
export type UpperAnimation =
  | "PointUpperBody"
  | "PresentUpperBody"
  | "WaveUpperBody"
  | "FrameUpperBody"
  | "ThinkUpperBody"
  | "WalkingUpperBody"
  | "ActionUpperBody";
export type MouthSize = "closed" | "small" | "medium" | "large";
export type AnimationMode = "idle" | "presenting";
export type AnimationControls = {
  mode?: AnimationMode;
  sporadic?: boolean;
  body?: BodyAnimation;
  /** A persistent upper-body loop, used when two body regions must run together. */
  upper?: UpperAnimation;
  talking?: boolean;
  mouth?: MouthSize;
  /** Eye motion is opt-in, including the wake-up animation. */
  blinking?: boolean;
  /** Change id to replay even an identical sequence; a new request interrupts the old one. */
  sequence?: { id: number; clips: UpperAnimation[] };
};

/** Track masks are baked into the GLB. Each layer owns disjoint bone properties. */
export function createAnimationLayers(root: Object3D, clips: AnimationClip[], random: () => number = Math.random) {
  const mixer = new AnimationMixer(root);
  // Softer variants retain the authored loop and its neutral endpoints.
  const idle = clips.find((c) => c.name === "IdleUpperBody")!;
  const defaults = ["IdleUpperBody", "SoftPresentUpperBody", "SoftFrameUpperBody"];
  const soft = ["Present", "Frame"].map((name) => {
    const source = clips.find((c) => c.name === `${name}UpperBody`)!;
    const tracks = source.tracks.map((track) => {
      const copy = track.clone();
      const reference = idle.tracks.find((t) => t.name === track.name);
      if (reference && track.ValueTypeName === "quaternion") {
        const rest = new Quaternion(...(Array.from(reference.values.slice(0, 4)) as [number, number, number, number]));
        for (let i = 0; i < copy.values.length; i += 4) {
          rest
            .clone()
            .slerp(
              new Quaternion(...(Array.from(copy.values.slice(i, i + 4)) as [number, number, number, number])),
              0.32,
            )
            .toArray(copy.values, i);
        }
      }
      return copy;
    });
    return new AnimationClip(`Soft${name}UpperBody`, source.duration, tracks);
  });
  clips = [...clips, ...soft];
  const actions = new Map(clips.map((clip) => [clip.name, mixer.clipAction(clip)]));
  const required = [
    "IdleBody",
    "ListenBody",
    "ThinkBody",
    "WalkingBody",
    "IdleUpperBody",
    "PointUpperBody",
    "PresentUpperBody",
    "WaveUpperBody",
    "FrameUpperBody",
    "WalkingUpperBody",
    "TalkFace",
    "BlinkFace",
    "WakeFace",
    "MouthClosedFace",
    "MouthSmallFace",
    "MouthMediumFace",
    "MouthLargeFace",
  ];
  for (const name of required) if (!actions.has(name)) throw new Error(`Missing layered animation: ${name}`);
  const active: Partial<Record<"body" | "upper" | "mouth" | "eyes", AnimationAction>> = {};
  let queue: UpperAnimation[] = [];
  let requestId: number | undefined;
  let booting = false;
  let mode: AnimationMode = "idle";
  let upperOverride: UpperAnimation | undefined;
  let elapsed = 0;
  let nextDefault = 0;
  let nextAccent = 14 + random() * 8;
  let defaultIndex = 0;
  let lastAccent = -1;
  let expressive = false;
  let blendTime = 1;
  const upperWeights = new Map<AnimationAction, number>();
  let blendFrom = new Map<AnimationAction, number>();
  function baseName() {
    return upperOverride ?? (mode === "presenting" ? defaults[defaultIndex] : "IdleUpperBody");
  }
  function returnToDefault() {
    expressive = false;
    nextDefault = elapsed + 6 + random() * 4;
    play("upper", baseName());
  }
  function play(layer: keyof typeof active, name: string, once = false) {
    const next = actions.get(name);
    if (!next) throw new Error(`Unknown animation: ${name}`);
    if (active[layer] === next && next.isRunning()) return;
    const previous = active[layer];
    const preservePhase = layer === "upper" && (upperWeights.get(next) ?? 0) > 0 && next.isRunning();
    if (!preservePhase) next.reset();
    next.setEffectiveWeight(1).setEffectiveTimeScale(1);
    next.setLoop(once ? LoopOnce : LoopRepeat, once ? 1 : Infinity);
    next.clampWhenFinished = once;
    next.play();
    if (layer === "upper") {
      // Keep all interrupted contributions until they fade out, avoiding a rest-pose flash.
      blendFrom = new Map(upperWeights);
      blendTime = previous ? 0 : 0.7;
      upperWeights.set(next, upperWeights.get(next) ?? (previous ? 0 : 1));
      next.setEffectiveWeight(previous ? (upperWeights.get(next) ?? 0) : 1);
    } else if (previous && previous !== next) next.crossFadeFrom(previous, 0.18, false);
    active[layer] = next;
  }
  play("body", DEFAULT_BODY_ANIMATION);
  play("upper", "IdleUpperBody");
  play("mouth", "MouthClosedFace");
  return {
    mixer,
    snapshot: () => ({ mode, upper: active.upper?.getClip().name, expressive, queued: queue.length }),
    update(delta: number, controls: AnimationControls, boot = false) {
      elapsed += delta;
      if (controls.upper !== upperOverride) {
        upperOverride = controls.upper;
        if (!expressive && requestId === undefined) play("upper", baseName());
      }
      if ((controls.mode ?? "idle") !== mode) {
        mode = controls.mode ?? "idle";
        queue = [];
        defaultIndex = 0;
        nextAccent = elapsed + 14 + random() * 8;
        returnToDefault();
      }
      play("body", controls.body ?? DEFAULT_BODY_ANIMATION);
      const mouth = controls.mouth ?? "closed";
      play("mouth", controls.talking ? "TalkFace" : `Mouth${mouth[0].toUpperCase()}${mouth.slice(1)}Face`);
      if (!controls.sequence && requestId !== undefined) {
        requestId = undefined;
        queue = [];
        returnToDefault();
      }
      if (controls.sequence && controls.sequence.id !== requestId) {
        requestId = controls.sequence.id;
        queue = [...controls.sequence.clips];
        const next = queue.shift();
        expressive = Boolean(next);
        nextAccent = elapsed + 14 + random() * 8;
        play("upper", next ?? baseName(), Boolean(next));
      }
      const upper = active.upper!;
      if (
        expressive &&
        upper.time >=
          upper.getClip().duration -
            (queue[0] === upper.getClip().name ? 0 : Math.min(0.7, upper.getClip().duration * 0.25))
      ) {
        const next = queue.shift();
        if (next) {
          play("upper", next, true);
        } else returnToDefault();
      } else if (!expressive && mode === "presenting") {
        if (controls.sporadic !== false && elapsed >= nextAccent) {
          const accents = ["PointUpperBody", "WaveUpperBody", "FrameUpperBody"];
          lastAccent = (lastAccent + 1 + Math.floor(random() * (accents.length - 1))) % accents.length;
          expressive = true;
          nextAccent = elapsed + 14 + random() * 8;
          play("upper", accents[lastAccent], true);
        } else if (elapsed >= nextDefault) {
          defaultIndex = (defaultIndex + 1 + Math.floor(random() * (defaults.length - 1))) % defaults.length;
          nextDefault = elapsed + 6 + random() * 4;
          play("upper", baseName());
        }
      }
      blendTime = Math.min(0.7, blendTime + delta);
      const t = blendTime / 0.7;
      const ease = t * t * (3 - 2 * t);
      for (const action of upperWeights.keys()) {
        const weight = (blendFrom.get(action) ?? 0) * (1 - ease) + (action === active.upper ? ease : 0);
        upperWeights.set(action, weight);
        action.setEffectiveWeight(weight);
        if (weight === 0 && action !== active.upper) {
          action.stop();
          upperWeights.delete(action);
        }
      }
      if (controls.blinking === true && boot) {
        if (!booting || !active.eyes) play("eyes", "WakeFace", true);
      } else if (controls.blinking === true) {
        play("eyes", "BlinkFace");
      } else {
        active.eyes?.stop();
        active.eyes = undefined;
      }
      booting = boot;
      mixer.update(delta);
    },
    dispose() {
      mixer.stopAllAction();
      mixer.uncacheRoot(root);
    },
  };
}
