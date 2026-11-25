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
import { Card, MeterBar, Pill, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const CORE_CELLS = Array.from({ length: 32 }, (_, i) => i);

export const MemoryWallChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p7 = clipRange(clips[0], chapter.startFrame, 0, 580);
  const p8 = clipRange(clips[1], chapter.startFrame, p7.end, 536);
  const p9 = clipRange(clips[2], chapter.startFrame, p8.end, 607);
  const p10 = clipRange(clips[3], chapter.startFrame, p9.end, 461);

  // Beat 1 (P7) cues
  const hbmCue = cueFrame(clips[0], "HBM", 120, chapter.startFrame);
  const busCue = cueFrame(clips[0], "bus", 210, chapter.startFrame);
  const tensorCue = cueFrame(clips[0], "Tensor", 290, chapter.startFrame);
  const bandwidthCue = cueFrame(clips[0], "bandwidth", 450, chapter.startFrame);

  // Beat 2 (P8) cues
  const gemmCue = cueFrame(clips[1], "GEMM", 260, chapter.startFrame);
  const freightCue = cueFrame(clips[1], "freight", 370, chapter.startFrame);

  // Beat 3 (P9) cues
  const weightsCue = cueFrame(clips[2], "weights", 160, chapter.startFrame);
  const repeatCue = cueFrame(clips[2], "repeat", 360, chapter.startFrame);
  const postcardCue = cueFrame(clips[2], "eighteen", 450, chapter.startFrame);

  // Beat 4 (P10) cues
  const computeBoundCue = cueFrame(clips[3], "compute", 110, chapter.startFrame);
  const memoryBoundCue = cueFrame(clips[3], "memory", 220, chapter.startFrame);
  const idleCue = cueFrame(clips[3], "idle", 340, chapter.startFrame);

  const w7 = sceneWindow(frame, p7.start, p7.end);
  const w8 = sceneWindow(frame, p8.start, p8.end);
  const w9 = sceneWindow(frame, p9.start, p9.end);
  const w10 = sceneWindow(frame, p10.start, p10.end, { keepAtEnd: true });

  // Animated byte flow offset
  const busFlow = (frame * 5) % 100;
  const decodeCycle = (frame - p9.start) % 45;
  const weightPacketX = interpolate(decodeCycle, [0, 35, 44], [0, 100, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Telemetry meters in P10
  const prefillCompute = 82 * progressBetween(frame, computeBoundCue, computeBoundCue + 30);
  const prefillBus = 45 * progressBetween(frame, computeBoundCue, computeBoundCue + 30);
  const decodeBus = 100 * progressBetween(frame, memoryBoundCue, memoryBoundCue + 24);
  const decodeCompute = interpolate(
    progressBetween(frame, memoryBoundCue, idleCue + 20),
    [0, 1],
    [18, 3]
  );

  return (
    <Stage chapterIndex="03" chapterTitle={chapter.title} tone="amber">
      {/* BEAT 1 (P7): Inside an AI GPU */}
      {w7.visible ? (
        <AbsoluteFill
          style={{
            opacity: w7.opacity,
            transform: `translateY(${w7.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Inside an AI GPU (H100-Class)"
            title="A Superfast Math Factory Fed by a Narrow Highway"
            subtitle="Tensor Cores compute at ~1,000 TFLOPS, but every weight byte must cross the HBM memory bus."
            tone="cyan"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.85fr 1.35fr",
              alignItems: "center",
              gap: 0,
            }}
          >
            {/* Left: HBM */}
            <Card
              tone={frame >= hbmCue ? "amber" : "neutral"}
              glow={frame >= hbmCue}
              padding={34}
              style={{ height: 420, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                <Pill tone="amber" size="md" style={{ marginBottom: 18 }}>
                  STORAGE
                </Pill>
                <div style={{ fontSize: 42, fontWeight: 800, marginBottom: 8 }}>HBM3 Memory</div>
                <div
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 22,
                    color: TOKENS.colors.accentWarm,
                  }}
                >
                  80 GB per GPU
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Weights: Layer 1–20", "Weights: Layer 21–40", "Weights: Layer 41–80"].map(
                  (label) => (
                    <div
                      key={label}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 10,
                        backgroundColor: "rgba(245, 158, 11, 0.12)",
                        border: `1px solid ${TONE_STYLES.amber.border}`,
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 18,
                        color: TOKENS.colors.textPrimary,
                      }}
                    >
                      {label}
                    </div>
                  )
                )}
              </div>
            </Card>

            {/* Center: Narrow Memory Bus */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 8px",
              }}
            >
              <Pill
                tone={frame >= bandwidthCue ? "rose" : "amber"}
                size="sm"
                style={{ marginBottom: 14 }}
              >
                THE BOTTLENECK
              </Pill>
              <div
                style={{
                  width: "100%",
                  height: 68,
                  backgroundColor: "rgba(251, 113, 133, 0.12)",
                  borderTop: `3px solid ${frame >= busCue ? TOKENS.colors.accentRose : TOKENS.colors.borderStrong}`,
                  borderBottom: `3px solid ${frame >= busCue ? TOKENS.colors.accentRose : TOKENS.colors.borderStrong}`,
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {[0, 33, 66].map((offset) => (
                  <div
                    key={offset}
                    style={{
                      position: "absolute",
                      left: `${(busFlow + offset) % 100}%`,
                      width: 34,
                      height: 16,
                      borderRadius: 4,
                      backgroundColor: TOKENS.colors.accentWarm,
                      opacity: frame >= busCue ? 0.85 : 0.25,
                    }}
                  />
                ))}
                <span
                  style={{
                    position: "relative",
                    zIndex: 2,
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 20,
                    fontWeight: 800,
                    backgroundColor: "rgba(11, 16, 32, 0.85)",
                    padding: "4px 12px",
                    borderRadius: 8,
                    color: TOKENS.colors.textPrimary,
                  }}
                >
                  3.35 TB/s BUS
                </span>
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 19,
                  color: TOKENS.colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Every byte must cross here
              </div>
            </div>

            {/* Right: SRAM + Tensor Cores */}
            <Card
              tone={frame >= tensorCue ? "cyan" : "neutral"}
              glow={frame >= tensorCue}
              padding={34}
              style={{ height: 420, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                <Pill tone="cyan" size="md" style={{ marginBottom: 18 }}>
                  COMPUTE ENGINE
                </Pill>
                <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 8 }}>
                  SRAM + Tensor Cores
                </div>
                <div
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 22,
                    color: TOKENS.colors.accent,
                  }}
                >
                  ~1,000 TFLOPS (FP16 / FP8)
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(8, 1fr)",
                  gap: 8,
                }}
              >
                {CORE_CELLS.map((cell) => (
                  <div
                    key={cell}
                    style={{
                      height: 32,
                      borderRadius: 6,
                      backgroundColor:
                        frame >= tensorCue
                          ? TOKENS.colors.accent
                          : "rgba(255, 255, 255, 0.08)",
                      opacity: frame >= tensorCue ? 0.78 : 0.4,
                    }}
                  />
                ))}
              </div>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 2 (P8): Prefill = GEMM (Matrix × Matrix) */}
      {w8.visible ? (
        <AbsoluteFill
          style={{
            opacity: w8.opacity,
            transform: `translateY(${w8.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <SectionTitle
            eyebrow="Prefill Workload — GEMM"
            title="Load Weights Once. Multiply 1,000 Tokens Together."
            tone="cyan"
            style={{ marginBottom: 12 }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 28 }}>
            {/* Matrix × Matrix visual */}
            <Card tone="cyan" glow padding={32}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 22,
                }}
              >
                <Pill tone="cyan" size="md">
                  MATRIX × MATRIX (GEMM)
                </Pill>
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 20,
                    color: TOKENS.colors.accentEmerald,
                    fontWeight: 700,
                  }}
                >
                  HIGH ARITHMETIC INTENSITY
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 24,
                  padding: "16px 0",
                }}
              >
                <div
                  style={{
                    width: 220,
                    height: 180,
                    borderRadius: 16,
                    backgroundColor: TONE_STYLES.cyan.bg,
                    border: `2px solid ${TOKENS.colors.accent}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: TOKENS.fonts.mono,
                  }}
                >
                  <span style={{ fontSize: 24, fontWeight: 800, color: TOKENS.colors.accent }}>
                    INPUT TOKENS
                  </span>
                  <span style={{ fontSize: 22, color: TOKENS.colors.textPrimary, marginTop: 8 }}>
                    [1024 × d]
                  </span>
                </div>

                <span style={{ fontSize: 44, fontWeight: 800, color: TOKENS.colors.textSecondary }}>
                  ×
                </span>

                <div
                  style={{
                    width: 200,
                    height: 180,
                    borderRadius: 16,
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    border: `2px solid ${TOKENS.colors.borderStrong}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: TOKENS.fonts.mono,
                  }}
                >
                  <span style={{ fontSize: 24, fontWeight: 800, color: TOKENS.colors.textPrimary }}>
                    WEIGHTS
                  </span>
                  <span style={{ fontSize: 22, color: TOKENS.colors.textSecondary, marginTop: 8 }}>
                    [d × d]
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      color: TOKENS.colors.accentEmerald,
                      marginTop: 8,
                      fontWeight: 700,
                    }}
                  >
                    LOADED 1×
                  </span>
                </div>
              </div>
            </Card>

            {/* Busy Tensor Core Grid */}
            <Card tone="cyan" padding={32}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <span style={{ fontSize: 26, fontWeight: 800 }}>Tensor Core Grid</span>
                <Pill tone="cyan" size="sm">
                  ~82% ACTIVE
                </Pill>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
                {CORE_CELLS.map((cell) => {
                  const busy = cell < 28;
                  return (
                    <div
                      key={cell}
                      style={{
                        height: 44,
                        borderRadius: 8,
                        backgroundColor: busy
                          ? TOKENS.colors.accent
                          : "rgba(255, 255, 255, 0.06)",
                        boxShadow:
                          busy && frame >= gemmCue
                            ? `0 0 12px ${TOKENS.colors.accentGlow}`
                            : "none",
                      }}
                    />
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Freight Train Analogy Card */}
          <div style={slideUpStyle(frame, fps, freightCue, 24)}>
            <Card
              tone="emerald"
              padding={24}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 28,
              }}
            >
              <svg width="340" height="72" viewBox="0 0 340 72">
                {[10, 74, 138, 202].map((x) => (
                  <g key={x}>
                    <rect
                      x={x}
                      y="14"
                      width="56"
                      height="36"
                      rx="6"
                      fill={TONE_STYLES.cyan.bg}
                      stroke={TOKENS.colors.accent}
                      strokeWidth="2.5"
                    />
                    <circle cx={x + 14} cy="56" r="6" fill={TOKENS.colors.textSecondary} />
                    <circle cx={x + 42} cy="56" r="6" fill={TOKENS.colors.textSecondary} />
                  </g>
                ))}
                <rect
                  x="268"
                  y="10"
                  width="62"
                  height="40"
                  rx="8"
                  fill={TOKENS.colors.accent}
                />
                <circle cx="284" cy="56" r="6" fill={TOKENS.colors.textPrimary} />
                <circle cx="314" cy="56" r="6" fill={TOKENS.colors.textPrimary} />
              </svg>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 18,
                    fontWeight: 700,
                    color: TOKENS.colors.accentEmerald,
                    marginBottom: 4,
                  }}
                >
                  ANALOGY — FREIGHT TRAIN
                </div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  One trip across the memory bus hauls 1,000 containers of work at once.
                </div>
              </div>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 3 (P9): Decode = GEMV (Matrix × Vector) */}
      {w9.visible ? (
        <AbsoluteFill
          style={{
            opacity: w9.opacity,
            transform: `translateY(${w9.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <SectionTitle
            eyebrow="Decode Workload — GEMV"
            title="Stream 100+ GB of Weights Just to Generate 1 Token"
            tone="amber"
            style={{ marginBottom: 12 }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 28 }}>
            {/* Tiny Vector × Giant Weights */}
            <Card tone="amber" glow padding={32}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Pill tone="amber" size="md">
                  VECTOR × MATRIX (GEMV)
                </Pill>
                <Pill tone="rose" size="sm">
                  REPEATED EVERY WORD
                </Pill>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 24,
                  padding: "16px 0",
                }}
              >
                {/* Tiny 1 x d vector */}
                <div
                  style={{
                    width: 200,
                    height: 54,
                    borderRadius: 12,
                    backgroundColor: TONE_STYLES.amber.bg,
                    border: `2.5px solid ${TOKENS.colors.accentWarm}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 22,
                    fontWeight: 800,
                    color: TOKENS.colors.accentWarm,
                  }}
                >
                  1 TOKEN [1 × d]
                </div>

                <span style={{ fontSize: 44, fontWeight: 800, color: TOKENS.colors.textSecondary }}>
                  ×
                </span>

                {/* Giant weight block streaming */}
                <div
                  style={{
                    width: 240,
                    height: 180,
                    borderRadius: 16,
                    backgroundColor: "rgba(251, 113, 133, 0.14)",
                    border: `2px solid ${TOKENS.colors.accentRose}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: TOKENS.fonts.mono,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${weightPacketX - 25}%`,
                      width: "30%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(251,113,133,0.35), transparent)",
                    }}
                  />
                  <span style={{ fontSize: 24, fontWeight: 800, color: TOKENS.colors.accentRose }}>
                    ALL WEIGHTS
                  </span>
                  <span style={{ fontSize: 24, color: TOKENS.colors.textPrimary, marginTop: 6 }}>
                    100+ GB
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      color: TOKENS.colors.accentWarm,
                      marginTop: 8,
                      fontWeight: 700,
                      opacity: fadeIn(frame, Math.min(weightsCue, repeatCue), 14),
                    }}
                  >
                    RELOADED EVERY STEP
                  </span>
                </div>
              </div>
            </Card>

            {/* Starved Tensor Core Grid */}
            <Card tone="rose" padding={32}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <span style={{ fontSize: 26, fontWeight: 800 }}>Tensor Core Grid</span>
                <Pill tone="rose" size="sm">
                  95%+ SITTING IDLE
                </Pill>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
                {CORE_CELLS.map((cell) => {
                  const busy = cell === 0 || cell === 1;
                  return (
                    <div
                      key={cell}
                      style={{
                        height: 44,
                        borderRadius: 8,
                        backgroundColor: busy
                          ? TOKENS.colors.accentWarm
                          : "rgba(255, 255, 255, 0.04)",
                        border: busy
                          ? `1px solid ${TOKENS.colors.accentWarm}`
                          : "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    />
                  );
                })}
              </div>
            </Card>
          </div>

          {/* 18-Wheeler Postcard Analogy */}
          <div style={slideUpStyle(frame, fps, postcardCue, 24)}>
            <Card
              tone="amber"
              padding={24}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 28,
              }}
            >
              <svg width="340" height="76" viewBox="0 0 340 76">
                <rect
                  x="16"
                  y="10"
                  width="226"
                  height="46"
                  rx="8"
                  fill="rgba(251, 113, 133, 0.14)"
                  stroke={TOKENS.colors.accentRose}
                  strokeWidth="2.5"
                />
                {/* Tiny single postcard inside giant trailer */}
                <rect
                  x="114"
                  y="24"
                  width="30"
                  height="18"
                  rx="3"
                  fill={TOKENS.colors.accentWarm}
                />
                <rect
                  x="250"
                  y="22"
                  width="64"
                  height="34"
                  rx="8"
                  fill={TOKENS.colors.accentWarm}
                />
                {[38, 62, 194, 218, 294].map((cx) => (
                  <circle key={cx} cx={cx} cy="62" r="7" fill={TOKENS.colors.textSecondary} />
                ))}
              </svg>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 18,
                    fontWeight: 700,
                    color: TOKENS.colors.accentWarm,
                    marginBottom: 4,
                  }}
                >
                  ANALOGY — 18-WHEELER FOR ONE POSTCARD
                </div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  Driving a giant rig across town just to deliver a single word — then repeating.
                </div>
              </div>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 4 (P10): Side-by-Side Utilization Telemetry */}
      {w10.visible ? (
        <AbsoluteFill
          style={{
            opacity: w10.opacity,
            transform: `translateY(${w10.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="GPU Utilization Telemetry"
            title="Compute-Bound vs. The Memory Wall"
            subtitle="Same $30,000 GPU — wildly different efficiency per token."
            tone="rose"
            align="center"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
            {/* Prefill Dashboard */}
            <Card tone="cyan" glow padding={40}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 32,
                }}
              >
                <div>
                  <div style={{ fontSize: 38, fontWeight: 800 }}>PREFILL</div>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 20,
                      color: TOKENS.colors.accent,
                      marginTop: 4,
                    }}
                  >
                    COMPUTE-BOUND
                  </div>
                </div>
                <Pill tone="emerald" size="md">
                  EFFICIENT
                </Pill>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                <MeterBar label="Tensor Core Compute" percent={prefillCompute} tone="cyan" />
                <MeterBar label="HBM Memory Bandwidth" percent={prefillBus} tone="emerald" />
              </div>

              <div
                style={{
                  marginTop: 32,
                  paddingTop: 22,
                  borderTop: `1px solid ${TOKENS.colors.border}`,
                  fontSize: 23,
                  color: TOKENS.colors.textSecondary,
                }}
              >
                Math units stay saturated → low cost per input token.
              </div>
            </Card>

            {/* Decode Dashboard */}
            <Card tone="rose" glow padding={40}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 32,
                }}
              >
                <div>
                  <div style={{ fontSize: 38, fontWeight: 800 }}>DECODE</div>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 20,
                      color: TOKENS.colors.accentRose,
                      marginTop: 4,
                    }}
                  >
                    MEMORY-BOUND
                  </div>
                </div>
                <Pill tone="rose" size="md">
                  MEMORY WALL
                </Pill>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                <MeterBar
                  label="Tensor Core Compute"
                  percent={decodeCompute}
                  tone="amber"
                  valueLabel={`${Math.round(decodeCompute)}% (IDLE)`}
                />
                <MeterBar
                  label="HBM Memory Bandwidth"
                  percent={decodeBus}
                  tone="rose"
                  valueLabel={`${Math.round(decodeBus)}% REDLINE`}
                />
              </div>

              <div
                style={{
                  marginTop: 32,
                  paddingTop: 22,
                  borderTop: `1px solid ${TOKENS.colors.border}`,
                  fontSize: 23,
                  color: TOKENS.colors.textSecondary,
                }}
              >
                95%+ of compute waits on bytes → expensive per output token.
              </div>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}
    </Stage>
  );
};
