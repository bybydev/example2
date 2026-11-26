import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../lib/audio";
import { timeline } from "../../lib/timeline";
import { TOKENS } from "../../theme/tokens";
import {
  clipRange,
  cueFrame,
  fadeIn,
  progressBetween,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import {
  AnimatedNumber,
  Card,
  Pill,
  SceneBeat,
  SectionTitle,
  StatCallout,
} from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

export const HookChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const firstClip = clips[0];
  const beat = clipRange(firstClip, chapter.startFrame, 0, chapter.durationInFrames);
  const replaceCue = cueFrame(firstClip, "Replace", 42, chapter.startFrame);
  const hookCue = cueFrame(firstClip, "hook", 60, chapter.startFrame);
  const narrationCue = cueFrame(firstClip, "narration", 105, chapter.startFrame);

  const window = sceneWindow(frame, beat.start, beat.end, { keepAtEnd: true });
  const statsProgress = progressBetween(frame, hookCue, hookCue + 36);
  const noteOpacity = fadeIn(frame, narrationCue, 14);

  return (
    <Stage
      chapterIndex="01"
      chapterTitle={chapter.title}
      tone="cyan"
      legend={[
        { label: "BUNDLED FONTS", tone: "cyan" },
        { label: "SFX + MUSIC", tone: "amber" },
        { label: "WHISPER SYNC", tone: "emerald" },
      ]}
    >
      <Sfx name="whoosh-soft" from={beat.start} volume={0.28} />
      <Sfx name="pop-in" from={hookCue} volume={0.32} />
      <Sfx name="chime-positive" from={narrationCue} volume={0.26} />

      <SceneBeat window={window}>
        <div style={slideUpStyle(frame, fps, beat.start, 28)}>
          <SectionTitle
            eyebrow="Opening Hook"
            title={timeline.title}
            subtitle={firstClip?.text ?? "Replace this opening hook with your core premise."}
            tone="cyan"
          />
        </div>

        <div style={slideUpStyle(frame, fps, replaceCue, 22)}>
          <Card
            tone="cyan"
            glow
            padding={30}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              opacity: fadeIn(frame, replaceCue, 12),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Pill tone="cyan" size="md">
                KEY THESIS
              </Pill>
              <span style={{ fontSize: 27, fontWeight: 700, color: TOKENS.colors.textPrimary }}>
                Anchor every visual &amp; SFX cue to speech via{" "}
                <span style={{ fontFamily: TOKENS.fonts.mono, color: TOKENS.colors.accent }}>
                  cueFrame()
                </span>
              </span>
            </div>
            <span
              style={{
                fontFamily: TOKENS.fonts.handwritten,
                fontSize: 34,
                fontWeight: 700,
                color: TOKENS.colors.accentWarm,
                opacity: noteOpacity,
                whiteSpace: "nowrap",
              }}
            >
              ← synced to Whisper!
            </span>
          </Card>
        </div>

        <div
          style={{
            marginTop: 26,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            ...slideUpStyle(frame, fps, hookCue, 24),
            opacity: fadeIn(frame, hookCue, 14),
          }}
        >
          <StatCallout
            label="Canvas & Fonts"
            value="1080p"
            detail="Space Grotesk, Inter, JetBrains Mono & Caveat"
            tone="cyan"
            glow
          />
          <StatCallout
            label="Bundled SFX"
            value={
              <AnimatedNumber
                from={0}
                to={33}
                progress={statsProgress}
                suffix=" clips"
                tone="amber"
                size={48}
              />
            }
            detail="Typed <Sfx /> helper + ambient music bed"
            tone="amber"
          />
          <StatCallout
            label="Synced Timeline"
            value={
              <AnimatedNumber
                from={0}
                to={timeline.totalSeconds}
                progress={statsProgress}
                decimals={1}
                suffix="s"
                tone="emerald"
                size={48}
              />
            }
            detail="Voiceover MP3s, word timings & YouTube SRT"
            tone="emerald"
            glow={frame >= narrationCue}
          />
        </div>
      </SceneBeat>
    </Stage>
  );
};
