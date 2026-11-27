import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../theme/tokens";
import type { SemanticTone } from "../theme/tokens";
import type { ClipInfo, WordTiming } from "./timeline";

type IndexedWord = WordTiming & { index: number };

const PUNCTUATION_END = /[.,!?;:]$/;

const buildCaptionChunks = (
  words: WordTiming[],
  maxWords = 3,
  maxChars = 20
): IndexedWord[][] => {
  const chunks: IndexedWord[][] = [];
  let current: IndexedWord[] = [];
  let charCount = 0;

  for (let index = 0; index < words.length; index++) {
    const word = words[index];
    const nextChars = charCount + (current.length > 0 ? 1 : 0) + word.w.length;

    if (
      current.length > 0 &&
      (current.length >= maxWords || nextChars > maxChars)
    ) {
      chunks.push(current);
      current = [];
      charCount = 0;
    }

    current.push({ ...word, index });
    charCount += (current.length > 1 ? 1 : 0) + word.w.length;

    if (PUNCTUATION_END.test(word.w) && current.length >= 2) {
      chunks.push(current);
      current = [];
      charCount = 0;
    }
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
};

export const CaptionsOverlay: React.FC<{
  clips: ClipInfo[];
  offsetFrame?: number;
  enabled?: boolean;
  tone?: SemanticTone;
  bottomOffset?: number;
  maxWordsPerChunk?: number;
}> = ({
  clips,
  offsetFrame = 0,
  enabled = true,
  tone = "cyan",
  bottomOffset = TOKENS.layout.captionBottom,
  maxWordsPerChunk = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!enabled) {
    return null;
  }

  const globalFrame = frame + offsetFrame;
  const activeClip = clips.find(
    (clip) =>
      globalFrame >= clip.startFrame &&
      globalFrame < clip.startFrame + clip.durationInFrames
  );
  if (!activeClip || activeClip.words.length === 0) {
    return null;
  }

  const localFrame = globalFrame - activeClip.startFrame;

  // Match active spoken word, or bridge brief micro-pauses (<= 8 frames) to avoid flicker
  let activeIndex = activeClip.words.findIndex(
    (word) => localFrame >= word.s && localFrame <= word.e
  );
  if (activeIndex < 0) {
    for (let i = activeClip.words.length - 1; i >= 0; i--) {
      const word = activeClip.words[i];
      if (localFrame > word.e && localFrame - word.e <= 8) {
        activeIndex = i;
        break;
      }
    }
  }
  if (activeIndex < 0) {
    return null;
  }

  const chunks = buildCaptionChunks(activeClip.words, maxWordsPerChunk, 20);
  const activeChunk = chunks.find((chunk) =>
    chunk.some((word) => word.index === activeIndex)
  );
  if (!activeChunk || activeChunk.length === 0) {
    return null;
  }

  const accentColor = TONE_STYLES[tone].main;
  const accentGlow = TONE_STYLES[tone].glow;
  const chunkStart = activeChunk[0].s;
  const chunkEnter = spring({
    frame: Math.max(0, localFrame - chunkStart),
    fps,
    config: { damping: 18, stiffness: 260, mass: 0.55 },
  });
  const chunkTranslateY = interpolate(chunkEnter, [0, 1], [10, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: bottomOffset,
        paddingLeft: TOKENS.layout.safeLeft,
        paddingRight: TOKENS.layout.safeRight,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: 14,
          rowGap: 6,
          maxWidth: "100%",
          padding: "16px 28px",
          borderRadius: 20,
          backgroundColor: "rgba(9, 13, 22, 0.86)",
          border: `1.5px solid rgba(255, 255, 255, 0.14)`,
          boxShadow: `0 14px 36px rgba(0, 0, 0, 0.55), 0 0 28px ${accentGlow}`,
          fontFamily: TOKENS.fonts.display,
          fontSize: 54,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          textAlign: "center",
          transform: `translateY(${chunkTranslateY}px)`,
        }}
      >
        {activeChunk.map((word) => {
          const isCurrent = word.index === activeIndex;
          const isSpoken = word.index < activeIndex;
          const pop = isCurrent
            ? spring({
                frame: Math.max(0, localFrame - word.s),
                fps,
                config: { damping: 14, stiffness: 300, mass: 0.45 },
              })
            : 0;
          const scale = isCurrent ? interpolate(pop, [0, 1], [0.96, 1.07]) : 1;

          return (
            <span
              key={`${word.s}-${word.index}`}
              style={{
                display: "inline-block",
                transform: `scale(${scale})`,
                color: isCurrent
                  ? accentColor
                  : isSpoken
                    ? TOKENS.colors.textPrimary
                    : "rgba(248, 250, 252, 0.72)",
                textShadow: isCurrent
                  ? `0 4px 20px ${accentGlow}`
                  : "0 3px 12px rgba(0, 0, 0, 0.5)",
              }}
            >
              {word.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
