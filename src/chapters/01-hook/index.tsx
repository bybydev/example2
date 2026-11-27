import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../lib/audio";
import { timeline } from "../../lib/timeline";
import { TOKENS } from "../../theme/tokens";
import {
  clipRange,
  cueFrame,
  fadeIn,
  popScaleStyle,
  progressBetween,
  slideUpStyle,
} from "../../ui/motion";
import {
  AnimatedNumber,
  Card,
  Pill,
  StatCallout,
} from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

/**
 * Starter demo chapter (`01-hook`).
 * NOTE FOR AI AGENTS: This is a minimal reference demo, NOT a fixed visual template.
 * Replace this layout freely with bespoke visuals tailored to each Short's topic and storyboard.
 * Keep frame 0 immediately legible (no fade-from-black) so it works cleanly in Shorts feeds & frame pickers.
 */
export const HookChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const firstClip = clips[0];
  const beat = clipRange(firstClip, chapter.startFrame, 0, chapter.durationInFrames);
  const replaceCue = cueFrame(firstClip, "Replace", 36, chapter.startFrame);
  const hookCue = cueFrame(firstClip, "hook", 54, chapter.startFrame);
  const narrationCue = cueFrame(firstClip, "narration", 96, chapter.startFrame);

  const statsProgress = progressBetween(frame, hookCue, hookCue + 32);
  const noteOpacity = fadeIn(frame, narrationCue, 10);

  return (
    <Stage tone="cyan">
      <Sfx name="whoosh-soft" from={beat.start} volume={0.28} />
      <Sfx name="pop-in" from={hookCue} volume={0.32} />
      <Sfx name="chime-positive" from={narrationCue} volume={0.26} />

      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {/* Frame-0 instant hero focal visual (visible immediately at opacity 1) */}
        <h1
          style={{
            margin: 0,
            fontFamily: TOKENS.fonts.display,
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            color: TOKENS.colors.textPrimary,
          }}
        >
          {timeline.title}
        </h1>

        <div style={popScaleStyle(frame, fps, replaceCue, 0.94)}>
          <Card
            tone="cyan"
            glow
            padding={26}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Pill tone="cyan" size="md">
                WHISPER-SYNCED
              </Pill>
              <span
                style={{
                  fontFamily: TOKENS.fonts.handwritten,
                  fontSize: 34,
                  fontWeight: 700,
                  color: TOKENS.colors.accentWarm,
                  opacity: noteOpacity,
                }}
              >
                synced to speech!
              </span>
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                lineHeight: 1.3,
                color: TOKENS.colors.textPrimary,
              }}
            >
              Anchor visuals &amp; SFX directly to spoken words via{" "}
              <span style={{ fontFamily: TOKENS.fonts.mono, color: TOKENS.colors.accent }}>
                cueFrame()
              </span>
            </div>
          </Card>
        </div>

        {/* 2-column vertical-friendly stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
            ...slideUpStyle(frame, fps, hookCue, 20),
          }}
        >
          <StatCallout
            label="Format"
            value="9:16"
            detail="1080×1920 Shorts safe zones"
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
                size={42}
              />
            }
            detail="Typed <Sfx /> + ambient bed"
            tone="amber"
          />
        </div>

        <div style={slideUpStyle(frame, fps, narrationCue, 18)}>
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
                size={46}
              />
            }
            detail="Voiceover MP3s, kinetic captions & YouTube SRT"
            tone="emerald"
            glow={frame >= narrationCue}
          />
        </div>
      </div>
    </Stage>
  );
};
