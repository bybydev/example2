import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { wordFrame } from "../../lib/timeline";
import { TOKENS } from "../../theme/tokens";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

export const HookChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const firstClip = clips[0];
  const accentStart = firstClip
    ? wordFrame(firstClip, "hook", 18, { chapterStartFrame: chapter.startFrame })
    : 18;

  const titleProgress = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const accentOpacity = interpolate(frame, [accentStart, accentStart + 12], [0.25, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Stage>
      <div
        style={{
          transform: `translateY(${interpolate(titleProgress, [0, 1], [32, 0])}px)`,
          opacity: titleProgress,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: TOKENS.colors.accent,
            marginBottom: 24,
          }}
        >
          {chapter.title}
        </div>
        <h1 style={{ fontSize: 88, lineHeight: 1.08, margin: 0, maxWidth: 1400 }}>
          {firstClip?.text ?? "Replace this opening hook."}
        </h1>
        <div
          style={{
            marginTop: 40,
            width: 180,
            height: 6,
            borderRadius: 999,
            backgroundColor: TOKENS.colors.accent,
            opacity: accentOpacity,
          }}
        />
      </div>
    </Stage>
  );
};
