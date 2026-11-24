import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import type { ClipInfo } from "./timeline";

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
