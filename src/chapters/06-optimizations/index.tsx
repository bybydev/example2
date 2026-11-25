import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import {
  clipRange,
  cueFrame,
  progressBetween,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import { Card, Pill, SectionTitle, TokenChip } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const DRAFT_TOKENS = ["the", "GPU", "waits", "for", "bytes"];
const EXPERTS = ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"];

export const OptimizationsChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p18 = clipRange(clips[0], chapter.startFrame, 0, 655);
  const p19 = clipRange(clips[1], chapter.startFrame, p18.end, 493);
  const p20 = clipRange(clips[2], chapter.startFrame, p19.end, 570);

  // Beat 1 (P18) cues
  const quantCue = cueFrame(clips[0], "quantization", 240, chapter.startFrame);
  const gqaCue = cueFrame(clips[0], "GQA", 370, chapter.startFrame);
  const moeCue = cueFrame(clips[0], "Mixture", 510, chapter.startFrame);

  // Beat 2 (P19) cues
  const draftCue = cueFrame(clips[1], "draft", 120, chapter.startFrame);
  const verifyCue = cueFrame(clips[1], "verifies", 260, chapter.startFrame);

  // Beat 3 (P20) cues
  const pagedCue = cueFrame(clips[2], "PagedAttention", 35, chapter.startFrame);
  const disaggCue = cueFrame(clips[2], "disaggregation", 290, chapter.startFrame);

  const w18 = sceneWindow(frame, p18.start, p18.end);
  const w19 = sceneWindow(frame, p19.start, p19.end);
  const w20 = sceneWindow(frame, p20.start, p20.end, { keepAtEnd: true });

  const draftCount = Math.min(
    DRAFT_TOKENS.length,
    Math.floor(progressBetween(frame, draftCue, verifyCue - 15) * (DRAFT_TOKENS.length + 1))
  );
  const verifiedDone = frame >= verifyCue + 20;

  return (
    <Stage chapterIndex="06" chapterTitle={chapter.title} tone="emerald">
      {/* BEAT 1 (P18): Shrink What Crosses HBM */}
      {w18.visible ? (
        <AbsoluteFill
          style={{
            opacity: w18.opacity,
            transform: `translateY(${w18.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Fighting the Memory Wall"
            title="Move Fewer Bytes Across HBM Per Output Token"
            subtitle="Without these breakthroughs, output tokens would cost 20×–50× more."
            tone="emerald"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 26 }}>
            {/* Card 1: Quantization */}
            <div style={slideUpStyle(frame, fps, quantCue - 15, 28)}>
              <Card tone="emerald" glow padding={30} style={{ height: 420, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <Pill tone="emerald" size="sm" style={{ marginBottom: 14 }}>
                    1. QUANTIZATION
                  </Pill>
                  <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>
                    FP16 → FP8 / FP4
                  </div>
                  <div style={{ fontSize: 21, color: TOKENS.colors.textSecondary }}>
                    Smaller weights cut HBM memory traffic 2×–4× immediately.
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    style={{
                      height: 36,
                      width: "100%",
                      borderRadius: 8,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 14,
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 16,
                      color: TOKENS.colors.textSecondary,
                    }}
                  >
                    FP16 (16-bit)
                  </div>
                  <div
                    style={{
                      height: 36,
                      width: "50%",
                      borderRadius: 8,
                      backgroundColor: TONE_STYLES.emerald.bg,
                      border: `1.5px solid ${TOKENS.colors.accentEmerald}`,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 14,
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 16,
                      fontWeight: 800,
                      color: TOKENS.colors.accentEmerald,
                    }}
                  >
                    FP8 (2×)
                  </div>
                  <div
                    style={{
                      height: 36,
                      width: "28%",
                      borderRadius: 8,
                      backgroundColor: TOKENS.colors.accentEmerald,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 12,
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 16,
                      fontWeight: 900,
                      color: TOKENS.colors.background,
                    }}
                  >
                    FP4
                  </div>
                </div>
              </Card>
            </div>

            {/* Card 2: GQA / MLA */}
            <div style={slideUpStyle(frame, fps, gqaCue - 25, 28)}>
              <Card tone="cyan" glow padding={30} style={{ height: 420, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <Pill tone="cyan" size="sm" style={{ marginBottom: 14 }}>
                    2. KV COMPRESSION
                  </Pill>
                  <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>
                    GQA &amp; MLA
                  </div>
                  <div style={{ fontSize: 21, color: TOKENS.colors.textSecondary }}>
                    Share or project Key/Value heads into tiny latent vectors, shrinking VRAM usage.
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6 }}>
                    {EXPERTS.map((k) => (
                      <div
                        key={k}
                        style={{
                          height: 36,
                          borderRadius: 6,
                          backgroundColor: "rgba(245, 158, 11, 0.25)",
                          border: `1px solid ${TOKENS.colors.accentWarm}`,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 18,
                      color: TOKENS.colors.accent,
                    }}
                  >
                    ▼ COMPRESS KV CACHE ▼
                  </div>
                  <div
                    style={{
                      height: 40,
                      width: "34%",
                      margin: "0 auto",
                      borderRadius: 10,
                      backgroundColor: TONE_STYLES.cyan.bg,
                      border: `2px solid ${TOKENS.colors.accent}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 17,
                      fontWeight: 800,
                      color: TOKENS.colors.accent,
                    }}
                  >
                    LATENT KV
                  </div>
                </div>
              </Card>
            </div>

            {/* Card 3: Mixture of Experts (MoE) */}
            <div style={slideUpStyle(frame, fps, moeCue - 20, 28)}>
              <Card tone="emerald" glow padding={30} style={{ height: 420, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <Pill tone="emerald" size="sm" style={{ marginBottom: 14 }}>
                    3. SPARSE ACTIVATION
                  </Pill>
                  <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>
                    Mixture of Experts
                  </div>
                  <div style={{ fontSize: 21, color: TOKENS.colors.textSecondary }}>
                    Only activate ~2 of 8 experts per token — skipping most weights on every step.
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {EXPERTS.map((exp, idx) => {
                    const active = idx === 1 || idx === 5;
                    return (
                      <div
                        key={exp}
                        style={{
                          height: 56,
                          borderRadius: 10,
                          backgroundColor: active
                            ? TOKENS.colors.accentEmerald
                            : "rgba(255,255,255,0.04)",
                          border: `1.5px solid ${
                            active ? TOKENS.colors.accentEmerald : TOKENS.colors.border
                          }`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 18,
                          fontWeight: 800,
                          color: active ? TOKENS.colors.background : TOKENS.colors.textMuted,
                        }}
                      >
                        {exp}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 2 (P19): Speculative Decoding */}
      {w19.visible ? (
        <AbsoluteFill
          style={{
            opacity: w19.opacity,
            transform: `translateY(${w19.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 26,
          }}
        >
          <SectionTitle
            eyebrow="Bending Autoregression"
            title="Speculative Decoding: Draft Fast, Verify in Parallel"
            subtitle="Turns memory-bound decode partially back into compute-bound parallel verification."
            tone="emerald"
            style={{ marginBottom: 6 }}
          />

          {/* Track 1: Tiny Draft Model */}
          <Card tone="amber" padding={30}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <Pill tone="amber" size="md">
                STEP 1: TINY DRAFT MODEL (CHEAP &amp; FAST)
              </Pill>
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 20,
                  color: TOKENS.colors.textSecondary,
                }}
              >
                Guesses 5 candidate tokens ahead
              </span>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {DRAFT_TOKENS.map((word, idx) => (
                <TokenChip
                  key={word}
                  label={word}
                  sublabel={`draft #${idx + 1}`}
                  tone="amber"
                  dim={idx >= draftCount}
                  style={{ flex: 1 }}
                />
              ))}
            </div>
          </Card>

          {/* Track 2: Giant Model Parallel Verification */}
          <div style={slideUpStyle(frame, fps, verifyCue - 20, 24)}>
            <Card tone="cyan" glow padding={30}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <Pill tone="cyan" size="md">
                  STEP 2: GIANT MODEL (1 PARALLEL PREFILL-LIKE PASS)
                </Pill>
                <Pill tone="emerald" size="md">
                  4+ TOKENS FOR 1 WEIGHT LOAD
                </Pill>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                {DRAFT_TOKENS.map((word, idx) => {
                  const accepted = idx < 4;
                  return (
                    <div
                      key={word}
                      style={{
                        flex: 1,
                        padding: "16px 14px",
                        borderRadius: 14,
                        backgroundColor: verifiedDone
                          ? accepted
                            ? TONE_STYLES.emerald.bg
                            : TONE_STYLES.amber.bg
                          : TONE_STYLES.cyan.bg,
                        border: `2px solid ${
                          verifiedDone
                            ? accepted
                              ? TOKENS.colors.accentEmerald
                              : TOKENS.colors.accentWarm
                            : TOKENS.colors.accent
                        }`,
                        textAlign: "center",
                        fontFamily: TOKENS.fonts.mono,
                      }}
                    >
                      <div style={{ fontSize: 24, fontWeight: 800 }}>
                        {verifiedDone && !accepted ? "memory" : word}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          marginTop: 6,
                          color: verifiedDone
                            ? accepted
                              ? TOKENS.colors.accentEmerald
                              : TOKENS.colors.accentWarm
                            : TOKENS.colors.accent,
                        }}
                      >
                        {verifiedDone ? (accepted ? "✓ ACCEPTED" : "↻ FIXED") : "VERIFYING..."}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 3 (P20): PagedAttention & Prefill-Decode Disaggregation */}
      {w20.visible ? (
        <AbsoluteFill
          style={{
            opacity: w20.opacity,
            transform: `translateY(${w20.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="Serving-Layer Architecture"
            title="PagedAttention & Prefill–Decode Disaggregation"
            subtitle="Eliminating VRAM waste and splitting compute-heavy prefill from memory-heavy decode."
            tone="emerald"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 30 }}>
            {/* PagedAttention */}
            <div style={slideUpStyle(frame, fps, pagedCue, 20)}>
              <Card tone="emerald" glow padding={32} style={{ height: 400, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <Pill tone="emerald" size="md" style={{ marginBottom: 16 }}>
                    PAGEDATTENTION (vLLM)
                  </Pill>
                  <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>
                    Virtual Memory Pages for KV Cache
                  </div>
                  <div style={{ fontSize: 21, color: TOKENS.colors.textSecondary }}>
                    Packs non-contiguous KV pages tightly in VRAM → far higher batch concurrency.
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                  {[
                    "A1", "B1", "A2", "C1", "B2", "A3",
                    "C2", "D1", "B3", "D2", "C3", "D3",
                  ].map((page) => {
                    const tone = page.startsWith("A")
                      ? TOKENS.colors.accent
                      : page.startsWith("B")
                      ? TOKENS.colors.accentEmerald
                      : page.startsWith("C")
                      ? TOKENS.colors.accentWarm
                      : "#A78BFA";
                    return (
                      <div
                        key={page}
                        style={{
                          height: 46,
                          borderRadius: 8,
                          backgroundColor: "rgba(255,255,255,0.06)",
                          border: `2px solid ${tone}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 17,
                          fontWeight: 800,
                          color: tone,
                        }}
                      >
                        {page}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Disaggregated Serving Cluster */}
            <div style={slideUpStyle(frame, fps, disaggCue - 45, 24)}>
              <Card tone="cyan" glow padding={32} style={{ height: 400, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <Pill tone="cyan" size="md" style={{ marginBottom: 16 }}>
                    PREFILL–DECODE DISAGGREGATION
                  </Pill>
                  <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>
                    Specialized GPU Pools for Each Phase
                  </div>
                  <div style={{ fontSize: 21, color: TOKENS.colors.textSecondary }}>
                    Long incoming prompts never stall active users who are streaming output.
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      padding: "22px 18px",
                      borderRadius: 16,
                      backgroundColor: TONE_STYLES.cyan.bg,
                      border: `2px solid ${TOKENS.colors.accent}`,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 24, fontWeight: 800, color: TOKENS.colors.accent }}>
                      Prefill Pool
                    </div>
                    <div
                      style={{
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 16,
                        color: TOKENS.colors.textSecondary,
                        marginTop: 6,
                      }}
                    >
                      Compute-Heavy GPUs
                    </div>
                  </div>

                  <div style={{ textAlign: "center", fontFamily: TOKENS.fonts.mono }}>
                    <div style={{ fontSize: 14, color: TOKENS.colors.accentEmerald, fontWeight: 700 }}>
                      KV CACHE
                    </div>
                    <div style={{ fontSize: 28, color: TOKENS.colors.accentEmerald }}>══▶</div>
                    <div style={{ fontSize: 13, color: TOKENS.colors.textMuted }}>NVLink / RDMA</div>
                  </div>

                  <div
                    style={{
                      padding: "22px 18px",
                      borderRadius: 16,
                      backgroundColor: TONE_STYLES.amber.bg,
                      border: `2px solid ${TOKENS.colors.accentWarm}`,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 24, fontWeight: 800, color: TOKENS.colors.accentWarm }}>
                      Decode Pool
                    </div>
                    <div
                      style={{
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 16,
                        color: TOKENS.colors.textSecondary,
                        marginTop: 6,
                      }}
                    >
                      Bandwidth-Heavy GPUs
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </Stage>
  );
};
