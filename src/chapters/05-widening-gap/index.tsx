import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import {
  clipRange,
  cueFrame,
  fadeIn,
  progressBetween,
  sceneWindow,
  slideUpStyle,
  springAt,
} from "../../ui/motion";
import { Card, Pill, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const THINKING_LINES = [
  "1. Check stack trace in src/api/handler.ts:142...",
  "2. Verify TypeScript strict null checks on response payload...",
  "3. Cross-check schema mismatch between v2 client and worker...",
  "4. Simulate edge cases for empty retry array and timeout...",
  "5. Draft minimal patch & verify backwards compatibility...",
];

export const WideningGapChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p15 = clipRange(clips[0], chapter.startFrame, 0, 539);
  const p16 = clipRange(clips[1], chapter.startFrame, p15.end, 515);
  const p17 = clipRange(clips[2], chapter.startFrame, p16.end, 414);

  // Beat 1 (P15) cues
  const reuseCue = cueFrame(clips[0], "reuse", 230, chapter.startFrame);
  const ninetyCue = cueFrame(clips[0], "ninety", 350, chapter.startFrame);
  const outputCue = cueFrame(clips[0], "output", 410, chapter.startFrame);

  // Beat 2 (P16) cues
  const thinkingCue = cueFrame(clips[1], "thinking", 220, chapter.startFrame);
  const billedCue = cueFrame(clips[1], "billed", 420, chapter.startFrame);

  // Beat 3 (P17) cues
  const volumeCue = cueFrame(clips[2], "volume", 110, chapter.startFrame);
  const billCue = cueFrame(clips[2], "bill", 310, chapter.startFrame);

  const w15 = sceneWindow(frame, p15.start, p15.end);
  const w16 = sceneWindow(frame, p16.start, p16.end);
  const w17 = sceneWindow(frame, p17.start, p17.end, { keepAtEnd: true });

  // Beat 1 cached ratio jump
  const ratioVal = Math.round(
    interpolate(progressBetween(frame, reuseCue, ninetyCue + 30), [0, 1], [5, 50])
  );

  // Beat 2 X-ray thinking drawer open
  const drawerProgress = springAt(frame, fps, thinkingCue - 20, { damping: 16, stiffness: 120 });
  const thinkingTokens = Math.round(
    interpolate(progressBetween(frame, thinkingCue - 10, p16.end - 45), [0, 1], [40, 2480])
  );

  // Beat 3 bar animations
  const volFill = progressBetween(frame, volumeCue - 20, volumeCue + 35);
  const billFill = progressBetween(frame, billCue - 65, billCue + 10);

  return (
    <Stage chapterIndex="05" chapterTitle={chapter.title} tone="amber">
      {/* BEAT 1 (P15): Prompt Caching */}
      {w15.visible ? (
        <AbsoluteFill
          style={{
            opacity: w15.opacity,
            transform: `translateY(${w15.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Trend #1 — Prompt Caching"
            title="Inputs Can Be Cached. Outputs Never Can."
            subtitle="Reusing precomputed KV states slashes input costs up to 90% — stretching the gap to 50×."
            tone="emerald"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1.45fr 0.9fr", gap: 32, alignItems: "stretch" }}>
            <Card padding={34} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Cached prefix block */}
              <div
                style={{
                  padding: "24px 26px",
                  borderRadius: 18,
                  backgroundColor:
                    frame >= reuseCue ? TONE_STYLES.emerald.bg : TONE_STYLES.cyan.bg,
                  border: `2px solid ${
                    frame >= reuseCue ? TOKENS.colors.accentEmerald : TOKENS.colors.accent
                  }`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
                    System Prompt + Tools + Codebase Docs
                  </div>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 18,
                      color: TOKENS.colors.textSecondary,
                    }}
                  >
                    Repeated across requests → Prefill skipped
                  </div>
                </div>
                <Pill tone={frame >= reuseCue ? "emerald" : "cyan"} size="md">
                  {frame >= reuseCue ? "CACHED KV (-90%)" : "INPUT PREFIX"}
                </Pill>
              </div>

              {/* New user prompt */}
              <div
                style={{
                  padding: "20px 26px",
                  borderRadius: 18,
                  backgroundColor: TONE_STYLES.cyan.bg,
                  border: `1.5px solid ${TONE_STYLES.cyan.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 26, fontWeight: 700 }}>New User Message</span>
                <Pill tone="cyan" size="sm">
                  REGULAR PREFILL
                </Pill>
              </div>

              {/* Output tokens */}
              <div
                style={{
                  padding: "24px 26px",
                  borderRadius: 18,
                  backgroundColor: TONE_STYLES.amber.bg,
                  border: `2px solid ${
                    frame >= outputCue ? TOKENS.colors.accentWarm : TONE_STYLES.amber.border
                  }`,
                  boxShadow:
                    frame >= outputCue ? `0 0 28px ${TOKENS.colors.accentWarmGlow}` : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
                    Generated Output Tokens
                  </div>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 18,
                      color: TOKENS.colors.accentWarm,
                    }}
                  >
                    Unique per call → Always freshly decoded
                  </div>
                </div>
                <Pill tone="rose" size="md">
                  0% CACHEABLE
                </Pill>
              </div>
            </Card>

            {/* Giant multiplier card */}
            <Card
              tone="amber"
              glow
              padding={36}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Pill tone="amber" size="md" style={{ marginBottom: 22 }}>
                OUTPUT VS. CACHED INPUT
              </Pill>
              <div
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 132,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: TOKENS.colors.accentWarm,
                }}
              >
                {ratioVal}×
              </div>
              <div
                style={{
                  marginTop: 22,
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 22,
                  color: TOKENS.colors.textSecondary,
                }}
              >
                $15.00 vs. $0.30 / 1M tokens
              </div>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 2 (P16): Reasoning / Thinking Models */}
      {w16.visible ? (
        <AbsoluteFill
          style={{
            opacity: w16.opacity,
            transform: `translateY(${w16.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Trend #2 — Reasoning Models"
            title="Hidden Thinking Tokens Are Still Output Tokens"
            subtitle="A two-sentence visible reply can hide thousands of autoregressive decode steps."
            tone="amber"
          />

          <Card padding={34} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Short User Prompt */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 22px",
                borderRadius: 14,
                backgroundColor: TONE_STYLES.cyan.bg,
                border: `1.5px solid ${TONE_STYLES.cyan.border}`,
              }}
            >
              <span style={{ fontSize: 26, fontWeight: 700 }}>
                User: &quot;Why did my production build fail?&quot;
              </span>
              <Pill tone="cyan" size="sm">
                9 INPUT TOKENS
              </Pill>
            </div>

            {/* X-Ray Hidden Thinking Drawer */}
            <div
              style={{
                overflow: "hidden",
                maxHeight: interpolate(drawerProgress, [0, 1], [0, 310]),
                opacity: drawerProgress,
              }}
            >
              <div
                style={{
                  padding: "22px 26px",
                  borderRadius: 18,
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  border: `2px dashed ${TOKENS.colors.accentWarm}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <Pill tone="amber" size="md">
                    &lt;thinking&gt; HIDDEN DECODE TRACE
                  </Pill>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span
                      style={{
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 28,
                        fontWeight: 800,
                        color: TOKENS.colors.accentWarm,
                      }}
                    >
                      {thinkingTokens.toLocaleString()} tokens
                    </span>
                    <Pill
                      tone="rose"
                      size="sm"
                      style={{ opacity: fadeIn(frame, billedCue - 20, 12) }}
                    >
                      BILLED AT OUTPUT RATE
                    </Pill>
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 19,
                    lineHeight: 1.6,
                    color: TOKENS.colors.textSecondary,
                  }}
                >
                  {THINKING_LINES.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tiny Visible Reply */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 22px",
                borderRadius: 14,
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: `1.5px solid ${TOKENS.colors.borderStrong}`,
              }}
            >
              <span style={{ fontSize: 25, color: TOKENS.colors.textPrimary }}>
                Assistant: &quot;Line 142 expects a non-null payload. Add a guard before
                destructuring.&quot;
              </span>
              <Pill tone="neutral" size="sm">
                18 VISIBLE TOKENS
              </Pill>
            </div>
          </Card>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 3 (P17): Agentic Coding Invoice Inversion */}
      {w17.visible ? (
        <AbsoluteFill
          style={{
            opacity: w17.opacity,
            transform: `translateY(${w17.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Real-World Coding Agent Call"
            title="7% of Your Tokens Drive 75% of Your Bill"
            subtitle="40,000 cached input tokens vs. 3,000 reasoning + output tokens."
            tone="rose"
          />

          <Card padding={42} style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {/* Bar 1: Token Volume */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 800 }}>1. TOKEN VOLUME</span>
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 22,
                    color: TOKENS.colors.textSecondary,
                  }}
                >
                  43,000 total tokens
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 82,
                  borderRadius: 16,
                  overflow: "hidden",
                  display: "flex",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${TOKENS.colors.border}`,
                }}
              >
                <div
                  style={{
                    width: `${93 * volFill}%`,
                    backgroundColor: "rgba(52, 211, 153, 0.28)",
                    borderRight: `2px solid ${TOKENS.colors.accentEmerald}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 24,
                    fontWeight: 800,
                    color: TOKENS.colors.accentEmerald,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  93% CACHED INPUT (40k)
                </div>
                <div
                  style={{
                    width: `${7 * volFill}%`,
                    backgroundColor: TOKENS.colors.accentWarm,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 18,
                    fontWeight: 900,
                    color: TOKENS.colors.background,
                  }}
                >
                  7%
                </div>
              </div>
            </div>

            {/* Bar 2: Actual Dollar Cost */}
            <div style={slideUpStyle(frame, fps, billCue - 80, 20)}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 800 }}>2. ACTUAL DOLLAR BILL</span>
                <Pill tone="rose" size="md">
                  OUTPUT DOMINATES COST
                </Pill>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 82,
                  borderRadius: 16,
                  overflow: "hidden",
                  display: "flex",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: `2px solid ${TOKENS.colors.accentWarm}`,
                  boxShadow: `0 0 32px ${TOKENS.colors.accentWarmGlow}`,
                }}
              >
                <div
                  style={{
                    width: `${25 * billFill}%`,
                    backgroundColor: "rgba(52, 211, 153, 0.22)",
                    borderRight: `2px solid ${TOKENS.colors.accentEmerald}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 22,
                    fontWeight: 800,
                    color: TOKENS.colors.accentEmerald,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  25% INPUT ($0.015)
                </div>
                <div
                  style={{
                    width: `${75 * billFill}%`,
                    background: `linear-gradient(90deg, ${TOKENS.colors.accentWarm}, #FB7185)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 28,
                    fontWeight: 900,
                    color: TOKENS.colors.background,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  75% REASONING + OUTPUT ($0.045)
                </div>
              </div>
            </div>
          </Card>
        </AbsoluteFill>
      ) : null}
    </Stage>
  );
};
