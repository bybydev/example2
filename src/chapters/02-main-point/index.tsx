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
  SvgLink,
  SvgPacket,
} from "../../ui/diagrams";
import type { CodeLine } from "../../ui/diagrams";
import {
  DataChip,
  MeterBar,
  SceneBeat,
  SectionTitle,
} from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const SCRIPT_LINES: CodeLine[] = [
  { text: "# content/voiceover.md", tone: "neutral" },
  { text: "" },
  { text: "Welcome to this video. Replace this", tone: "cyan", highlight: true },
  { text: "hook paragraph with your real narration.", tone: "cyan" },
  { text: "" },
  { text: "← blank line splits next clip", tone: "amber" },
  { text: "" },
  { text: "Here is the second paragraph. Split", tone: "emerald", highlight: true },
  { text: "your script into one paragraph per line.", tone: "emerald" },
];

export const MainPointChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const firstClip = clips[0];
  const beat = clipRange(firstClip, chapter.startFrame, 0, chapter.durationInFrames);
  const splitCue = cueFrame(firstClip, "Split", 58, chapter.startFrame);
  const mapsCue = cueFrame(firstClip, "maps", 160, chapter.startFrame);
  const voiceoverCue = cueFrame(firstClip, "voiceover", 185, chapter.startFrame);
  const whisperCue = cueFrame(firstClip, "Whisper", 220, chapter.startFrame);

  const window = sceneWindow(frame, beat.start, beat.end, { keepAtEnd: true });
  const codeReveal = progressBetween(frame, beat.start + 10, splitCue + 55);
  const linkProgress = progressBetween(frame, mapsCue, mapsCue + 24);
  const audioPacket = progressBetween(frame, voiceoverCue, voiceoverCue + 28);
  const timingPacket = progressBetween(frame, whisperCue, whisperCue + 28);
  const alignmentPercent = 100 * progressBetween(frame, whisperCue, whisperCue + 36);

  return (
    <Stage
      chapterIndex="02"
      chapterTitle={chapter.title}
      tone="amber"
      legend={[
        { label: "SCRIPT", tone: "cyan" },
        { label: "VOICEOVER MP3", tone: "amber" },
        { label: "WHISPER + SRT", tone: "emerald" },
      ]}
    >
      <Sfx name="whoosh-fast" from={beat.start} volume={0.25} />
      <Sfx name="slide" from={splitCue} volume={0.24} />
      <Sfx name="magnetic-snap" from={mapsCue} volume={0.3} />
      <Sfx name="data-blip" from={voiceoverCue} volume={0.28} />
      <Sfx name="success-ding" from={whisperCue} volume={0.28} />

      <SceneBeat window={window}>
        <SectionTitle
          eyebrow="Sync Pipeline"
          title="One Paragraph → Audio + Word Timings"
          subtitle={
            firstClip?.text ??
            "Split your script into one paragraph per blank line to generate voiceover clips and Whisper timings."
          }
          tone="amber"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 140px 1fr",
            alignItems: "center",
          }}
        >
          {/* Left: Source voiceover script */}
          <div style={slideUpStyle(frame, fps, beat.start + 6, 22)}>
            <CodePanel
              title="content/voiceover.md"
              badge="2 PARAGRAPHS"
              tone="cyan"
              lines={SCRIPT_LINES}
              revealProgress={codeReveal}
              fontSize={18}
            />
          </div>

          {/* Center: Animated SVG connectors & packets */}
          <svg
            width={140}
            height={320}
            viewBox="0 0 140 320"
            style={{ overflow: "visible" }}
          >
            <SvgLink
              x1={8}
              y1={148}
              x2={132}
              y2={76}
              progress={linkProgress}
              tone="amber"
              arrow
            />
            <SvgLink
              x1={8}
              y1={172}
              x2={132}
              y2={244}
              progress={linkProgress}
              tone="emerald"
              arrow
            />
            <SvgPacket
              x1={8}
              y1={148}
              x2={132}
              y2={76}
              progress={audioPacket}
              tone="amber"
              label="MP3"
            />
            <SvgPacket
              x1={8}
              y1={172}
              x2={132}
              y2={244}
              progress={timingPacket}
              tone="emerald"
              label="JSON"
            />
          </svg>

          {/* Right: Generated audio & timing outputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={slideUpStyle(frame, fps, splitCue, 20)}>
              <NodeBox
                tag="VOICEOVER CLIPS"
                title="public/voiceover/*.mp3"
                subtitle="Normalized narration clips sequenced by VoiceoverTrack"
                tone="amber"
                glow={frame >= voiceoverCue}
                compact
              >
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <DataChip label="001.mp3" sublabel="4.3s" tone="amber" />
                  <DataChip label="002.mp3" sublabel="9.1s" tone="amber" />
                </div>
              </NodeBox>
            </div>

            <div style={slideUpStyle(frame, fps, mapsCue, 20)}>
              <NodeBox
                tag="WHISPER SIDECARS"
                title="content/timings/*.json"
                subtitle="Exact word frames compiled into src/generated/timeline.json"
                tone="emerald"
                glow={frame >= whisperCue}
                compact
              >
                <div style={{ marginTop: 12 }}>
                  <MeterBar
                    label="Word alignment"
                    percent={alignmentPercent}
                    tone="emerald"
                    height={18}
                  />
                </div>
              </NodeBox>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            ...slideUpStyle(frame, fps, mapsCue, 16),
          }}
        >
          <CheckRow
            label="content/subtitles.srt & content/youtube-chapters.txt"
            detail="Auto-generated by mycli remotion sync and uploaded by GitHub Actions"
            status={frame >= whisperCue ? "SYNCED" : "GENERATING"}
            tone="emerald"
            active={frame >= whisperCue}
          />
        </div>
      </SceneBeat>
    </Stage>
  );
};
