import React from "react";
import { Composition, Still } from "remotion";
import { Thumbnail } from "./Thumbnail";
import { ChapterPreview, Video } from "./Video";
import { timeline } from "./lib/timeline";
import { loadFonts } from "./theme/fonts";

loadFonts();

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
        defaultProps={{
          showCaptions: true,
          musicVolume: 0.08,
          showProgress: true,
          showSafeZoneGuide: false,
        }}
      />
      <Still id="Thumbnail" component={Thumbnail} width={1080} height={1920} />
      {timeline.chapters.map((chapter) => (
        <Composition
          key={chapter.id}
          id={chapter.compositionId}
          component={ChapterPreview}
          durationInFrames={Math.max(1, chapter.durationInFrames)}
          fps={timeline.fps}
          width={timeline.width}
          height={timeline.height}
          defaultProps={{
            chapterId: chapter.id,
            showCaptions: true,
            musicVolume: 0.08,
            showProgress: true,
            showSafeZoneGuide: false,
          }}
        />
      ))}
    </>
  );
};
