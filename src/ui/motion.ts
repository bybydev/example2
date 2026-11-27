import { interpolate, spring } from "remotion";
import { wordFrame } from "../lib/timeline";
import type { ClipInfo } from "../lib/timeline";

export type LocalRange = {
  start: number;
  end: number;
  duration: number;
};

export type SceneWindowState = {
  visible: boolean;
  opacity: number;
  translateY: number;
};

export const clipRange = (
  clip: ClipInfo | undefined,
  chapterStartFrame: number,
  fallbackStart = 0,
  fallbackDuration = 300
): LocalRange => {
  if (!clip) {
    return {
      start: fallbackStart,
      end: fallbackStart + fallbackDuration,
      duration: fallbackDuration,
    };
  }
  const start = Math.max(0, clip.startFrame - chapterStartFrame);
  const duration = Math.max(1, clip.durationInFrames);
  return { start, end: start + duration, duration };
};

export const cueFrame = (
  clip: ClipInfo | undefined,
  word: string,
  fallbackOffsetInClip: number,
  chapterStartFrame: number,
  nth = 0
): number => {
  const baseStart = clip ? Math.max(0, clip.startFrame - chapterStartFrame) : 0;
  const fallback = baseStart + Math.max(0, fallbackOffsetInClip);
  if (!clip) {
    return fallback;
  }
  return wordFrame(clip, word, fallback, { chapterStartFrame, nth });
};

export const fadeIn = (frame: number, start: number, duration = 12): number => {
  const safeDuration = Math.max(1, duration);
  return interpolate(frame, [start, start + safeDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const progressBetween = (frame: number, start: number, end: number): number => {
  const safeEnd = Math.max(start + 1, end);
  return interpolate(frame, [start, safeEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const springAt = (
  frame: number,
  fps: number,
  start: number,
  config?: { damping?: number; stiffness?: number; mass?: number }
): number => {
  if (frame < start) {
    return 0;
  }
  return spring({
    frame: frame - start,
    fps,
    config: {
      damping: config?.damping ?? 18,
      stiffness: config?.stiffness ?? 140,
      mass: config?.mass ?? 0.9,
    },
  });
};

export const slideUpStyle = (
  frame: number,
  fps: number,
  start: number,
  distance = 24
): { opacity: number; transform: string } => {
  const p = springAt(frame, fps, start);
  return {
    opacity: p,
    transform: `translateY(${interpolate(p, [0, 1], [distance, 0])}px)`,
  };
};

export const popScaleStyle = (
  frame: number,
  fps: number,
  start: number,
  fromScale = 0.9
): { opacity: number; transform: string } => {
  const p = springAt(frame, fps, start, { damping: 16, stiffness: 210, mass: 0.7 });
  return {
    opacity: Math.min(1, p * 1.4),
    transform: `scale(${interpolate(p, [0, 1], [fromScale, 1])})`,
  };
};

export const sceneWindow = (
  frame: number,
  start: number,
  end: number,
  options?: { fadeInFrames?: number; fadeOutFrames?: number; keepAtEnd?: boolean }
): SceneWindowState => {
  const fadeInFrames = Math.max(1, options?.fadeInFrames ?? 6);
  const fadeOutFrames = Math.max(1, options?.fadeOutFrames ?? 6);
  const keepAtEnd = options?.keepAtEnd ?? false;

  if (frame < start - 2) {
    return { visible: false, opacity: 0, translateY: 16 };
  }
  if (!keepAtEnd && frame > end + 2) {
    return { visible: false, opacity: 0, translateY: -12 };
  }

  const enterEnd = start + fadeInFrames;
  const enterOpacity = interpolate(frame, [start, enterEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterY = interpolate(frame, [start, enterEnd], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (keepAtEnd) {
    return { visible: true, opacity: enterOpacity, translateY: enterY };
  }

  const exitStart = Math.max(enterEnd + 1, end - fadeOutFrames);
  const exitEnd = Math.max(exitStart + 1, end);
  const exitOpacity = interpolate(frame, [exitStart, exitEnd], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitY = interpolate(frame, [exitStart, exitEnd], [0, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    visible: true,
    opacity: Math.min(enterOpacity, exitOpacity),
    translateY: frame >= exitStart ? exitY : enterY,
  };
};
