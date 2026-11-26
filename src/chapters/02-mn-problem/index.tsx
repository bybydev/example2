import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
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
import { Card, DataChip, MeterBar, Pill, SceneBeat, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const AI_APPS = ["Claude", "ChatGPT", "Cursor", "VS Code", "Internal Bot"];
const TOOLS = ["Notion", "Slack", "Drive", "GitHub", "Calendar", "Postgres"];

export const MnProblemChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c4 = clips[0];
  const c5 = clips[1];
  const c6 = clips[2];
  const c7 = clips[3];

  const r4 = clipRange(c4, chapter.startFrame, 0, 620);
  const r5 = clipRange(c5, chapter.startFrame, r4.end, 620);
  const r6 = clipRange(c6, chapter.startFrame, r5.end, 650);
  const r7 = clipRange(c7, chapter.startFrame, r6.end, 640);

  // Beat A cues (P4-P6 graph morph)
  const customCue = cueFrame(c4, "custom", 90, chapter.startFrame);
  const schemasCue = cueFrame(c4, "schemas", 250, chapter.startFrame);
  const multiplyCue = cueFrame(c5, "multiply", 60, chapter.startFrame);
  const fragileCue = cueFrame(c5, "fragile", 240, chapter.startFrame);
  const standardCue = cueFrame(c6, "standard", 30, chapter.startFrame);
  const collapsesCue = cueFrame(c6, "collapses", 190, chapter.startFrame);

  // Beat B cues (P7 3-layer stack)
  const replaceCue = cueFrame(c7, "replace", 55, chapter.startFrame);
  const functionCue = cueFrame(c7, "function", 165, chapter.startFrame);
  const adapterCue = cueFrame(c7, "adapter", 290, chapter.startFrame);

  const beatA = sceneWindow(frame, r4.start, r7.start, {
    fadeInFrames: 12,
    fadeOutFrames: 10,
  });
  const beatB = sceneWindow(frame, r7.start, r7.end, {
    fadeInFrames: 12,
    keepAtEnd: true,
  });

  const meshProgress = progressBetween(frame, customCue, customCue + 95);
  const busProgress = springAt(frame, fps, standardCue, { damping: 16, stiffness: 120 });
  const collapseProgress = progressBetween(frame, collapsesCue, collapsesCue + 40);
  const mathOverlayProgress =
    frame >= multiplyCue && frame < standardCue
      ? fadeIn(frame, multiplyCue, 14)
      : 0;
  const fragileRamp = progressBetween(frame, fragileCue, fragileCue + 36);

  const inMcpPhase = frame >= standardCue;

  const leftX = 240;
  const rightX = 1440;
  const busX = 840;
  const graphH = 510;

  const appY = (i: number) => 58 + i * 96;
  const toolY = (j: number) => 45 + j * 82;

  return (
    <Stage
      chapterIndex="02"
      chapterTitle={chapter.title}
      tone={inMcpPhase ? "cyan" : "amber"}
      legend={[
        { label: "CUSTOM GLUE (M×N)", tone: "rose" },
        { label: "MCP STANDARD (M+N)", tone: "cyan" },
      ]}
    >
      {/* SceneBeat A: Persistent Bipartite Graph Morph (P4 -> P5 -> P6) */}
      <SceneBeat window={beatA} align="stretch">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: inMcpPhase ? TOKENS.colors.accent : TOKENS.colors.accentRose,
                  marginBottom: 6,
                }}
              >
                {inMcpPhase
                  ? "THE OPEN STANDARD SOLUTION"
                  : frame >= multiplyCue
                  ? "THE SCALING EXPLOSION"
                  : "BEFORE MCP — BESPOKE PLUGINS"}
              </div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: TOKENS.colors.textPrimary,
                }}
              >
                {inMcpPhase
                  ? "One Shared Standard: M × N → M + N"
                  : "Every AI App × Every Tool = Fragile Glue"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {frame >= schemasCue && !inMcpPhase ? (
                <Pill tone="rose" size="md">
                  SCHEMA DRIFT · AUTH REWRITES
                </Pill>
              ) : null}
              <Pill tone={inMcpPhase ? "emerald" : "rose"} size="lg">
                {inMcpPhase
                  ? collapseProgress > 0.2
                    ? "20 + 100 = 120 (-94%)"
                    : "M + N STANDARD"
                  : frame >= fragileCue
                  ? "20 × 100 = 2,000"
                  : "M × N GLUE"}
              </Pill>
            </div>
          </div>

          {/* Center SVG Graph */}
          <div style={{ position: "relative", width: 1680, height: graphH }}>
            <svg
              width={1680}
              height={graphH}
              viewBox={`0 0 1680 ${graphH}`}
              style={{
                position: "absolute",
                inset: 0,
                opacity: mathOverlayProgress > 0 ? 0.22 : 1,
              }}
            >
              {/* M x N Tangled Rose Mesh (fades out as MCP Bus snaps in) */}
              {AI_APPS.map((_, i) =>
                TOOLS.map((__, j) => {
                  const idx = i * TOOLS.length + j;
                  const threshold = idx / (AI_APPS.length * TOOLS.length);
                  const visible = meshProgress >= threshold * 0.85;
                  if (!visible) return null;
                  const y1 = appY(i);
                  const y2 = toolY(j);
                  const meshOpacity = (1 - busProgress) * 0.58;
                  if (meshOpacity <= 0.02) return null;
                  return (
                    <path
                      key={`mn-${i}-${j}`}
                      d={`M ${leftX + 115} ${y1} C ${leftX + 430} ${y1}, ${rightX - 430} ${y2}, ${
                        rightX - 115
                      } ${y2}`}
                      fill="none"
                      stroke={TOKENS.colors.accentRose}
                      strokeWidth={2}
                      opacity={meshOpacity}
                    />
                  );
                })
              )}

              {/* M + N Clean MCP Bus Lines */}
              {busProgress > 0.02 ? (
                <>
                  {AI_APPS.map((_, i) => {
                    const y1 = appY(i);
                    return (
                      <path
                        key={`m-${i}`}
                        d={`M ${leftX + 115} ${y1} C ${busX - 240} ${y1}, ${busX - 180} ${
                          graphH / 2
                        }, ${busX - 90} ${graphH / 2}`}
                        fill="none"
                        stroke={TOKENS.colors.accent}
                        strokeWidth={3.5}
                        opacity={busProgress}
                      />
                    );
                  })}
                  {TOOLS.map((_, j) => {
                    const y2 = toolY(j);
                    return (
                      <path
                        key={`n-${j}`}
                        d={`M ${busX + 90} ${graphH / 2} C ${busX + 180} ${graphH / 2}, ${
                          busX + 240
                        } ${y2}, ${rightX - 115} ${y2}`}
                        fill="none"
                        stroke={TOKENS.colors.accentEmerald}
                        strokeWidth={3.5}
                        opacity={busProgress}
                      />
                    );
                  })}
                </>
              ) : null}
            </svg>

            {/* Left Column: AI Apps (M) */}
            {AI_APPS.map((app, i) => (
              <div
                key={app}
                style={{
                  position: "absolute",
                  left: leftX - 115,
                  top: appY(i) - 30,
                  width: 230,
                  height: 60,
                  borderRadius: 14,
                  backgroundColor: TOKENS.colors.surface,
                  border: `1.5px solid ${
                    inMcpPhase ? TONE_STYLES.cyan.border : TOKENS.colors.borderStrong
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 18px",
                  opacity: mathOverlayProgress > 0 ? 0.3 : 1,
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 700, color: TOKENS.colors.textPrimary }}>
                  {app}
                </span>
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: TOKENS.colors.accent,
                  }}
                >
                  HOST
                </span>
              </div>
            ))}

            {/* Right Column: Tools (N) */}
            {TOOLS.map((tool, j) => (
              <div
                key={tool}
                style={{
                  position: "absolute",
                  left: rightX - 115,
                  top: toolY(j) - 27,
                  width: 230,
                  height: 54,
                  borderRadius: 14,
                  backgroundColor: TOKENS.colors.surface,
                  border: `1.5px solid ${
                    inMcpPhase ? TONE_STYLES.emerald.border : TOKENS.colors.borderStrong
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 18px",
                  opacity: mathOverlayProgress > 0 ? 0.3 : 1,
                }}
              >
                <span style={{ fontSize: 19, fontWeight: 700, color: TOKENS.colors.textPrimary }}>
                  {tool}
                </span>
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: inMcpPhase ? TOKENS.colors.accentEmerald : TOKENS.colors.textMuted,
                  }}
                >
                  {inMcpPhase ? "MCP" : "API"}
                </span>
              </div>
            ))}

            {/* Central MCP Standard Bus Pill */}
            {busProgress > 0.02 ? (
              <div
                style={{
                  position: "absolute",
                  left: busX - 92,
                  top: graphH / 2 - 115,
                  width: 184,
                  height: 230,
                  borderRadius: 26,
                  backgroundColor: TOKENS.colors.surfaceElevated,
                  border: `2.5px solid ${TOKENS.colors.accent}`,
                  boxShadow: `0 0 48px ${TOKENS.colors.accentGlow}, 0 20px 40px rgba(0,0,0,0.45)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 16,
                  opacity: busProgress,
                  transform: `scale(${interpolate(busProgress, [0, 1], [0.8, 1])})`,
                }}
              >
                <Pill tone="cyan" size="sm" style={{ marginBottom: 10 }}>
                  USB-C
                </Pill>
                <div
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 42,
                    fontWeight: 900,
                    color: TOKENS.colors.textPrimary,
                  }}
                >
                  MCP
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 15,
                    color: TOKENS.colors.textSecondary,
                    lineHeight: 1.3,
                  }}
                >
                  One Shared Protocol
                </div>
              </div>
            ) : null}

            {/* P5 Math Explosion Overlay Cards */}
            {mathOverlayProgress > 0 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 26,
                  opacity: mathOverlayProgress,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 32,
                    width: 1080,
                  }}
                >
                  <div style={slideUpStyle(frame, fps, multiplyCue, 20)}>
                    <Card tone="amber" glow padding={30}>
                      <Pill tone="amber" size="sm" style={{ marginBottom: 12 }}>
                        SMALL ECOSYSTEM
                      </Pill>
                      <div
                        style={{
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 54,
                          fontWeight: 900,
                          color: TOKENS.colors.textPrimary,
                        }}
                      >
                        5 × 10 = <span style={{ color: TOKENS.colors.accentWarm }}>50</span>
                      </div>
                      <div style={{ fontSize: 20, color: TOKENS.colors.textSecondary, marginTop: 8 }}>
                        50 separate custom integrations to build & maintain
                      </div>
                    </Card>
                  </div>

                  <div style={slideUpStyle(frame, fps, fragileCue - 30, 20)}>
                    <Card tone="rose" glow={frame >= fragileCue} padding={30}>
                      <Pill tone="rose" size="sm" style={{ marginBottom: 12 }}>
                        REAL-WORLD SCALE
                      </Pill>
                      <div
                        style={{
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 54,
                          fontWeight: 900,
                          color: TOKENS.colors.textPrimary,
                        }}
                      >
                        20 × 100 = <span style={{ color: TOKENS.colors.accentRose }}>2,000</span>
                      </div>
                      <div style={{ fontSize: 20, color: TOKENS.colors.textSecondary, marginTop: 8 }}>
                        Fragile, duplicated connectors breaking on every API change
                      </div>
                    </Card>
                  </div>
                </div>

                <Card tone="rose" padding={24} style={{ width: 1080 }}>
                  <MeterBar
                    label="Ecosystem Integration Overhead (M × N)"
                    percent={35 + 65 * fragileRamp}
                    tone="rose"
                    valueLabel={`${Math.round(50 + 1950 * fragileRamp).toLocaleString()} links`}
                  />
                </Card>
              </div>
            ) : null}
          </div>

          {/* Bottom Comparison Strip (P6 Collapse Bars) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
              opacity: inMcpPhase ? fadeIn(frame, standardCue + 12, 16) : 0.25,
            }}
          >
            <Card tone="rose" padding={20}>
              <MeterBar
                label="Without MCP (20 Apps × 100 Tools)"
                percent={100}
                tone="rose"
                valueLabel="2,000 links"
                height={20}
              />
            </Card>
            <Card tone="emerald" glow={collapseProgress > 0.3} padding={20}>
              <MeterBar
                label="With MCP (20 Apps + 100 Servers)"
                percent={interpolate(collapseProgress, [0, 1], [100, 6])}
                tone="emerald"
                valueLabel={
                  collapseProgress > 0.5 ? "120 links (-94%)" : "Collapsing..."
                }
                height={20}
              />
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* SceneBeat B: 3-Layer Stack — MCP Wraps APIs & Standardizes Function Calling (P7) */}
      <SceneBeat window={beatB} align="stretch">
        <div style={slideUpStyle(frame, fps, r7.start, 24)}>
          <SectionTitle
            eyebrow="CLEARING UP THE #1 MISCONCEPTION"
            title="MCP Doesn't Replace APIs — It Translates Them for AI"
            subtitle="REST APIs and LLM function calling already existed. MCP is the universal adapter in between."
            tone="cyan"
            style={{ marginBottom: 34 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Top Layer */}
          <div style={slideUpStyle(frame, fps, adapterCue + 10, 20)}>
            <Card
              tone="emerald"
              glow={frame >= adapterCue + 10}
              padding={26}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Pill tone="emerald" size="sm" style={{ marginBottom: 10 }}>
                  TOP LAYER · ANY AI HOST
                </Pill>
                <div style={{ fontSize: 30, fontWeight: 800 }}>
                  Claude · ChatGPT · Cursor · VS Code · Custom Agents
                </div>
              </div>
              <DataChip label="1 Protocol" sublabel="Works everywhere" tone="emerald" />
            </Card>
          </div>

          {/* Middle Layer: MCP Universal Adapter */}
          <div style={slideUpStyle(frame, fps, functionCue, 20)}>
            <Card
              tone="cyan"
              glow={frame >= adapterCue}
              padding={28}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
              }}
            >
              <div>
                <Pill tone="cyan" size="sm" style={{ marginBottom: 10 }}>
                  MIDDLE LAYER · MCP SERVER (UNIVERSAL ADAPTER)
                </Pill>
                <div style={{ fontSize: 32, fontWeight: 900 }}>
                  Standardizes Tool Discovery, Schemas & Function Calls
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <DataChip label="tools/list" sublabel="Discovery" tone="cyan" />
                <DataChip label="tools/call" sublabel="Execution" tone="amber" />
              </div>
            </Card>
          </div>

          {/* Bottom Layer: Existing Infrastructure */}
          <div style={slideUpStyle(frame, fps, replaceCue, 20)}>
            <Card
              tone="neutral"
              padding={26}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Pill tone="neutral" size="sm" style={{ marginBottom: 10 }}>
                  BOTTOM LAYER · YOUR EXISTING INFRASTRUCTURE (UNCHANGED)
                </Pill>
                <div style={{ fontSize: 28, fontWeight: 700, color: TOKENS.colors.textSecondary }}>
                  REST & GraphQL APIs · SQL Databases · Local Files · SaaS Apps
                </div>
              </div>
              <Pill tone="amber" size="md">
                WRAPPED, NOT REPLACED
              </Pill>
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
