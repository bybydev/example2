import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAPTER_COMPONENTS } from "./chapters";
import { BackgroundMusic, VoiceoverTrack } from "./lib/audio";
import { CaptionsOverlay } from "./lib/captions";
import { chapterById, chapterClips, timeline } from "./lib/timeline";
import { TOKENS } from "./theme/tokens";

const ShortProgressBar: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (!enabled) {
    return null;
  }

  const progress = Math.max(0, Math.min(1, frame / Math.max(1, durationInFrames - 1)));

  return (
    <div
      style={{
        position: "absolute",
        top: TOKENS.layout.safeTop - 32,
        left: TOKENS.layout.safeLeft,
        right: TOKENS.layout.safeLeft,
        height: 5,
        borderRadius: 999,
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          borderRadius: 999,
          backgroundColor: TOKENS.colors.accent,
          boxShadow: `0 0 12px ${TOKENS.colors.accentGlow}`,
        }}
      />
    </div>
  );
};

const ShortsSafeZoneGuide: React.FC<{ enabled?: boolean }> = ({ enabled = false }) => {
  if (!enabled) {
    return null;
  }

  const guideLabel: React.CSSProperties = {
    fontFamily: TOKENS.fonts.mono,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(251, 113, 133, 0.9)",
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Top YouTube Shorts UI */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: TOKENS.layout.safeTop,
          backgroundColor: "rgba(251, 113, 133, 0.12)",
          borderBottom: "2px dashed rgba(251, 113, 133, 0.65)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: 14,
        }}
      >
        <span style={guideLabel}>TOP SHORTS UI ({TOKENS.layout.safeTop}px)</span>
      </div>

      {/* Right action rail (Like / Dislike / Comment / Share / Sound) */}
      <div
        style={{
          position: "absolute",
          top: TOKENS.layout.safeTop,
          right: 0,
          bottom: TOKENS.layout.safeBottom,
          width: TOKENS.layout.safeRight,
          backgroundColor: "rgba(245, 158, 11, 0.10)",
          borderLeft: "2px dashed rgba(245, 158, 11, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            ...guideLabel,
            color: "rgba(245, 158, 11, 0.9)",
            writingMode: "vertical-rl",
          }}
        >
          RIGHT RAIL ({TOKENS.layout.safeRight}px)
        </span>
      </div>

      {/* Caption band */}
      <div
        style={{
          position: "absolute",
          left: TOKENS.layout.safeLeft,
          right: TOKENS.layout.safeRight,
          bottom: TOKENS.layout.safeBottom,
          height: TOKENS.layout.captionReserve,
          backgroundColor: "rgba(56, 189, 248, 0.08)",
          borderTop: "2px dashed rgba(56, 189, 248, 0.55)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 10,
        }}
      >
        <span style={{ ...guideLabel, color: "rgba(56, 189, 248, 0.9)" }}>
          CAPTION BAND ({TOKENS.layout.captionReserve}px)
        </span>
      </div>

      {/* Bottom YouTube Shorts overlay */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: TOKENS.layout.safeBottom,
          backgroundColor: "rgba(251, 113, 133, 0.14)",
          borderTop: "2px dashed rgba(251, 113, 133, 0.65)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 16,
        }}
      >
        <span style={guideLabel}>
          BOTTOM SHORTS OVERLAY — TITLE / RELATED VIDEO ({TOKENS.layout.safeBottom}px)
        </span>
      </div>
    </AbsoluteFill>
  );
};

export type VideoProps = {
  showCaptions?: boolean;
  musicVolume?: number;
  showProgress?: boolean;
  showSafeZoneGuide?: boolean;
};

export const Video: React.FC<VideoProps> = ({
  showCaptions = true,
  musicVolume = 0.08,
  showProgress = true,
  showSafeZoneGuide = false,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: TOKENS.colors.background }}>
      <BackgroundMusic volume={musicVolume} />
      {timeline.chapters.map((chapter) => {
        const Component = CHAPTER_COMPONENTS[chapter.id];
        if (!Component) {
          return null;
        }
        return (
          <Sequence
            key={chapter.id}
            from={chapter.startFrame}
            durationInFrames={chapter.durationInFrames}
            name={chapter.title}
          >
            <Component chapter={chapter} clips={chapterClips(chapter.id)} />
          </Sequence>
        );
      })}
      <ShortProgressBar enabled={showProgress} />
      <VoiceoverTrack clips={timeline.clips} />
      <CaptionsOverlay clips={timeline.clips} enabled={showCaptions} />
      <ShortsSafeZoneGuide enabled={showSafeZoneGuide} />
    </AbsoluteFill>
  );
};

export type ChapterPreviewProps = {
  chapterId: string;
  showCaptions?: boolean;
  musicVolume?: number;
  showProgress?: boolean;
  showSafeZoneGuide?: boolean;
};

export const ChapterPreview: React.FC<ChapterPreviewProps> = ({
  chapterId,
  showCaptions = true,
  musicVolume = 0.08,
  showProgress = true,
  showSafeZoneGuide = false,
}) => {
  const chapter = chapterById(chapterId);
  const Component = CHAPTER_COMPONENTS[chapter.id];
  const clips = chapterClips(chapter.id);

  return (
    <AbsoluteFill style={{ backgroundColor: TOKENS.colors.background }}>
      <BackgroundMusic volume={musicVolume} startFrom={chapter.startFrame} />
      {Component ? <Component chapter={chapter} clips={clips} /> : null}
      <ShortProgressBar enabled={showProgress} />
      <VoiceoverTrack clips={clips} offsetFrame={chapter.startFrame} />
      <CaptionsOverlay
        clips={clips}
        offsetFrame={chapter.startFrame}
        enabled={showCaptions}
      />
      <ShortsSafeZoneGuide enabled={showSafeZoneGuide} />
    </AbsoluteFill>
  );
};
