import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TOKENS } from "../theme/tokens";
import type { ClipInfo } from "./timeline";

export const CaptionsOverlay: React.FC<{
  clips: ClipInfo[];
  offsetFrame?: number;
  enabled?: boolean;
}> = ({ clips, offsetFrame = 0, enabled = false }) => {
  const frame = useCurrentFrame();
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
  const activeIndex = activeClip.words.findIndex(
    (word) => localFrame >= word.s && localFrame <= word.e
  );
  if (activeIndex < 0) {
    return null;
  }

  const windowStart = Math.max(0, activeIndex - 3);
  const windowWords = activeClip.words.slice(windowStart, windowStart + 7);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: TOKENS.layout.safeMarginY,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "14px 28px",
          borderRadius: 16,
          backgroundColor: "rgba(9, 13, 22, 0.82)",
          fontFamily: TOKENS.fonts.sans,
          fontSize: 40,
          fontWeight: 700,
        }}
      >
        {windowWords.map((word, index) => {
          const isCurrent = windowStart + index === activeIndex;
          return (
            <span
              key={`${word.s}-${index}`}
              style={{
                color: isCurrent ? TOKENS.colors.accent : TOKENS.colors.textPrimary,
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
