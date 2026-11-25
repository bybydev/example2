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
import { Card, Pill, SectionTitle, TokenChip } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const PRICING_ROWS = [
  { model: "Frontier Flagship", input: "$3.00", output: "$15.00", ratio: "5×", highlight: true },
  { model: "Reasoning Tier", input: "$5.00", output: "$25.00", ratio: "5×", highlight: false },
  { model: "Fast Coding Model", input: "$0.80", output: "$4.00", ratio: "5×", highlight: false },
];

export const HookChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p1 = clipRange(clips[0], chapter.startFrame, 0, 515);
  const p2 = clipRange(clips[1], chapter.startFrame, p1.end, 450);
  const p3 = clipRange(clips[2], chapter.startFrame, p2.end, 464);

  // Beat 1 word cues
  const inputCue = cueFrame(clips[0], "input", 60, chapter.startFrame);
  const outputCue = cueFrame(clips[0], "output", 145, chapter.startFrame);
  const fiveCue = cueFrame(clips[0], "five", 215, chapter.startFrame);
  const cachedCue = cueFrame(clips[0], "cached", 315, chapter.startFrame);
  const fiftyCue = cueFrame(clips[0], "fifty", 390, chapter.startFrame);

  // Beat 2 word cues
  const sameCue = cueFrame(clips[1], "same", 100, chapter.startFrame);
  const whyCue = cueFrame(clips[1], "why", 280, chapter.startFrame);

  // Beat 3 word cues
  const physicsCue = cueFrame(clips[2], "physics", 80, chapter.startFrame);
  const workloadsCue = cueFrame(clips[2], "workloads", 240, chapter.startFrame);

  const w1 = sceneWindow(frame, p1.start, p1.end);
  const w2 = sceneWindow(frame, p2.start, p2.end);
  const w3 = sceneWindow(frame, p3.start, p3.end, { keepAtEnd: true });

  const tiltProgress = springAt(frame, fps, whyCue, { damping: 14, stiffness: 110 });
  const scaleAngle = interpolate(tiltProgress, [0, 1], [0, 14]);
  const ratioCounter = Math.round(
    interpolate(progressBetween(frame, cachedCue, fiftyCue + 25), [0, 1], [5, 50])
  );
  const splitProgress = springAt(frame, fps, physicsCue, { damping: 16, stiffness: 120 });

  return (
    <Stage chapterIndex="01" chapterTitle={chapter.title} tone="cyan">
      {/* BEAT 1: API Pricing Table Shock */}
      {w1.visible ? (
        <AbsoluteFill
          style={{
            opacity: w1.opacity,
            transform: `translateY(${w1.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="API Pricing Reality"
            title="Same Model. Five Times the Price."
            subtitle="Per 1 million tokens across modern frontier LLM APIs"
            tone="cyan"
          />

          <Card padding={36} style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr 1fr 0.8fr",
                gap: 20,
                paddingBottom: 18,
                borderBottom: `1px solid ${TOKENS.colors.border}`,
                fontFamily: TOKENS.fonts.mono,
                fontSize: 18,
                fontWeight: 700,
                color: TOKENS.colors.textSecondary,
                letterSpacing: "0.06em",
              }}
            >
              <span>MODEL TIER</span>
              <span style={{ color: TOKENS.colors.accent }}>INPUT / 1M</span>
              <span style={{ color: TOKENS.colors.accentWarm }}>OUTPUT / 1M</span>
              <span style={{ textAlign: "right" }}>GAP</span>
            </div>

            {PRICING_ROWS.map((row, idx) => {
              const rowDelay = idx * 8;
              const inOpacity = fadeIn(frame, inputCue + rowDelay, 12);
              const outOpacity = fadeIn(frame, outputCue + rowDelay, 12);
              const badgeScale = springAt(frame, fps, fiveCue + rowDelay, {
                damping: 14,
                stiffness: 180,
              });

              return (
                <div
                  key={row.model}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.6fr 1fr 1fr 0.8fr",
                    gap: 20,
                    alignItems: "center",
                    padding: "24px 16px",
                    marginTop: 12,
                    borderRadius: 16,
                    backgroundColor: row.highlight
                      ? "rgba(56, 189, 248, 0.06)"
                      : "rgba(255, 255, 255, 0.02)",
                    border: row.highlight
                      ? `1px solid ${TONE_STYLES.cyan.border}`
                      : `1px solid transparent`,
                  }}
                >
                  <span style={{ fontSize: 30, fontWeight: 700 }}>{row.model}</span>
                  <span
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 38,
                      fontWeight: 800,
                      color: TOKENS.colors.accent,
                      opacity: inOpacity,
                    }}
                  >
                    {row.input}
                  </span>
                  <span
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 38,
                      fontWeight: 800,
                      color: TOKENS.colors.accentWarm,
                      opacity: outOpacity,
                    }}
                  >
                    {row.output}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      transform: `scale(${badgeScale})`,
                      opacity: badgeScale,
                    }}
                  >
                    <Pill tone="amber" size="lg">
                      {row.ratio}
                    </Pill>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Cached Input 50x Banner */}
          <div style={slideUpStyle(frame, fps, cachedCue, 24)}>
            <Card
              tone="emerald"
              glow
              padding={26}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Pill tone="emerald" size="md">
                  CACHED INPUT
                </Pill>
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 34,
                    fontWeight: 800,
                    color: TOKENS.colors.accentEmerald,
                  }}
                >
                  $0.30 / 1M
                </span>
                <span style={{ fontSize: 26, color: TOKENS.colors.textSecondary }}>
                  vs. Output{" "}
                  <strong style={{ color: TOKENS.colors.accentWarm }}>$15.00 / 1M</strong>
                </span>
              </div>
              <Pill tone="rose" size="lg">
                {ratioCounter}× MORE EXPENSIVE
              </Pill>
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 2: The Naive Assumption */}
      {w2.visible ? (
        <AbsoluteFill
          style={{
            opacity: w2.opacity,
            transform: `translateY(${w2.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <SectionTitle
            eyebrow="The Naive Assumption"
            title="Aren't Both Just Tokens in the Same Model?"
            tone="neutral"
            align="center"
          />

          {/* Tilting SVG Price Scale */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <svg width="560" height="150" viewBox="0 0 560 150">
              <line
                x1="280"
                y1="138"
                x2="280"
                y2="52"
                stroke={TOKENS.colors.textMuted}
                strokeWidth="5"
                strokeLinecap="round"
              />
              <rect x="210" y="136" width="140" height="10" rx="5" fill={TOKENS.colors.textMuted} />
              <g transform={`rotate(${scaleAngle} 280 54)`}>
                <line
                  x1="110"
                  y1="54"
                  x2="450"
                  y2="54"
                  stroke={TOKENS.colors.textPrimary}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <circle cx="110" cy="54" r="10" fill={TOKENS.colors.accent} />
                <circle cx="450" cy="54" r="10" fill={TOKENS.colors.accentWarm} />
                <rect
                  x="58"
                  y="72"
                  width="104"
                  height="42"
                  rx="12"
                  fill={TONE_STYLES.cyan.bg}
                  stroke={TONE_STYLES.cyan.border}
                  strokeWidth="2"
                />
                <text
                  x="110"
                  y="99"
                  textAnchor="middle"
                  fill={TOKENS.colors.accent}
                  fontFamily={TOKENS.fonts.mono}
                  fontSize="22"
                  fontWeight="800"
                >
                  $3 IN
                </text>
                <rect
                  x="390"
                  y="72"
                  width="120"
                  height="42"
                  rx="12"
                  fill={TONE_STYLES.amber.bg}
                  stroke={TONE_STYLES.amber.border}
                  strokeWidth="2"
                />
                <text
                  x="450"
                  y="99"
                  textAnchor="middle"
                  fill={TOKENS.colors.accentWarm}
                  fontFamily={TOKENS.fonts.mono}
                  fontSize="22"
                  fontWeight="800"
                >
                  $15 OUT
                </text>
              </g>
              <circle cx="280" cy="54" r="14" fill={TOKENS.colors.surfaceElevated} stroke={TOKENS.colors.borderStrong} strokeWidth="3" />
            </svg>
          </div>

          {/* Symmetric Token -> Transformer Diagram */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 1.6fr 120px 1fr",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Card tone="cyan" padding={28} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, color: TOKENS.colors.textSecondary, marginBottom: 14 }}>
                INPUT TOKEN
              </div>
              <TokenChip label="token_id: 4821" sublabel='"memory"' tone="cyan" />
            </Card>

            <div
              style={{
                textAlign: "center",
                fontFamily: TOKENS.fonts.mono,
                fontSize: 42,
                color: TOKENS.colors.accent,
                opacity: fadeIn(frame, sameCue, 14),
              }}
            >
              ───▶
            </div>

            <Card
              tone="neutral"
              glow
              padding={36}
              style={{
                textAlign: "center",
                borderColor:
                  frame >= sameCue ? TONE_STYLES.cyan.border : TOKENS.colors.border,
              }}
            >
              <Pill tone="neutral" size="sm" style={{ marginBottom: 16 }}>
                IDENTICAL ARCHITECTURE
              </Pill>
              <div style={{ fontSize: 38, fontWeight: 800, marginBottom: 10 }}>
                Transformer Model
              </div>
              <div
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 20,
                  color: TOKENS.colors.textSecondary,
                }}
              >
                Same Layers • Same Weights • Same Math
              </div>
            </Card>

            <div
              style={{
                textAlign: "center",
                fontFamily: TOKENS.fonts.mono,
                fontSize: 42,
                color: TOKENS.colors.accentWarm,
                opacity: fadeIn(frame, sameCue, 14),
              }}
            >
              ───▶
            </div>

            <Card tone="amber" padding={28} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, color: TOKENS.colors.textSecondary, marginBottom: 14 }}>
                OUTPUT TOKEN
              </div>
              <TokenChip label="token_id: 9104" sublabel='"wall"' tone="amber" />
            </Card>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* BEAT 3: Thesis Reveal — GPU Physics */}
      {w3.visible ? (
        <AbsoluteFill
          style={{
            opacity: w3.opacity,
            transform: `translateY(${w3.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: 1460 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginBottom: 42 }}>
              <div
                style={{
                  transform: `translateX(${interpolate(splitProgress, [0, 1], [60, 0])}px)`,
                  opacity: Math.max(0.2, splitProgress),
                }}
              >
                <Card tone="cyan" glow padding={36}>
                  <Pill tone="cyan" size="md" style={{ marginBottom: 18 }}>
                    READING TOKENS
                  </Pill>
                  <div style={{ fontSize: 44, fontWeight: 800, marginBottom: 10 }}>PREFILL</div>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 24,
                      color: TOKENS.colors.accent,
                      marginBottom: 12,
                    }}
                  >
                    Parallel Compute • Compute-Bound
                  </div>
                  <div style={{ fontSize: 22, color: TOKENS.colors.textSecondary }}>
                    Processes all prompt tokens together at high GPU utilization.
                  </div>
                </Card>
              </div>

              <div
                style={{
                  transform: `translateX(${interpolate(splitProgress, [0, 1], [-60, 0])}px)`,
                  opacity: Math.max(0.2, splitProgress),
                }}
              >
                <Card tone="amber" glow padding={36}>
                  <Pill tone="amber" size="md" style={{ marginBottom: 18 }}>
                    WRITING TOKENS
                  </Pill>
                  <div style={{ fontSize: 44, fontWeight: 800, marginBottom: 10 }}>DECODE</div>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 24,
                      color: TOKENS.colors.accentWarm,
                      marginBottom: 12,
                    }}
                  >
                    Serial Memory Traffic • Bandwidth-Bound
                  </div>
                  <div style={{ fontSize: 22, color: TOKENS.colors.textSecondary }}>
                    Streams entire model weights across memory just to emit 1 word.
                  </div>
                </Card>
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                ...slideUpStyle(frame, fps, workloadsCue, 28),
              }}
            >
              <Pill tone="neutral" size="md" style={{ marginBottom: 18 }}>
                IT&apos;S NOT ARBITRARY MARKUP — IT&apos;S GPU PHYSICS
              </Pill>
              <h1
                style={{
                  margin: 0,
                  fontSize: 74,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.08,
                }}
              >
                Why AI Output Tokens Are{" "}
                <span style={{ color: TOKENS.colors.accentWarm }}>So Expensive</span>
              </h1>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </Stage>
  );
};
