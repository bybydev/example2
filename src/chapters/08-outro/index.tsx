import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS } from "../../theme/tokens";
import {
  clipRange,
  cueFrame,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import { Card, Pill } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

export const OutroChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p24 = clipRange(clips[0], chapter.startFrame, 0, 617);

  const parallelCue = cueFrame(clips[0], "parallel", 100, chapter.startFrame);
  const serialCue = cueFrame(clips[0], "serial", 190, chapter.startFrame);
  const physicsCue = cueFrame(clips[0], "physics", 410, chapter.startFrame);

  const w24 = sceneWindow(frame, p24.start, p24.end, { keepAtEnd: true });

  return (
    <Stage chapterIndex="08" chapterTitle={chapter.title} tone="cyan">
      {w24.visible ? (
        <AbsoluteFill
          style={{
            opacity: w24.opacity,
            transform: `translateY(${w24.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: 1520 }}>
            <div style={{ textAlign: "center", marginBottom: 34 }}>
              <Pill tone="neutral" size="md" style={{ marginBottom: 14 }}>
                ONE MENTAL MODEL TO REMEMBER
              </Pill>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginBottom: 42 }}>
              <div style={slideUpStyle(frame, fps, parallelCue - 20, 26)}>
                <Card tone="cyan" glow padding={42} style={{ textAlign: "center" }}>
                  <Pill tone="cyan" size="md" style={{ marginBottom: 18 }}>
                    INPUT • PREFILL
                  </Pill>
                  <div style={{ fontSize: 52, fontWeight: 900, marginBottom: 12 }}>
                    Parallel Math
                  </div>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 26,
                      fontWeight: 700,
                      color: TOKENS.colors.accent,
                      marginBottom: 16,
                    }}
                  >
                    COMPUTE-BOUND (GEMM)
                  </div>
                  <div style={{ fontSize: 23, color: TOKENS.colors.textSecondary }}>
                    Load model weights once, process thousands of prompt tokens together.
                  </div>
                </Card>
              </div>

              <div style={slideUpStyle(frame, fps, serialCue - 20, 26)}>
                <Card tone="amber" glow padding={42} style={{ textAlign: "center" }}>
                  <Pill tone="amber" size="md" style={{ marginBottom: 18 }}>
                    OUTPUT • DECODE
                  </Pill>
                  <div style={{ fontSize: 52, fontWeight: 900, marginBottom: 12 }}>
                    Serial Memory Traffic
                  </div>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 26,
                      fontWeight: 700,
                      color: TOKENS.colors.accentWarm,
                      marginBottom: 16,
                    }}
                  >
                    BANDWIDTH-BOUND (GEMV)
                  </div>
                  <div style={{ fontSize: 23, color: TOKENS.colors.textSecondary }}>
                    Stream gigabytes of weights &amp; KV cache across silicon for every single word.
                  </div>
                </Card>
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                ...slideUpStyle(frame, fps, physicsCue - 25, 20),
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  lineHeight: 1.38,
                  color: TOKENS.colors.textPrimary,
                  maxWidth: 1180,
                  margin: "0 auto",
                }}
              >
                That <span style={{ color: TOKENS.colors.accentWarm }}>5× output token price</span>{" "}
                isn&apos;t arbitrary markup — it&apos;s the physics of moving gigabytes across
                silicon just to pick the next word.
              </div>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </Stage>
  );
};
