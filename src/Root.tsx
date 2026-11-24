import React from "react";
import { Composition } from "remotion";
import { ChapterPreview, Video } from "./Video";
import { timeline } from "./lib/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Video}
        durationInFrames={Math.max(1, timeline.totalFrames)}
        fps={timeline.fps}
        width={timeline.width}
        height={timeline.height}
      />
      {timeline.chapters.map((chapter) => (
        <Composition
          key={chapter.id}
          id={chapter.compositionId}
          component={ChapterPreview}
          durationInFrames={Math.max(1, chapter.durationInFrames)}
          fps={timeline.fps}
          width={timeline.width}
          height={timeline.height}
          defaultProps={{ chapterId: chapter.id }}
        />
      ))}
    </>
  );
};
