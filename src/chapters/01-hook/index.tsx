import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import type { SemanticTone } from "../../theme/tokens";
import {
  clipRange,
  cueFrame,
  fadeIn,
  progressBetween,
  sceneWindow,
  slideUpStyle,
  springAt,
} from "../../ui/motion";
import { Card, Pill, SceneBeat, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

type AppNode = {
  label: string;
  sublabel: string;
  x: number;
  y: number;
};

const APP_NODES: AppNode[] = [
  { label: "Files", sublabel: "Local Docs", x: 185, y: 120 },
  { label: "Notion", sublabel: "Notes & Wiki", x: 135, y: 310 },
  { label: "Slack", sublabel: "Team Chat", x: 185, y: 500 },
  { label: "Google Drive", sublabel: "Cloud Docs", x: 1495, y: 120 },
  { label: "Calendar", sublabel: "Schedule", x: 1545, y: 310 },
  { label: "GitHub", sublabel: "Code & Issues", x: 1495, y: 500 },
];

const ECOSYSTEM_HOSTS = [
  "Claude",
  "ChatGPT",
  "Cursor",
  "VS Code",
  "Gemini",
  "Custom Agents",
];

const ROADMAP_ITEMS: Array<{
  num: string;
  title: string;
  desc: string;
  tone: SemanticTone;
}> = [
  {
    num: "01",
    title: "Why MCP Exists",
    desc: "How one open plug collapses M × N custom glue into M + N.",
    tone: "amber",
  },
  {
    num: "02",
    title: "How It Works",
    desc: "Host, Client, Server, Tools, Resources, Prompts & a live trace.",
    tone: "cyan",
  },
  {
    num: "03",
    title: "How To Use It",
    desc: "Zero-code connectors for everyday users + mcp.json for builders.",
    tone: "emerald",
  },
  {
    num: "04",
    title: "Security & Limits",
    desc: "Context bloat, prompt injection, tool poisoning & guardrails.",
    tone: "rose",
  },
];

export const HookChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c1 = clips[0];
  const c2 = clips[1];
  const c3 = clips[2];

  const r1 = clipRange(c1, chapter.startFrame, 0, 540);
  const r2 = clipRange(c2, chapter.startFrame, r1.end, 550);
  const r3 = clipRange(c3, chapter.startFrame, r2.end, 550);

  // Beat A cues (P1-P2 shared morphing hub diagram)
  const trappedCue = cueFrame(c1, "trapped", 45, chapter.startFrame);
  const copyCue = cueFrame(c1, "copy", 130, chapter.startFrame);
  const protocolCue = cueFrame(c2, "protocol", 30, chapter.startFrame);
  const universalCue = cueFrame(c2, "universal", 180, chapter.startFrame);

  // Beat B cues (P3 roadmap strip)
  const existsCue = cueFrame(c3, "exists", 120, chapter.startFrame);
  const underCue = cueFrame(c3, "under", 175, chapter.startFrame);
  const todayCue = cueFrame(c3, "today", 230, chapter.startFrame);
  const securityCue = cueFrame(c3, "security", 285, chapter.startFrame);

  const beatA = sceneWindow(frame, r1.start, r3.start, {
    fadeInFrames: 12,
    fadeOutFrames: 10,
  });
  const beatB = sceneWindow(frame, r3.start, r3.end, {
    fadeInFrames: 12,
    keepAtEnd: true,
  });

  const trappedGlow = fadeIn(frame, trappedCue, 16);
  const copyPulse = progressBetween(frame, copyCue, copyCue + 60);
  const mcpMorph = springAt(frame, fps, protocolCue, { damping: 16, stiffness: 120 });
  const snapLinks = progressBetween(frame, universalCue, universalCue + 36);

  const isConnected = frame >= protocolCue;
  const centerX = 840;
  const centerY = 310;

  const roadmapCues = [existsCue, underCue, todayCue, securityCue];

  return (
    <Stage
      chapterIndex="01"
      chapterTitle={chapter.title}
      tone={isConnected ? "cyan" : "rose"}
      legend={[
        { label: "ISOLATED", tone: "rose" },
        { label: "MCP STANDARD", tone: "cyan" },
      ]}
    >
      {/* SceneBeat A: Trapped AI Box morphing into Connected MCP Hub */}
      <SceneBeat window={beatA} align="stretch">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          {/* Top hero header switching from Problem -> Solution */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              minHeight: 112,
            }}
          >
            <div style={slideUpStyle(frame, fps, r1.start, 22)}>
              <div
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: isConnected ? TOKENS.colors.accent : TOKENS.colors.accentRose,
                  marginBottom: 8,
                }}
              >
                {isConnected ? "MODEL CONTEXT PROTOCOL (MCP)" : "THE EVERYDAY AI BOTTLENECK"}
              </div>
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 900,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.08,
                  color: TOKENS.colors.textPrimary,
                }}
              >
                {isConnected ? "MCP Explained — USB-C for AI" : "Brilliant AI, Trapped in a Chat Box"}
              </div>
            </div>

            <div style={{ opacity: isConnected ? fadeIn(frame, protocolCue, 14) : trappedGlow }}>
              <Pill tone={isConnected ? "cyan" : "rose"} size="lg">
                {isConnected ? "1 UNIVERSAL PORT" : "HUMAN COPY-PASTE BRIDGE"}
              </Pill>
            </div>
          </div>

          {/* Center SVG + Radial App Hub */}
          <div style={{ position: "relative", width: 1680, height: 600 }}>
            <svg
              width={1680}
              height={600}
              viewBox="0 0 1680 600"
              style={{ position: "absolute", inset: 0 }}
            >
              {/* Outer MCP ring glow once connected */}
              <circle
                cx={centerX}
                cy={centerY}
                r={interpolate(mcpMorph, [0, 1], [110, 195])}
                fill="none"
                stroke={TONE_STYLES.cyan.border}
                strokeWidth={2}
                strokeDasharray="6 8"
                opacity={mcpMorph * 0.7}
              />

              {/* Radial connection lines to the 6 external apps */}
              {APP_NODES.map((node, index) => {
                const startX = node.x < centerX ? node.x + 125 : node.x - 125;
                const targetX = node.x < centerX ? centerX - 165 : centerX + 165;
                const midX = (startX + targetX) / 2;
                const midY = (node.y + centerY) / 2;

                const appDelay = index * 0.12;
                const flashOpacity =
                  !isConnected && copyPulse > appDelay
                    ? 0.45 + 0.55 * Math.sin((frame - copyCue - index * 6) * 0.16) ** 2
                    : 0.35;

                const solidWidth = interpolate(snapLinks, [0, 1], [2.5, 4]);
                const packetPos = ((frame - universalCue + index * 14) % 48) / 48;

                return (
                  <g key={node.label}>
                    {!isConnected ? (
                      <>
                        <line
                          x1={startX}
                          y1={node.y}
                          x2={targetX}
                          y2={centerY}
                          stroke={TOKENS.colors.accentRose}
                          strokeWidth={2.5}
                          strokeDasharray="10 10"
                          opacity={flashOpacity}
                        />
                        {copyPulse > appDelay ? (
                          <g opacity={fadeIn(frame, copyCue + index * 6, 10)}>
                            <circle
                              cx={midX}
                              cy={midY}
                              r={15}
                              fill={TOKENS.colors.background}
                              stroke={TOKENS.colors.accentRose}
                              strokeWidth={2}
                            />
                            <text
                              x={midX}
                              y={midY + 6}
                              textAnchor="middle"
                              fill={TOKENS.colors.accentRose}
                              fontFamily={TOKENS.fonts.mono}
                              fontSize={16}
                              fontWeight={800}
                            >
                              ✕
                            </text>
                          </g>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <path
                          d={`M ${startX} ${node.y} C ${midX} ${node.y}, ${midX} ${centerY}, ${targetX} ${centerY}`}
                          fill="none"
                          stroke={TOKENS.colors.accent}
                          strokeWidth={solidWidth}
                          opacity={0.35 + 0.65 * snapLinks}
                        />
                        {snapLinks > 0.35 ? (
                          <circle
                            cx={interpolate(packetPos, [0, 1], [startX, targetX])}
                            cy={interpolate(packetPos, [0, 1], [node.y, centerY])}
                            r={6}
                            fill={TOKENS.colors.accentEmerald}
                            opacity={0.9}
                          />
                        ) : null}
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* 6 Surrounding App Cards */}
            {APP_NODES.map((node, index) => {
              const appear = slideUpStyle(frame, fps, r1.start + 6 + index * 4, 18);
              const tone: SemanticTone = isConnected ? "emerald" : "neutral";
              const t = TONE_STYLES[tone];
              return (
                <div
                  key={node.label}
                  style={{
                    position: "absolute",
                    left: node.x - 125,
                    top: node.y - 44,
                    width: 250,
                    height: 88,
                    borderRadius: 18,
                    backgroundColor: TOKENS.colors.surface,
                    border: `1.5px solid ${isConnected ? t.border : TOKENS.colors.borderStrong}`,
                    boxShadow: isConnected
                      ? `0 0 24px ${t.glow}, 0 12px 24px rgba(0,0,0,0.35)`
                      : "0 12px 24px rgba(0,0,0,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 20px",
                    ...appear,
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: TOKENS.colors.textPrimary,
                    }}
                  >
                    {node.label}
                  </div>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 14,
                      color: isConnected ? t.main : TOKENS.colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {isConnected ? "MCP Connected" : node.sublabel}
                  </div>
                </div>
              );
            })}

            {/* Center AI Model Box / Connected MCP Hub */}
            <div
              style={{
                position: "absolute",
                left: centerX - 165,
                top: centerY - 125,
                width: 330,
                height: 250,
                borderRadius: 28,
                backgroundColor: TOKENS.colors.surfaceElevated,
                border: `2.5px solid ${
                  isConnected
                    ? TOKENS.colors.accent
                    : trappedGlow > 0.2
                    ? TOKENS.colors.accentRose
                    : TOKENS.colors.borderStrong
                }`,
                boxShadow: isConnected
                  ? `0 0 56px ${TOKENS.colors.accentGlow}, 0 24px 48px rgba(0,0,0,0.45)`
                  : `0 0 ${Math.round(38 * trappedGlow)}px ${TOKENS.colors.accentRoseGlow}, 0 20px 44px rgba(0,0,0,0.45)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                textAlign: "center",
                transform: `scale(${interpolate(mcpMorph, [0, 0.5, 1], [1, 1.04, 1])})`,
              }}
            >
              <Pill tone={isConnected ? "cyan" : "rose"} size="sm" style={{ marginBottom: 14 }}>
                {isConnected ? "OPEN STANDARD" : "ISOLATED CHAT BOX"}
              </Pill>
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  color: TOKENS.colors.textPrimary,
                }}
              >
                {isConnected ? "AI + MCP Hub" : "AI Model"}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 18,
                  lineHeight: 1.35,
                  color: TOKENS.colors.textSecondary,
                }}
              >
                {isConnected
                  ? "Direct, safe access to live tools & real context"
                  : "Smart reasoning, zero direct access to your apps"}
              </div>
            </div>
          </div>

          {/* Bottom Ecosystem Host Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              minHeight: 52,
              opacity: fadeIn(frame, protocolCue + 10, 16),
            }}
          >
            <span
              style={{
                fontFamily: TOKENS.fonts.mono,
                fontSize: 16,
                fontWeight: 700,
                color: TOKENS.colors.textMuted,
                letterSpacing: "0.06em",
                marginRight: 6,
              }}
            >
              SUPPORTED ACROSS:
            </span>
            {ECOSYSTEM_HOSTS.map((host) => (
              <Pill key={host} tone="cyan" size="sm">
                {host}
              </Pill>
            ))}
          </div>
        </div>
      </SceneBeat>

      {/* SceneBeat B: 4-Card Video Roadmap */}
      <SceneBeat window={beatB} align="stretch">
        <div style={slideUpStyle(frame, fps, r3.start, 24)}>
          <SectionTitle
            eyebrow="IN THE NEXT 10 MINUTES"
            title="Everything You Need to Understand & Use MCP"
            subtitle="Designed for everyday AI users and software builders alike — zero fluff, clear mental models."
            tone="cyan"
            style={{ marginBottom: 40 }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}
        >
          {ROADMAP_ITEMS.map((item, idx) => {
            const cue = roadmapCues[idx] ?? r3.start + idx * 30;
            const active = frame >= cue;
            const t = TONE_STYLES[item.tone];
            return (
              <div
                key={item.num}
                style={{
                  ...slideUpStyle(frame, fps, Math.min(r3.start + 8 + idx * 5, cue), 22),
                  opacity: active ? 1 : 0.45,
                  transform: `${slideUpStyle(frame, fps, Math.min(r3.start + 8 + idx * 5, cue), 22).transform} scale(${
                    active ? 1.02 : 0.98
                  })`,
                }}
              >
                <Card
                  tone={active ? item.tone : "neutral"}
                  glow={active}
                  padding={28}
                  style={{ height: 310, display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 32,
                      fontWeight: 900,
                      color: t.main,
                      marginBottom: 18,
                    }}
                  >
                    {item.num}
                  </div>
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 800,
                      color: TOKENS.colors.textPrimary,
                      marginBottom: 14,
                      lineHeight: 1.18,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      lineHeight: 1.45,
                      color: TOKENS.colors.textSecondary,
                    }}
                  >
                    {item.desc}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </SceneBeat>
    </Stage>
  );
};
