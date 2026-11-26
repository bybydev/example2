import React from "react";
import { Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import type { ClipInfo } from "./timeline";

export const SFX_NAMES = [
  // Transitions
  "whoosh-soft",
  "whoosh-fast",
  "swish",
  // UI & Diagrams
  "pop-in",
  "pop-out",
  "click-subtle",
  "slide",
  // Connections & Tech Diagrams
  "magnetic-snap",
  "toggle-on",
  "toggle-off",
  "ping-radar",
  "data-blip",
  "power-up",
  "power-down",
  // Data, Charts, Numbers & Money
  "tick-digital",
  "typing-loop",
  "cash-chime",
  "scale-up",
  "scale-down",
  "clock-tick",
  // Emphasis, Plot Twists & Warnings
  "chime-positive",
  "thud-low",
  "riser-short",
  "bass-drop",
  "tape-stop",
  "glitch-short",
  "error-buzz",
  "success-ding",
  // Text, Paper & Interface Actions
  "mouse-click",
  "camera-shutter",
  "page-turn",
  "marker-draw",
  "bubble-pop",
] as const;

export type SfxName = (typeof SFX_NAMES)[number];

/** Plays a bundled SFX from `public/sfx/<name>.mp3` starting at `from` (chapter-relative frame). */
export const Sfx: React.FC<{
  name: SfxName;
  from: number;
  volume?: number;
  durationInFrames?: number;
  playbackRate?: number;
  loop?: boolean;
}> = ({
  name,
  from,
  volume = 0.35,
  durationInFrames,
  playbackRate = 1,
  loop = false,
}) => {
  return (
    <Sequence
      from={Math.max(0, Math.round(from))}
      durationInFrames={
        durationInFrames !== undefined ? Math.max(1, Math.round(durationInFrames)) : undefined
      }
      name={`SFX: ${name}`}
    >
      <Audio
        src={staticFile(`sfx/${name}.mp3`)}
        volume={volume}
        playbackRate={playbackRate}
        loop={loop}
      />
    </Sequence>
  );
};

/** Plays a looping background music bed from `public/music/` with smooth fade-in and fade-out. */
export const BackgroundMusic: React.FC<{
  src?: string;
  volume?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  startFrom?: number;
  loop?: boolean;
}> = ({
  src = "music/bg-ambient.mp3",
  volume = 0.08,
  fadeInFrames = 24,
  fadeOutFrames = 36,
  startFrom = 0,
  loop = true,
}) => {
  const { durationInFrames } = useVideoConfig();

  if (volume <= 0) {
    return null;
  }

  return (
    <Audio
      src={staticFile(src)}
      startFrom={Math.max(0, Math.round(startFrom))}
      loop={loop}
      volume={(f) => {
        const fadeIn =
          fadeInFrames > 0
            ? interpolate(f, [0, fadeInFrames], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;
        const fadeOutStart = Math.max(0, durationInFrames - fadeOutFrames);
        const fadeOut =
          fadeOutFrames > 0 && durationInFrames > fadeOutStart
            ? interpolate(f, [fadeOutStart, durationInFrames], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : 1;
        return volume * Math.min(fadeIn, fadeOut);
      }}
    />
  );
};

export const VoiceoverTrack: React.FC<{
  clips: ClipInfo[];
  offsetFrame?: number;
}> = ({ clips, offsetFrame = 0 }) => {
  return (
    <>
      {clips.map((clip) => {
        if (!clip.audioFile) {
          return null;
        }
        const from = clip.startFrame - offsetFrame + clip.leadFrames;
        return (
          <Sequence
            key={clip.paragraph}
            from={Math.max(0, from)}
            durationInFrames={Math.max(1, clip.voiceFrames)}
            name={`VO #${clip.paragraph}`}
          >
            <Audio src={staticFile(clip.audioFile)} />
          </Sequence>
        );
      })}
    </>
  );
};
