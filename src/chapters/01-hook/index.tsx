import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { timeline } from "../../lib/timeline";
import { TOKENS } from "../../theme/tokens";
import {
  clipRange,
  cueFrame,
  fadeIn,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import { Card, Pill, SceneBeat, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

export const HookChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const firstClip = clips[0];
  const beat = clipRange(firstClip, chapter.startFrame, 0, chapter.durationInFrames);
  const accentCue = cueFrame(firstClip, "hook", 18, chapter.startFrame);
  const window = sceneWindow(frame, beat.start, beat.end, { keepAtEnd: true });

  return (
    <Stage chapterIndex="01" chapterTitle={chapter.title} tone="cyan">
      <SceneBeat window={window}>
        <div style={slideUpStyle(frame, fps, beat.start, 28)}>
          <SectionTitle
            eyebrow="Opening Hook"
            title={timeline.title}
            subtitle={firstClip?.text ?? "Replace this opening hook with your core premise."}
            tone="cyan"
          />
        </div>

        <div style={slideUpStyle(frame, fps, accentCue, 20)}>
          <Card
            tone="cyan"
            glow
            padding={32}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              opacity: fadeIn(frame, accentCue, 12),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Pill tone="cyan" size="md">
                KEY THESIS
              </Pill>
              <span style={{ fontSize: 28, fontWeight: 700, color: TOKENS.colors.textPrimary }}>
                Anchor visual transitions to spoken cues via{" "}
                <span style={{ fontFamily: TOKENS.fonts.mono, color: TOKENS.colors.accent }}>
                  cueFrame()
                </span>
              </span>
            </div>
            <Pill tone="amber" size="lg">
              1920 × 1080
            </Pill>
          </Card>
        </div>
      </SceneBeat>
    </Stage>
  );
};
