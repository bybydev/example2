import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS } from "../../theme/tokens";
import {
  clipRange,
  cueFrame,
  progressBetween,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import {
  Card,
  DataChip,
  MeterBar,
  Pill,
  SceneBeat,
  SectionTitle,
} from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

export const MainPointChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const firstClip = clips[0];
  const beat = clipRange(firstClip, chapter.startFrame, 0, chapter.durationInFrames);
  const compareCue = cueFrame(firstClip, "paragraph", 24, chapter.startFrame);
  const window = sceneWindow(frame, beat.start, beat.end, { keepAtEnd: true });

  const primaryPercent = 84 * progressBetween(frame, beat.start + 10, beat.start + 45);
  const secondaryPercent = 32 * progressBetween(frame, compareCue, compareCue + 35);

  return (
    <Stage
      chapterIndex="02"
      chapterTitle={chapter.title}
      tone="amber"
      legend={[
        { label: "CONCEPT A", tone: "cyan" },
        { label: "CONCEPT B", tone: "amber" },
      ]}
    >
      <SceneBeat window={window}>
        <SectionTitle
          eyebrow="Core Comparison"
          title="Replace With Your Main Visual Story"
          subtitle={firstClip?.text ?? "Use semantic cards, chips, and animated meters to compare ideas."}
          tone="amber"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div style={slideUpStyle(frame, fps, beat.start + 6, 24)}>
            <Card tone="cyan" glow padding={34}>
              <Pill tone="cyan" size="md" style={{ marginBottom: 18 }}>
                APPROACH A
              </Pill>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 14 }}>
                Fast / Efficient Path
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <DataChip label="STEP 1" sublabel="parallel" tone="cyan" />
                <DataChip label="STEP 2" sublabel="cached" tone="emerald" />
              </div>
              <MeterBar label="Throughput" percent={primaryPercent} tone="cyan" />
            </Card>
          </div>

          <div style={slideUpStyle(frame, fps, compareCue, 24)}>
            <Card tone="amber" glow padding={34}>
              <Pill tone="amber" size="md" style={{ marginBottom: 18 }}>
                APPROACH B
              </Pill>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 14 }}>
                Bottlenecked Path
              </div>
              <div
                style={{
                  fontSize: 22,
                  lineHeight: 1.45,
                  color: TOKENS.colors.textSecondary,
                  marginBottom: 24,
                }}
              >
                Swap this card for your chapter&apos;s contrasting diagram, metric, or takeaway.
              </div>
              <MeterBar label="Utilization" percent={secondaryPercent} tone="amber" />
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
