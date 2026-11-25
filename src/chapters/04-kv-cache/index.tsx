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
} from "../../ui/motion";
import { Card, Pill, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const KV_SLOTS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"];
const USER_LANES = [
  { user: "User A", prefillPct: 4, decodePct: 76, startPct: 2 },
  { user: "User B", prefillPct: 5, decodePct: 68, startPct: 12 },
  { user: "User C", prefillPct: 3, decodePct: 82, startPct: 8 },
  { user: "User D", prefillPct: 4, decodePct: 62, startPct: 22 },
];

export const KvCacheChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p11 = clipRange(clips[0], chapter.startFrame, 0, 533);
  const p12 = clipRange(clips[1], chapter.startFrame, p11.end, 517);
  const p13 = clipRange(clips[2], chapter.startFrame, p12.end, 537);
  const p14 = clipRange(clips[3], chapter.startFrame, p13.end, 522);

  // Beat 1 (P11) cues
  const recomputeCue = cueFrame(clips[0], "recompute", 170, chapter.startFrame);
  const kvCue = cueFrame(clips[0], "KV", 370, chapter.startFrame);

  // Beat 2 (P12) cues
  const growsCue = cueFrame(clips[1], "grows", 160, chapter.startFrame);
  const bandwidthCue = cueFrame(clips[1], "bandwidth", 340, chapter.startFrame);

  // Beat 3 (P13) cues
  const batchCue = cueFrame(clips[2], "batch", 50, chapter.startFrame);
  const limitCue = cueFrame(clips[2], "limit", 240, chapter.startFrame);
  const latencyCue = cueFrame(clips[2], "latency", 340, chapter.startFrame);

  // Beat 4 (P14) cues
  const msCue = cueFrame(clips[3], "milliseconds", 110, chapter.startFrame);
  const secCue = cueFrame(clips[3], "seconds", 220, chapter.startFrame);
  const gpuSecCue = cueFrame(clips[3], "GPU", 380, chapter.startFrame, 1);

  const w11 = sceneWindow(frame, p11.start, p11.end);
  const w12 = sceneWindow(frame, p12.start, p12.end);
  const w13 = sceneWindow(frame, p13.start, p13.end);
  const w14 = sceneWindow(frame, p14.start, p14.end, { keepAtEnd: true });

  // Beat 2 growing KV bar
  const kvGrowth = progressBetween(frame, growsCue - 30, p12.end - 45);
  const kvWidthPct = 10 + kvGrowth * 44; // grows from 10% to 54% of VRAM
  const generatedTokenCount = Math.round(128 + kvGrowth * 3968);

  // Beat 3 filling VRAM user slots
  const vramFillProgress = progressBetween(frame, batchCue + 20, limitCue + 10);
  const filledUserCount = Math.min(24, Math.floor(vramFillProgress * 24));
  const latencyProgress = progressBetween(frame, latencyCue - 20, p13.end - 40);

  // Beat 4 Gantt occupancy stretch
  const prefillReveal = progressBetween(frame, msCue - 20, msCue + 25);
  const decodeStretch = progressBetween(frame, secCue - 25, secCue + 75);

  return (
    <Stage chapterIndex="04" chapterTitle={chapter.title} tone="amber">
      {/* BEAT 1 (P11): Why the KV Cache Exists */}
      {w11.visible ? (
        <AbsoluteFill
          style={{
            opacity: w11.opacity,
            transform: `translateY(${w11.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <SectionTitle
            eyebrow="Attention Needs Memory"
            title="Why Servers Build a KV Cache in VRAM"
            subtitle="Every new token attends to all earlier tokens — saving Key & Value vectors avoids O(N²) recompute."
            tone="cyan"
            style={{ marginBottom: 8 }}
          />

          {/* Attention web SVG */}
          <Card padding={28}>
            <svg width="100%" height="180" viewBox="0 0 1540 180">
              {KV_SLOTS.map((slot, idx) => {
                const x = 110 + idx * 165;
                const isLast = idx === KV_SLOTS.length - 1;
                return (
                  <g key={slot}>
                    {!isLast ? (
                      <path
                        d={`M 1265 110 Q ${(1265 + x) / 2} ${15 + idx * 8}, ${x} 110`}
                        fill="none"
                        stroke={TOKENS.colors.accent}
                        strokeWidth="2.5"
                        opacity="0.6"
                      />
                    ) : null}
                    <rect
                      x={x - 52}
                      y="110"
                      width="104"
                      height="52"
                      rx="12"
                      fill={isLast ? TONE_STYLES.amber.bg : TONE_STYLES.cyan.bg}
                      stroke={isLast ? TOKENS.colors.accentWarm : TOKENS.colors.accent}
                      strokeWidth="2.5"
                    />
                    <text
                      x={x}
                      y="143"
                      textAnchor="middle"
                      fill={isLast ? TOKENS.colors.accentWarm : TOKENS.colors.textPrimary}
                      fontFamily={TOKENS.fonts.mono}
                      fontSize="22"
                      fontWeight="800"
                    >
                      {isLast ? "NEW" : slot}
                    </text>
                  </g>
                );
              })}
            </svg>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            {/* Recompute crossed out */}
            <Card
              tone="rose"
              padding={30}
              style={{
                opacity: fadeIn(frame, recomputeCue - 20, 14),
                position: "relative",
              }}
            >
              <Pill tone="rose" size="sm" style={{ marginBottom: 14 }}>
                WITHOUT CACHE — O(N²) COLLAPSE
              </Pill>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  textDecoration: frame >= kvCue ? "line-through" : "none",
                  color: frame >= kvCue ? TOKENS.colors.textMuted : TOKENS.colors.textPrimary,
                }}
              >
                Recompute every past token from scratch at every step
              </div>
            </Card>

            {/* KV Cache Shelf */}
            <div style={slideUpStyle(frame, fps, kvCue - 10, 22)}>
              <Card tone="emerald" glow padding={30}>
                <Pill tone="emerald" size="sm" style={{ marginBottom: 14 }}>
                  SOLUTION — KV CACHE IN VRAM
                </Pill>
                <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
                  Save each past token&apos;s Key &amp; Value vectors once:
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {KV_SLOTS.slice(0, 6).map((slot) => (
                    <div
                      key={slot}
                      style={{
                        flex: 1,
                        padding: "10px 6px",
                        borderRadius: 10,
                        backgroundColor: TONE_STYLES.emerald.bg,
                        border: `1.5px solid ${TONE_STYLES.emerald.border}`,
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 16,
                        fontWeight: 800,
                        color: TOKENS.colors.accentEmerald,
                        textAlign: "center",
                      }}
                    >
                      K|V
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 2 (P12): Growing VRAM & Bandwidth Tax */}
      {w12.visible ? (
        <AbsoluteFill
          style={{
            opacity: w12.opacity,
            transform: `translateY(${w12.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 28,
          }}
        >
          <SectionTitle
            eyebrow="The Second Memory Tax"
            title="The KV Cache Grows With Every Generated Token"
            subtitle="It eats VRAM capacity AND adds even more bytes to stream across HBM on every single step."
            tone="amber"
            style={{ marginBottom: 4 }}
          />

          {/* 80 GB VRAM Bar */}
          <Card padding={36}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <span style={{ fontSize: 26, fontWeight: 800 }}>GPU VRAM (80 GB HBM3)</span>
              <Pill tone="amber" size="md">
                GENERATED: {generatedTokenCount.toLocaleString()} TOKENS
              </Pill>
            </div>

            <div
              style={{
                width: "100%",
                height: 84,
                borderRadius: 16,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: `1.5px solid ${TOKENS.colors.borderStrong}`,
                display: "flex",
                overflow: "hidden",
                padding: 8,
                gap: 8,
              }}
            >
              <div
                style={{
                  width: "38%",
                  borderRadius: 10,
                  backgroundColor: "rgba(56, 189, 248, 0.2)",
                  border: `1.5px solid ${TOKENS.colors.accent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 22,
                  fontWeight: 800,
                  color: TOKENS.colors.accent,
                }}
              >
                MODEL WEIGHTS (FIXED)
              </div>

              <div
                style={{
                  width: `${kvWidthPct}%`,
                  borderRadius: 10,
                  backgroundColor: "rgba(245, 158, 11, 0.25)",
                  border: `2px solid ${TOKENS.colors.accentWarm}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 22,
                  fontWeight: 800,
                  color: TOKENS.colors.accentWarm,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                KV CACHE (GROWING →)
              </div>
            </div>
          </Card>

          {/* Dual Bandwidth Pipe Callout */}
          <div style={slideUpStyle(frame, fps, bandwidthCue - 25, 22)}>
            <Card tone="rose" glow padding={32}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr auto 1.2fr",
                  alignItems: "center",
                  gap: 20,
                  fontFamily: TOKENS.fonts.mono,
                }}
              >
                <div
                  style={{
                    padding: "18px 20px",
                    borderRadius: 14,
                    backgroundColor: TONE_STYLES.cyan.bg,
                    border: `1.5px solid ${TONE_STYLES.cyan.border}`,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 800,
                    color: TOKENS.colors.accent,
                  }}
                >
                  Model Weights
                </div>
                <span style={{ fontSize: 36, fontWeight: 800 }}>+</span>
                <div
                  style={{
                    padding: "18px 20px",
                    borderRadius: 14,
                    backgroundColor: TONE_STYLES.amber.bg,
                    border: `1.5px solid ${TONE_STYLES.amber.border}`,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 800,
                    color: TOKENS.colors.accentWarm,
                  }}
                >
                  Growing KV Cache
                </div>
                <span style={{ fontSize: 36, color: TOKENS.colors.accentRose }}>──▶</span>
                <div
                  style={{
                    padding: "18px 22px",
                    borderRadius: 14,
                    backgroundColor: TONE_STYLES.rose.bg,
                    border: `2px solid ${TOKENS.colors.accentRose}`,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 800,
                    color: TOKENS.colors.accentRose,
                  }}
                >
                  SAME HBM BUS (EVERY STEP)
                </div>
              </div>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 3 (P13): Why Batching Can't Fully Save You */}
      {w13.visible ? (
        <AbsoluteFill
          style={{
            opacity: w13.opacity,
            transform: `translateY(${w13.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="The Batching Dilemma"
            title="Continuous Batching Hits Two Hard Walls"
            subtitle="Sharing one weight load across 100 users helps — until VRAM fills up and streaming slows down."
            tone="rose"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {/* Wall 1: VRAM OOM Ceiling */}
            <Card tone="rose" glow={frame >= limitCue} padding={34}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <span style={{ fontSize: 30, fontWeight: 800 }}>Wall 1: VRAM Limit</span>
                <Pill tone={filledUserCount >= 22 ? "rose" : "amber"} size="sm">
                  {filledUserCount >= 22 ? "VRAM FULL (OOM)" : `${filledUserCount * 4} USERS`}
                </Pill>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 10,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: TOKENS.colors.surfaceMuted,
                  border: `2px solid ${
                    filledUserCount >= 22 ? TOKENS.colors.accentRose : TOKENS.colors.border
                  }`,
                  marginBottom: 18,
                }}
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const filled = i < filledUserCount;
                  return (
                    <div
                      key={i}
                      style={{
                        height: 44,
                        borderRadius: 8,
                        backgroundColor: filled
                          ? i >= 20
                            ? TOKENS.colors.accentRose
                            : TOKENS.colors.accentWarm
                          : "rgba(255,255,255,0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 13,
                        fontWeight: 800,
                        color: filled ? TOKENS.colors.background : TOKENS.colors.textMuted,
                      }}
                    >
                      KV
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: 22, color: TOKENS.colors.textSecondary }}>
                Every concurrent user needs their own KV cache in VRAM — capping max batch size.
              </div>
            </Card>

            {/* Wall 2: Throughput vs Latency Curve */}
            <Card tone="amber" glow={frame >= latencyCue} padding={34}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 30, fontWeight: 800 }}>Wall 2: Streaming Latency</span>
                <Pill tone="amber" size="sm">
                  TPOT ↑ SLOWER
                </Pill>
              </div>

              <svg width="100%" height="220" viewBox="0 0 600 220">
                {/* Axes */}
                <line x1="56" y1="184" x2="560" y2="184" stroke={TOKENS.colors.textMuted} strokeWidth="2" />
                <line x1="56" y1="24" x2="56" y2="184" stroke={TOKENS.colors.textMuted} strokeWidth="2" />

                {/* Throughput curve (emerald) */}
                <path
                  d="M 60 165 Q 240 60, 540 42"
                  fill="none"
                  stroke={TOKENS.colors.accentEmerald}
                  strokeWidth="4.5"
                />
                <text
                  x="390"
                  y="38"
                  fill={TOKENS.colors.accentEmerald}
                  fontFamily={TOKENS.fonts.mono}
                  fontSize="17"
                  fontWeight="700"
                >
                  GPU Throughput ↑
                </text>

                {/* Latency curve (rose) */}
                <path
                  d="M 60 155 Q 320 148, 540 52"
                  fill="none"
                  stroke={TOKENS.colors.accentRose}
                  strokeWidth="4.5"
                />
                <text
                  x="395"
                  y="112"
                  fill={TOKENS.colors.accentRose}
                  fontFamily={TOKENS.fonts.mono}
                  fontSize="17"
                  fontWeight="700"
                >
                  User Latency ↑
                </text>

                {/* Moving batch marker */}
                <circle
                  cx={interpolate(latencyProgress, [0, 1], [120, 500])}
                  cy={interpolate(latencyProgress, [0, 1], [152, 68])}
                  r="10"
                  fill={TOKENS.colors.accentWarm}
                />

                <text
                  x="310"
                  y="212"
                  textAnchor="middle"
                  fill={TOKENS.colors.textSecondary}
                  fontFamily={TOKENS.fonts.mono}
                  fontSize="16"
                >
                  BATCH SIZE (CONCURRENT USERS) →
                </text>
              </svg>

              <div style={{ fontSize: 22, color: TOKENS.colors.textSecondary, marginTop: 8 }}>
                Higher batch size increases Time-Per-Output-Token, making chat feel sluggish.
              </div>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 4 (P14): Providers Sell GPU-Seconds, Not Tokens */}
      {w14.visible ? (
        <AbsoluteFill
          style={{
            opacity: w14.opacity,
            transform: `translateY(${w14.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <SectionTitle
            eyebrow="The Economic Punchline"
            title="Prefill Takes Milliseconds. Decode Holds a Slot for Seconds."
            tone="amber"
            style={{ marginBottom: 6 }}
          />

          <Card padding={36}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: TOKENS.fonts.mono,
                fontSize: 17,
                color: TOKENS.colors.textMuted,
                marginBottom: 16,
                paddingLeft: 130,
              }}
            >
              <span>0s</span>
              <span>3s</span>
              <span>6s</span>
              <span>9s</span>
              <span>12s</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {USER_LANES.map((lane) => (
                <div
                  key={lane.user}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <span
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 20,
                      fontWeight: 700,
                      color: TOKENS.colors.textSecondary,
                    }}
                  >
                    {lane.user}
                  </span>
                  <div
                    style={{
                      height: 50,
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: `1px solid ${TOKENS.colors.border}`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Tiny cyan prefill sliver */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${lane.startPct}%`,
                        top: 6,
                        bottom: 6,
                        width: `${lane.prefillPct * prefillReveal}%`,
                        borderRadius: 6,
                        backgroundColor: TOKENS.colors.accent,
                      }}
                    />
                    {/* Long amber decode reservation */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${lane.startPct + lane.prefillPct + 0.5}%`,
                        top: 6,
                        bottom: 6,
                        width: `${lane.decodePct * decodeStretch}%`,
                        borderRadius: 6,
                        backgroundColor: "rgba(245, 158, 11, 0.26)",
                        border: `1.5px solid ${TOKENS.colors.accentWarm}`,
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 14,
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 16,
                        fontWeight: 700,
                        color: TOKENS.colors.accentWarm,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      VRAM SLOT OCCUPIED (DECODING...)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ textAlign: "center", ...slideUpStyle(frame, fps, gpuSecCue - 15, 24) }}>
            <Card
              tone="amber"
              glow
              padding={24}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 20,
              }}
            >
              <Pill tone="amber" size="lg">
                COST ∝ GPU-SECONDS
              </Pill>
              <span style={{ fontSize: 30, fontWeight: 800 }}>
                AI providers don&apos;t sell tokens — they rent GPU-seconds.
              </span>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}
    </Stage>
  );
};
