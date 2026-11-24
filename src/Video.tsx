import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { CHAPTER_COMPONENTS } from "./chapters";
import { VoiceoverTrack } from "./lib/audio";
import { CaptionsOverlay } from "./lib/captions";
import { chapterById, chapterClips, timeline } from "./lib/timeline";
import { TOKENS } from "./theme/tokens";

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: TOKENS.colors.background }}>
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
      <CaptionsOverlay clips={timeline.clips} />
    </AbsoluteFill>
  );
};

export const ChapterPreview: React.FC<{ chapterId: string }> = ({ chapterId }) => {
  const chapter = chapterById(chapterId);
  const Component = CHAPTER_COMPONENTS[chapter.id];
  const clips = chapterClips(chapter.id);

  return (
    <AbsoluteFill style={{ backgroundColor: TOKENS.colors.background }}>
      {Component ? <Component chapter={chapter} clips={clips} /> : null}
      <VoiceoverTrack clips={clips} offsetFrame={chapter.startFrame} />
      <CaptionsOverlay clips={clips} offsetFrame={chapter.startFrame} />
    </AbsoluteFill>
  );
};
