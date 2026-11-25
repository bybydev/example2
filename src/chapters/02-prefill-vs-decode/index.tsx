import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import {
  clipRange,
  cueFrame,
  fadeIn,
  progressBetween,
  sceneWindow,
  springAt,
} from "../../ui/motion";
import { Card, Pill, SectionTitle, TokenChip } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const PROMPT_TOKENS = ["Explain", "why", "GPU", "memory", "makes", "output", "tokens", "costly"];
const LAYERS = ["Layer 1", "Layer 2", "Layer 3", "... Layer 80"];
const DECODE_WORDS = ["Because", "each", "new", "token", "must", "wait"];

export const PrefillVsDecodeChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p4 = clipRange(clips[0], chapter.startFrame, 0, 438);
  const p5 = clipRange(clips[1], chapter.startFrame, p4.end, 416);
  const p6 = clipRange(clips[2], chapter.startFrame, p5.end, 488);

  // Beat 1 (P4) cues
  const prefillCue = cueFrame(clips[0], "prefill", 85, chapter.startFrame);
  const firstCue = cueFrame(clips[0], "first", 170, chapter.startFrame, 1);
  const decodeCue = cueFrame(clips[0], "decode", 270, chapter.startFrame);

  // Beat 2 (P5) cues
  const onceCue = cueFrame(clips[1], "once", 240, chapter.startFrame);
  const parallelCue = cueFrame(clips[1], "parallel", 290, chapter.startFrame);

  // Beat 3 (P6) cues
  const oneCue = cueFrame(clips[2], "one", 130, chapter.startFrame);
  const dependsCue = cueFrame(clips[2], "depends", 210, chapter.startFrame);
  const ninetyCue = cueFrame(clips[2], "ninety", 310, chapter.startFrame);

  const w4 = sceneWindow(frame, p4.start, p4.end);
  const w5 = sceneWindow(frame, p5.start, p5.end);
  const w6 = sceneWindow(frame, p6.start, p6.end, { keepAtEnd: true });

  // Beat 1 timeline animation
  const prefillFill = progressBetween(frame, prefillCue, prefillCue + 24);
  const ttftScale = springAt(frame, fps, firstCue, { damping: 14, stiffness: 160 });
  const totalDecodeTicks = 18;
  const activeDecodeTicks = Math.floor(
    progressBetween(frame, decodeCue, p4.end - 25) * totalDecodeTicks
  );

  // Beat 2 wave sweeping through transformer layers
  const waveProgress = progressBetween(frame, Math.min(onceCue, parallelCue) - 35, p5.end - 35);
  const activeLayerIndex = Math.floor(waveProgress * (LAYERS.length + 1)) - 1;

  // Beat 3 autoregressive step counter
  const decodeStepsProgress = progressBetween(frame, oneCue, p6.end - 30);
  const generatedCount = Math.min(
    DECODE_WORDS.length,
    1 + Math.floor(decodeStepsProgress * (DECODE_WORDS.length - 1))
  );
  const loopDashOffset = -(frame * 3) % 60;

  return (
    <Stage chapterIndex="02" chapterTitle={chapter.title} tone="cyan">
      {/* BEAT 1 (P4): Request Lifecycle Timeline */}
      {w4.visible ? (
        <AbsoluteFill
          style={{
            opacity: w4.opacity,
            transform: `translateY(${w4.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Anatomy of One API Call"
            title="Every LLM Request Splits Into Two Phases"
            subtitle="Prefill runs once in milliseconds; Decode repeats sequentially for seconds."
            tone="cyan"
          />

          <Card padding={44}>
            {/* Top phase labels */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "22% 78%",
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Pill tone="cyan" size="md">
                  1. PREFILL
                </Pill>
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 20,
                    color: TOKENS.colors.textSecondary,
                  }}
                >
                  ~50 ms
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Pill tone="amber" size="md">
                  2. DECODE
                </Pill>
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 20,
                    color: TOKENS.colors.textSecondary,
                  }}
                >
                  Token-by-Token Streaming (5–20+ sec)
                </span>
              </div>
            </div>

            {/* Main horizontal timeline bar */}
            <div style={{ position: "relative", paddingTop: 12, paddingBottom: 76 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "22% 78%",
                  gap: 16,
                  height: 92,
                }}
              >
                {/* Prefill solid bar */}
                <div
                  style={{
                    borderRadius: 16,
                    backgroundColor: "rgba(56, 189, 248, 0.08)",
                    border: `1.5px solid ${TONE_STYLES.cyan.border}`,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: `${prefillFill * 100}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, rgba(56,189,248,0.85), ${TOKENS.colors.accent})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 22,
                      fontWeight: 800,
                      color: TOKENS.colors.background,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ALL INPUTS
                  </div>
                </div>

                {/* Decode discrete ticks */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${totalDecodeTicks}, 1fr)`,
                    gap: 8,
                    padding: 10,
                    borderRadius: 16,
                    backgroundColor: "rgba(245, 158, 11, 0.06)",
                    border: `1.5px solid ${TONE_STYLES.amber.border}`,
                  }}
                >
                  {Array.from({ length: totalDecodeTicks }).map((_, idx) => {
                    const active = idx < activeDecodeTicks;
                    const isLatest = idx === activeDecodeTicks - 1;
                    return (
                      <div
                        key={idx}
                        style={{
                          borderRadius: 8,
                          backgroundColor: active
                            ? isLatest
                              ? "#FBBF24"
                              : TOKENS.colors.accentWarm
                            : "rgba(255, 255, 255, 0.05)",
                          boxShadow: isLatest
                            ? `0 0 18px ${TOKENS.colors.accentWarmGlow}`
                            : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 15,
                          fontWeight: 800,
                          color: active ? TOKENS.colors.background : TOKENS.colors.textMuted,
                        }}
                      >
                        t{idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TTFT marker pin */}
              <div
                style={{
                  position: "absolute",
                  left: "22%",
                  top: 108,
                  transform: `translateX(-50%) scale(${ttftScale})`,
                  opacity: ttftScale,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 22,
                    backgroundColor: TOKENS.colors.accent,
                  }}
                />
                <Pill tone="cyan" size="sm">
                  ▲ TTFT (Time to First Token)
                </Pill>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
                paddingTop: 18,
                borderTop: `1px solid ${TOKENS.colors.border}`,
              }}
            >
              <div style={{ fontSize: 24, color: TOKENS.colors.textSecondary }}>
                <strong style={{ color: TOKENS.colors.accent }}>Prefill:</strong> Digests the
                entire prompt in one batch to emit token #1.
              </div>
              <div style={{ fontSize: 24, color: TOKENS.colors.textSecondary }}>
                <strong style={{ color: TOKENS.colors.accentWarm }}>Decode:</strong> Loops one
                new output token at a time until{" "}
                <code style={{ fontFamily: TOKENS.fonts.mono }}>&lt;EOS&gt;</code>.
              </div>
            </div>
          </Card>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 2 (P5): Prefill — All Prompt Tokens In Parallel */}
      {w5.visible ? (
        <AbsoluteFill
          style={{
            opacity: w5.opacity,
            transform: `translateY(${w5.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Phase 1 — Prefill"
            title="All Input Tokens Processed Simultaneously"
            subtitle="Everything is known upfront → packed into one [Seq × d] matrix for a single parallel pass."
            tone="cyan"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Prompt tokens row */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              {PROMPT_TOKENS.map((tok, idx) => (
                <TokenChip
                  key={tok}
                  label={tok}
                  sublabel={`pos ${idx}`}
                  tone="cyan"
                  style={{ flex: 1 }}
                />
              ))}
            </div>

            {/* Parallel vertical layer stack */}
            <Card tone="cyan" padding={28}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 22,
                    fontWeight: 700,
                    color: TOKENS.colors.accent,
                  }}
                >
                  SINGLE PARALLEL FORWARD PASS — MATRIX [8 × d]
                </span>
                <Pill tone="emerald" size="sm">
                  100% PARALLEL ACROSS SEQUENCE
                </Pill>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {LAYERS.map((layer, lIdx) => {
                  const isActive = lIdx <= activeLayerIndex;
                  const isFront = lIdx === activeLayerIndex;
                  return (
                    <div
                      key={layer}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "180px 1fr",
                        alignItems: "center",
                        gap: 20,
                        padding: "14px 20px",
                        borderRadius: 14,
                        backgroundColor: isFront
                          ? "rgba(56, 189, 248, 0.16)"
                          : isActive
                          ? "rgba(56, 189, 248, 0.08)"
                          : "rgba(255, 255, 255, 0.03)",
                        border: `1.5px solid ${
                          isFront
                            ? TOKENS.colors.accent
                            : isActive
                            ? TONE_STYLES.cyan.border
                            : TOKENS.colors.border
                        }`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 20,
                          fontWeight: 700,
                          color: isActive ? TOKENS.colors.accent : TOKENS.colors.textSecondary,
                        }}
                      >
                        {layer}
                      </span>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${PROMPT_TOKENS.length}, 1fr)`,
                          gap: 10,
                        }}
                      >
                        {PROMPT_TOKENS.map((t) => (
                          <div
                            key={t}
                            style={{
                              height: 30,
                              borderRadius: 8,
                              backgroundColor: isActive
                                ? TOKENS.colors.accent
                                : "rgba(255, 255, 255, 0.07)",
                              opacity: isFront ? 1 : isActive ? 0.65 : 0.4,
                              boxShadow: isFront
                                ? `0 0 14px ${TOKENS.colors.accentGlow}`
                                : "none",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 3 (P6): Decode — Strict Autoregressive Loop */}
      {w6.visible ? (
        <AbsoluteFill
          style={{
            opacity: w6.opacity,
            transform: `translateY(${w6.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Phase 2 — Decode"
            title="Autoregression Forces Strict Sequential Steps"
            subtitle="You cannot compute token #100 until token #99 finishes and feeds back in."
            tone="amber"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.35fr 1fr",
              gap: 36,
              alignItems: "center",
            }}
          >
            {/* Left: Sequential output stream with locks */}
            <Card tone="amber" glow padding={34}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <Pill tone="amber" size="md">
                  STEP {95 + generatedCount} OF 100
                </Pill>
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 19,
                    color: TOKENS.colors.textSecondary,
                  }}
                >
                  1 TOKEN PER PASS
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                  marginBottom: 28,
                }}
              >
                {DECODE_WORDS.map((word, idx) => {
                  const unlocked = idx < generatedCount;
                  const current = idx === generatedCount - 1;
                  return (
                    <div
                      key={word}
                      style={{
                        padding: "20px 18px",
                        borderRadius: 16,
                        backgroundColor: current
                          ? "rgba(245, 158, 11, 0.22)"
                          : unlocked
                          ? TONE_STYLES.amber.bg
                          : "rgba(255, 255, 255, 0.03)",
                        border: `1.5px solid ${
                          current
                            ? TOKENS.colors.accentWarm
                            : unlocked
                            ? TONE_STYLES.amber.border
                            : TOKENS.colors.border
                        }`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        opacity: unlocked ? 1 : 0.45,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 15,
                          color: unlocked
                            ? TOKENS.colors.accentWarm
                            : TOKENS.colors.textMuted,
                        }}
                      >
                        TOKEN #{96 + idx}
                      </span>
                      <span
                        style={{
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 26,
                          fontWeight: 800,
                          color: unlocked
                            ? TOKENS.colors.textPrimary
                            : TOKENS.colors.textMuted,
                        }}
                      >
                        {unlocked ? `"${word}"` : "LOCKED"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Dependency equation callout */}
              <div
                style={{
                  padding: "16px 22px",
                  borderRadius: 14,
                  backgroundColor: TOKENS.colors.surfaceMuted,
                  border: `1px solid ${TOKENS.colors.border}`,
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 22,
                  color: TOKENS.colors.textPrimary,
                  textAlign: "center",
                  opacity: fadeIn(frame, dependsCue, 14),
                }}
              >
                <span style={{ color: TOKENS.colors.accentWarm }}>token[100]</span> = Model(
                <span style={{ color: TOKENS.colors.accent }}>prompt</span>, token[1] …{" "}
                <span style={{ color: TOKENS.colors.accentRose }}>token[99]</span>)
              </div>
            </Card>

            {/* Right: Feedback Loop SVG */}
            <Card padding={28} style={{ display: "flex", justifyContent: "center" }}>
              <svg width="480" height="430" viewBox="0 0 480 430">
                {/* Output box */}
                <rect
                  x="90"
                  y="24"
                  width="260"
                  height="68"
                  rx="16"
                  fill={TONE_STYLES.amber.bg}
                  stroke={TOKENS.colors.accentWarm}
                  strokeWidth="2.5"
                />
                <text
                  x="220"
                  y="66"
                  textAnchor="middle"
                  fill={TOKENS.colors.accentWarm}
                  fontFamily={TOKENS.fonts.mono}
                  fontSize="24"
                  fontWeight="800"
                >
                  Emit Token #{95 + generatedCount}
                </text>

                {/* Arrow up into Output */}
                <line
                  x1="220"
                  y1="145"
                  x2="220"
                  y2="100"
                  stroke={TOKENS.colors.accentWarm}
                  strokeWidth="4"
                />
                <polygon points="220,92 210,110 230,110" fill={TOKENS.colors.accentWarm} />

                {/* Transformer stack */}
                <rect
                  x="70"
                  y="148"
                  width="300"
                  height="136"
                  rx="20"
                  fill={TOKENS.colors.surfaceElevated}
                  stroke={TOKENS.colors.borderStrong}
                  strokeWidth="2.5"
                />
                <text
                  x="220"
                  y="206"
                  textAnchor="middle"
                  fill={TOKENS.colors.textPrimary}
                  fontFamily={TOKENS.fonts.sans}
                  fontSize="28"
                  fontWeight="800"
                >
                  Full Transformer
                </text>
                <text
                  x="220"
                  y="244"
                  textAnchor="middle"
                  fill={TOKENS.colors.textSecondary}
                  fontFamily={TOKENS.fonts.mono}
                  fontSize="19"
                >
                  All 80 Layers • 1 Token
                </text>

                {/* Arrow up into Transformer */}
                <line
                  x1="220"
                  y1="336"
                  x2="220"
                  y2="292"
                  stroke={TOKENS.colors.accentWarm}
                  strokeWidth="4"
                />
                <polygon points="220,284 210,302 230,302" fill={TOKENS.colors.accentWarm} />

                {/* Input slot */}
                <rect
                  x="90"
                  y="338"
                  width="260"
                  height="68"
                  rx="16"
                  fill="rgba(255,255,255,0.04)"
                  stroke={TOKENS.colors.borderStrong}
                  strokeWidth="2"
                />
                <text
                  x="220"
                  y="380"
                  textAnchor="middle"
                  fill={TOKENS.colors.textPrimary}
                  fontFamily={TOKENS.fonts.mono}
                  fontSize="22"
                  fontWeight="700"
                >
                  Feed Back In [1 × d]
                </text>

                {/* Animated feedback loop arc on right */}
                <path
                  d="M 352 58 C 446 58, 446 372, 356 372"
                  fill="none"
                  stroke={TOKENS.colors.accentWarm}
                  strokeWidth="4.5"
                  strokeDasharray="12 10"
                  strokeDashoffset={loopDashOffset}
                />
                <polygon points="350,372 368,362 368,382" fill={TOKENS.colors.accentWarm} />
                <text
                  x="414"
                  y="218"
                  textAnchor="middle"
                  fill={TOKENS.colors.accentWarm}
                  fontFamily={TOKENS.fonts.mono}
                  fontSize="16"
                  fontWeight="800"
                  transform="rotate(90 414 218)"
                  opacity={fadeIn(frame, Math.min(oneCue, ninetyCue), 16)}
                >
                  SERIAL LOOP
                </text>
              </svg>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}
    </Stage>
  );
};
