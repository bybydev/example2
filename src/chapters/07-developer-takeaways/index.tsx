import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import {
  clipRange,
  cueFrame,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import { Card, Pill, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const HABITS = [
  {
    num: "01",
    title: "Keep outputs tight",
    detail: "Prefer unified diffs, compact JSON schemas, and explicit stop sequences.",
  },
  {
    num: "02",
    title: "Keep prefixes static",
    detail: "Pin system prompt, tools, and docs at byte 0 to protect KV cache hits.",
  },
  {
    num: "03",
    title: "Route easy work to smaller models",
    detail: "Save heavy reasoning budgets for genuinely hard multi-step problems.",
  },
];

export const DeveloperTakeawaysChapter: React.FC<ChapterComponentProps> = ({
  chapter,
  clips,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p21 = clipRange(clips[0], chapter.startFrame, 0, 517);
  const p22 = clipRange(clips[1], chapter.startFrame, p21.end, 503);
  const p23 = clipRange(clips[2], chapter.startFrame, p22.end, 464);

  // Beat 1 (P21) cues
  const diffCue = cueFrame(clips[0], "diff", 330, chapter.startFrame);

  // Beat 2 (P22) cues
  const timestampCue = cueFrame(clips[1], "timestamp", 230, chapter.startFrame);
  const routeCue = cueFrame(clips[1], "route", 360, chapter.startFrame);

  // Beat 3 (P23) cues
  const tightCue = cueFrame(clips[2], "tight", 70, chapter.startFrame);
  const staticCue = cueFrame(clips[2], "static", 130, chapter.startFrame);
  const smallerCue = cueFrame(clips[2], "smaller", 210, chapter.startFrame);
  const slashCue = cueFrame(clips[2], "slash", 310, chapter.startFrame);

  const w21 = sceneWindow(frame, p21.start, p21.end);
  const w22 = sceneWindow(frame, p22.start, p22.end);
  const w23 = sceneWindow(frame, p23.start, p23.end, { keepAtEnd: true });

  const cacheFixed = frame >= timestampCue + 45;

  return (
    <Stage chapterIndex="07" chapterTitle={chapter.title} tone="emerald">
      {/* BEAT 1 (P21): Shift Work From Output to Input */}
      {w21.visible ? (
        <AbsoluteFill
          style={{
            opacity: w21.opacity,
            transform: `translateY(${w21.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Habit #1 — Design for Inference Physics"
            title="Shift Work From Output to Input"
            subtitle="Input is cheap and cacheable. Output is slow and expensive — keep responses minimal."
            tone="emerald"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {/* Expensive Pattern */}
            <Card tone="rose" padding={34}>
              <Pill tone="rose" size="md" style={{ marginBottom: 18 }}>
                ✗ EXPENSIVE PATTERN
              </Pill>
              <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 16 }}>
                &quot;Rewrite the entire 400-line file with the fix.&quot;
              </div>

              <div
                style={{
                  padding: 20,
                  borderRadius: 14,
                  backgroundColor: TOKENS.colors.surfaceMuted,
                  border: `1px solid ${TOKENS.colors.border}`,
                  marginBottom: 24,
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 18,
                  color: TOKENS.colors.textSecondary,
                }}
              >
                <div style={{ marginBottom: 10 }}>OUTPUT DECODE LENGTH</div>
                <div
                  style={{
                    height: 36,
                    width: "100%",
                    borderRadius: 8,
                    backgroundColor: TOKENS.colors.accentWarm,
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 14,
                    color: TOKENS.colors.background,
                    fontWeight: 900,
                  }}
                >
                  ~4,500 OUTPUT TOKENS (SLOW + $$$)
                </div>
              </div>

              <div style={{ fontSize: 22, color: TOKENS.colors.textSecondary }}>
                Forces thousands of memory-bound decode steps just to copy unchanged code.
              </div>
            </Card>

            {/* Inference-Aware Pattern */}
            <div style={slideUpStyle(frame, fps, diffCue - 30, 24)}>
              <Card tone="emerald" glow padding={34}>
                <Pill tone="emerald" size="md" style={{ marginBottom: 18 }}>
                  ✓ INFERENCE-AWARE PATTERN
                </Pill>
                <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 16 }}>
                  &quot;Return a 12-line unified diff for the fix.&quot;
                </div>

                <div
                  style={{
                    padding: 20,
                    borderRadius: 14,
                    backgroundColor: TOKENS.colors.surfaceMuted,
                    border: `1px solid ${TONE_STYLES.emerald.border}`,
                    marginBottom: 24,
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 18,
                    color: TOKENS.colors.textSecondary,
                  }}
                >
                  <div style={{ marginBottom: 10 }}>OUTPUT DECODE LENGTH</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        height: 36,
                        width: "12%",
                        borderRadius: 8,
                        backgroundColor: TOKENS.colors.accentEmerald,
                      }}
                    />
                    <span style={{ color: TOKENS.colors.accentEmerald, fontWeight: 800 }}>
                      ~180 TOKENS (96% LESS OUTPUT!)
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 22, color: TOKENS.colors.textSecondary }}>
                  Reuses cached input file, emits only the delta — massively faster and cheaper.
                </div>
              </Card>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 2 (P22): Protect Cache Prefix & Route Models */}
      {w22.visible ? (
        <AbsoluteFill
          style={{
            opacity: w22.opacity,
            transform: `translateY(${w22.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Habits #2 & #3"
            title="Protect Your Cache Prefix & Route Intentionally"
            tone="emerald"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 32 }}>
            {/* Prompt Prefix Stack */}
            <Card tone={cacheFixed ? "emerald" : "rose"} glow padding={32}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 22,
                }}
              >
                <span style={{ fontSize: 28, fontWeight: 800 }}>Prompt Layout Order</span>
                <Pill tone={cacheFixed ? "emerald" : "rose"} size="md">
                  {cacheFixed ? "✓ CACHE HIT (-90%)" : "✗ CACHE BUSTED"}
                </Pill>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: TOKENS.fonts.mono }}>
                {!cacheFixed ? (
                  <div
                    style={{
                      padding: "16px 20px",
                      borderRadius: 12,
                      backgroundColor: TONE_STYLES.rose.bg,
                      border: `2px solid ${TOKENS.colors.accentRose}`,
                      fontSize: 20,
                      fontWeight: 800,
                      color: TOKENS.colors.accentRose,
                    }}
                  >
                    Byte 0: timestamp=&quot;2026-11-25T09:04:12Z&quot; ← BUSTS CACHE!
                  </div>
                ) : null}

                <div
                  style={{
                    padding: "18px 20px",
                    borderRadius: 12,
                    backgroundColor: cacheFixed ? TONE_STYLES.emerald.bg : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${
                      cacheFixed ? TOKENS.colors.accentEmerald : TOKENS.colors.border
                    }`,
                    fontSize: 20,
                    color: cacheFixed ? TOKENS.colors.accentEmerald : TOKENS.colors.textSecondary,
                    fontWeight: 700,
                  }}
                >
                  1. Static System Prompt + Tool Schemas
                </div>

                <div
                  style={{
                    padding: "18px 20px",
                    borderRadius: 12,
                    backgroundColor: cacheFixed ? TONE_STYLES.emerald.bg : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${
                      cacheFixed ? TOKENS.colors.accentEmerald : TOKENS.colors.border
                    }`,
                    fontSize: 20,
                    color: cacheFixed ? TOKENS.colors.accentEmerald : TOKENS.colors.textSecondary,
                    fontWeight: 700,
                  }}
                >
                  2. Stable Reference Docs &amp; Codebase Context
                </div>

                {cacheFixed ? (
                  <div
                    style={{
                      padding: "16px 20px",
                      borderRadius: 12,
                      backgroundColor: TONE_STYLES.cyan.bg,
                      border: `1.5px solid ${TONE_STYLES.cyan.border}`,
                      fontSize: 20,
                      fontWeight: 700,
                      color: TOKENS.colors.accent,
                    }}
                  >
                    3. Dynamic Timestamp + Latest User Message (AT BOTTOM ✓)
                  </div>
                ) : null}
              </div>
            </Card>

            {/* Model Routing Card */}
            <div style={slideUpStyle(frame, fps, routeCue - 20, 24)}>
              <Card tone="cyan" glow padding={32} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <Pill tone="cyan" size="md" style={{ marginBottom: 16 }}>
                    SMART MODEL ROUTING
                  </Pill>
                  <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 20 }}>
                    Match Model Size to Task Difficulty
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div
                    style={{
                      padding: "20px 22px",
                      borderRadius: 14,
                      backgroundColor: TONE_STYLES.emerald.bg,
                      border: `1.5px solid ${TONE_STYLES.emerald.border}`,
                    }}
                  >
                    <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: 18, fontWeight: 800, color: TOKENS.colors.accentEmerald }}>
                      FAST / SMALL MODEL ($)
                    </div>
                    <div style={{ fontSize: 21, marginTop: 6, color: TOKENS.colors.textPrimary }}>
                      Summaries, formatting, verbose boilerplate, extraction
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "20px 22px",
                      borderRadius: 14,
                      backgroundColor: TONE_STYLES.amber.bg,
                      border: `1.5px solid ${TONE_STYLES.amber.border}`,
                    }}
                  >
                    <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: 18, fontWeight: 800, color: TOKENS.colors.accentWarm }}>
                      FRONTIER REASONING MODEL ($$$)
                    </div>
                    <div style={{ fontSize: 21, marginTop: 6, color: TOKENS.colors.textPrimary }}>
                      Complex debugging, architecture &amp; hard planning steps
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 3 (P23): Production Impact Scorecard */}
      {w23.visible ? (
        <AbsoluteFill
          style={{
            opacity: w23.opacity,
            transform: `translateY(${w23.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Production Impact"
            title="Three Habits That Cut LLM Spend Immediately"
            tone="emerald"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr", gap: 32, alignItems: "stretch" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {HABITS.map((habit, idx) => {
                const startCue = idx === 0 ? tightCue - 20 : idx === 1 ? staticCue - 20 : smallerCue - 20;
                return (
                  <div key={habit.num} style={slideUpStyle(frame, fps, startCue, 22)}>
                    <Card tone="emerald" padding={24} style={{ display: "flex", alignItems: "center", gap: 22 }}>
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: 16,
                          backgroundColor: TONE_STYLES.emerald.bg,
                          border: `2px solid ${TOKENS.colors.accentEmerald}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 24,
                          fontWeight: 900,
                          color: TOKENS.colors.accentEmerald,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </div>
                      <div>
                        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                          {habit.title}
                        </div>
                        <div style={{ fontSize: 21, color: TOKENS.colors.textSecondary }}>
                          {habit.detail}
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                ...slideUpStyle(frame, fps, slashCue - 15, 26),
              }}
            >
              <Card
                tone="emerald"
                glow
                padding={32}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Pill tone="emerald" size="sm" style={{ marginBottom: 14 }}>
                  API SPEND REDUCTION
                </Pill>
                <div
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 72,
                    fontWeight: 900,
                    color: TOKENS.colors.accentEmerald,
                    lineHeight: 1,
                  }}
                >
                  50–80%
                </div>
                <div style={{ fontSize: 22, color: TOKENS.colors.textSecondary, marginTop: 12 }}>
                  Lower monthly inference bill
                </div>
              </Card>

              <Card
                tone="cyan"
                glow
                padding={32}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Pill tone="cyan" size="sm" style={{ marginBottom: 14 }}>
                  USER EXPERIENCE
                </Pill>
                <div
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 72,
                    fontWeight: 900,
                    color: TOKENS.colors.accent,
                    lineHeight: 1,
                  }}
                >
                  2×
                </div>
                <div style={{ fontSize: 22, color: TOKENS.colors.textSecondary, marginTop: 12 }}>
                  Faster perceived response time
                </div>
              </Card>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </Stage>
  );
};
