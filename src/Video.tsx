import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CHAPTER_COMPONENTS } from "./chapters";
import { BackgroundMusic, VoiceoverTrack } from "./lib/audio";
import { CaptionsOverlay } from "./lib/captions";
import { chapterById, chapterClips, timeline } from "./lib/timeline";
import { TOKENS } from "./theme/tokens";

export type VideoProps = {
  showCaptions?: boolean;
  musicVolume?: number;
};

export const Video: React.FC<VideoProps> = ({
  showCaptions = false,
  musicVolume = 0.08,
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
      <VoiceoverTrack clips={timeline.clips} />
      <CaptionsOverlay clips={timeline.clips} enabled={showCaptions} />
    </AbsoluteFill>
  );
};

export type ChapterPreviewProps = {
  chapterId: string;
  showCaptions?: boolean;
  musicVolume?: number;
};

export const ChapterPreview: React.FC<ChapterPreviewProps> = ({
  chapterId,
  showCaptions = false,
  musicVolume = 0.08,
}) => {
  const chapter = chapterById(chapterId);
  const Component = CHAPTER_COMPONENTS[chapter.id];
  const clips = chapterClips(chapter.id);

  return (
    <AbsoluteFill style={{ backgroundColor: TOKENS.colors.background }}>
      <BackgroundMusic volume={musicVolume} startFrom={chapter.startFrame} />
      {Component ? <Component chapter={chapter} clips={clips} /> : null}
      <VoiceoverTrack clips={clips} offsetFrame={chapter.startFrame} />
      <CaptionsOverlay
        clips={clips}
        offsetFrame={chapter.startFrame}
        enabled={showCaptions}
      />
    </AbsoluteFill>
  );
};
