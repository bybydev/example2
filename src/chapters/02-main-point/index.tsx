import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../lib/audio";
import {
  clipRange,
  cueFrame,
  progressBetween,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import {
  CheckRow,
  CodePanel,
  NodeBox,
  VerticalFlowConnector,
} from "../../ui/diagrams";
import type { CodeLine } from "../../ui/diagrams";
import {
  DataChip,
  MeterBar,
  SceneBeat,
} from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

/**
 * Starter demo chapter (`02-main-point`).
 * NOTE FOR AI AGENTS: This is a minimal reference demo, NOT a rigid layout mold.
 * Notice there is NO SectionTitle / eyebrow header here — jump straight into visuals
 * and design each Short with its own custom visual language and storytelling rhythm.
 */
const SCRIPT_LINES: CodeLine[] = [
  { text: "# content/voiceover.md", tone: "neutral" },
  { text: "Welcome to this video. Replace", tone: "cyan", highlight: true },
  { text: "this hook with real narration.", tone: "cyan" },
  { text: "" },
  { text: "← blank line splits next clip", tone: "amber" },
  { text: "" },
  { text: "Here is the second paragraph.", tone: "emerald", highlight: true },
  { text: "One paragraph = one audio clip.", tone: "emerald" },
];

export const MainPointChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const firstClip = clips[0];
  const beat = clipRange(firstClip, chapter.startFrame, 0, chapter.durationInFrames);
  const splitCue = cueFrame(firstClip, "Split", 50, chapter.startFrame);
  const mapsCue = cueFrame(firstClip, "maps", 150, chapter.startFrame);
  const voiceoverCue = cueFrame(firstClip, "voiceover", 175, chapter.startFrame);
  const whisperCue = cueFrame(firstClip, "Whisper", 210, chapter.startFrame);

  const window = sceneWindow(frame, beat.start, beat.end, { keepAtEnd: true });
  const codeReveal = progressBetween(frame, beat.start + 6, splitCue + 45);
  const linkProgress = progressBetween(frame, mapsCue, mapsCue + 20);
  const audioPacket = progressBetween(frame, voiceoverCue, voiceoverCue + 24);
  const timingPacket = progressBetween(frame, whisperCue, whisperCue + 24);
  const alignmentPercent = 100 * progressBetween(frame, whisperCue, whisperCue + 30);

  return (
    <Stage tone="amber">
      <Sfx name="whoosh-fast" from={beat.start} volume={0.25} />
      <Sfx name="slide" from={splitCue} volume={0.24} />
      <Sfx name="magnetic-snap" from={mapsCue} volume={0.3} />
      <Sfx name="data-blip" from={voiceoverCue} volume={0.28} />
      <Sfx name="success-ding" from={whisperCue} volume={0.28} />

      <SceneBeat window={window}>
        {/* Visual-first vertical flow: no repetitive title/eyebrow banner */}
        <div style={slideUpStyle(frame, fps, beat.start + 4, 20)}>
          <CodePanel
            title="content/voiceover.md"
            badge="2 PARAGRAPHS"
            tone="cyan"
            lines={SCRIPT_LINES}
            revealProgress={codeReveal}
            fontSize={20}
          />
        </div>

        {/* Top-to-bottom animated connectors & packets */}
        <VerticalFlowConnector
          width={860}
          height={108}
          fromX={430}
          branches={[
            {
              toX: 210,
              tone: "amber",
              linkProgress,
              packetProgress: audioPacket,
              packetLabel: "MP3",
            },
            {
              toX: 650,
              tone: "emerald",
              linkProgress,
              packetProgress: timingPacket,
              packetLabel: "JSON",
            },
          ]}
        />

        {/* 2-column vertical-friendly outputs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 18,
          }}
        >
          <div style={slideUpStyle(frame, fps, splitCue, 18)}>
            <NodeBox
              tag="VOICEOVER"
              title="voiceover/*.mp3"
              subtitle="Normalized -14 LUFS clips"
              tone="amber"
              glow={frame >= voiceoverCue}
              compact
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                <DataChip label="001.mp3" sublabel="4.3s" tone="amber" />
                <DataChip label="002.mp3" sublabel="9.1s" tone="amber" />
              </div>
            </NodeBox>
          </div>

          <div style={slideUpStyle(frame, fps, mapsCue, 18)}>
            <NodeBox
              tag="TIMINGS"
              title="timings/*.json"
              subtitle="Exact word frames"
              tone="emerald"
              glow={frame >= whisperCue}
              compact
            >
              <div style={{ marginTop: 12 }}>
                <MeterBar
                  label="Alignment"
                  percent={alignmentPercent}
                  tone="emerald"
                  height={16}
                />
              </div>
            </NodeBox>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            ...slideUpStyle(frame, fps, mapsCue, 14),
          }}
        >
          <CheckRow
            label="subtitles.srt & timeline.json"
            detail="Auto-generated by mycli remotion sync"
            status={frame >= whisperCue ? "SYNCED" : "GENERATING"}
            tone="emerald"
            active={frame >= whisperCue}
          />
        </div>
      </SceneBeat>
    </Stage>
  );
};
