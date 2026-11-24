import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { TOKENS } from "../../theme/tokens";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

export const MainPointChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <Stage>
      <div style={{ opacity }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: TOKENS.colors.accentWarm,
            marginBottom: 24,
          }}
        >
          {chapter.title}
        </div>
        <p style={{ fontSize: 56, lineHeight: 1.3, margin: 0, maxWidth: 1480 }}>
          {clips[0]?.text ?? "Replace this chapter with your visual storytelling."}
        </p>
      </div>
    </Stage>
  );
};
