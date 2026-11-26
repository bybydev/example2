import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import { NodeBox, SvgPacket } from "../../ui/diagrams";
import {
  clipRange,
  cueFrame,
  fadeIn,
  progressBetween,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import { Card, DataChip, MeterBar, Pill, SceneBeat, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

export const TransportsChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c20 = clips[0];
  const c21 = clips[1];
  const c22 = clips[2];

  const r20 = clipRange(c20, chapter.startFrame, 0, 620);
  const r21 = clipRange(c21, chapter.startFrame, r20.end, 630);
  const r22 = clipRange(c22, chapter.startFrame, r21.end, 620);

  const subprocessCue = cueFrame(c20, "subprocess", 230, chapter.startFrame);
  const privateCue = cueFrame(c20, "private", 330, chapter.startFrame);
  const cloudCue = cueFrame(c21, "cloud", 40, chapter.startFrame);
  const securelyCue = cueFrame(c21, "securely", 260, chapter.startFrame);
  const laptopCue = cueFrame(c22, "laptop", 120, chapter.startFrame);
  const cloudChoiceCue = cueFrame(c22, "cloud", 230, chapter.startFrame);
  const sharingCue = cueFrame(c22, "sharing", 340, chapter.startFrame);

  const window = sceneWindow(frame, r20.start, r22.end, {
    fadeInFrames: 12,
    keepAtEnd: true,
  });

  const showRemote = frame >= r21.start;
  const showOauth = frame >= securelyCue;
  const localPulse = ((frame - r20.start) % 44) / 44;
  const remotePulse = ((frame - r21.start + 20) % 48) / 48;

  const privacyBar = progressBetween(frame, laptopCue, laptopCue + 36);
  const easeBar = progressBetween(frame, cloudChoiceCue, cloudChoiceCue + 36);
  const teamBar = progressBetween(frame, sharingCue, sharingCue + 36);

  return (
    <Stage
      chapterIndex="06"
      chapterTitle={chapter.title}
      tone="amber"
      legend={[
        { label: "LOCAL (STDIO)", tone: "cyan" },
        { label: "REMOTE (STREAMABLE HTTP)", tone: "amber" },
        { label: "SECURITY / WINS", tone: "emerald" },
      ]}
    >
      <SceneBeat window={window} align="stretch">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div style={slideUpStyle(frame, fps, r20.start, 20)}>
            <SectionTitle
              eyebrow="WHERE DO MCP SERVERS RUN?"
              title="Local (stdio) vs. Remote (Streamable HTTP)"
              subtitle="Two clean transports cover both private laptop workflows and shared cloud workspaces."
              tone="amber"
              style={{ marginBottom: 6 }}
            />
          </div>

          {/* Two-Column Transport Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            {/* Left Card: Local stdio */}
            <div style={slideUpStyle(frame, fps, r20.start + 6, 22)}>
              <Card tone="cyan" glow padding={28} style={{ height: 430, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <Pill tone="cyan" size="md">
                      LOCAL · stdio
                    </Pill>
                    <Pill tone="emerald" size="sm" style={{ opacity: fadeIn(frame, privateCue, 14) }}>
                      PRIVATE · ZERO NETWORK
                    </Pill>
                  </div>

                  <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
                    Runs Directly on Your Machine
                  </div>
                  <div style={{ fontSize: 18, color: TOKENS.colors.textSecondary, lineHeight: 1.4 }}>
                    The Host spawns a tiny local subprocess and exchanges JSON-RPC lines over stdin &amp; stdout.
                  </div>
                </div>

                {/* Mini Local Pipe Diagram */}
                <div style={{ position: "relative", height: 112, margin: "12px 0" }}>
                  <svg width={760} height={112} viewBox="0 0 760 112" style={{ position: "absolute", inset: 0 }}>
                    <line x1={260} y1={56} x2={490} y2={56} stroke={TOKENS.colors.accent} strokeWidth={4} />
                    <text
                      x={375}
                      y={42}
                      textAnchor="middle"
                      fill={TOKENS.colors.accent}
                      fontFamily={TOKENS.fonts.mono}
                      fontSize={14}
                      fontWeight={700}
                    >
                      stdin / stdout
                    </text>
                    {frame >= subprocessCue ? (
                      <SvgPacket x1={260} y1={56} x2={490} y2={56} progress={localPulse} tone="cyan" radius={7} />
                    ) : null}
                  </svg>
                  <div style={{ position: "absolute", left: 0, top: 14, width: 256 }}>
                    <NodeBox title="AI Host App" tag="YOUR LAPTOP" tone="cyan" compact />
                  </div>
                  <div style={{ position: "absolute", right: 0, top: 14, width: 266 }}>
                    <NodeBox
                      title="Local Subprocess"
                      tag="npx / uvx / binary"
                      tone="emerald"
                      glow={frame >= subprocessCue}
                      compact
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <DataChip label="Files" tone="cyan" style={{ padding: "8px 14px", fontSize: 16 }} />
                  <DataChip label="Notes" tone="cyan" style={{ padding: "8px 14px", fontSize: 16 }} />
                  <DataChip label="Git Repo" tone="cyan" style={{ padding: "8px 14px", fontSize: 16 }} />
                  <DataChip label="SQLite" tone="cyan" style={{ padding: "8px 14px", fontSize: 16 }} />
                </div>
              </Card>
            </div>

            {/* Right Card: Remote Streamable HTTP */}
            <div
              style={{
                ...slideUpStyle(frame, fps, cloudCue, 22),
                opacity: showRemote ? fadeIn(frame, cloudCue, 16) : 0.22,
              }}
            >
              <Card
                tone={showRemote ? "amber" : "neutral"}
                glow={showRemote}
                padding={28}
                style={{ height: 430, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <Pill tone="amber" size="md">
                      REMOTE · Streamable HTTP
                    </Pill>
                    <Pill tone="neutral" size="sm">
                      REPLACES LEGACY SSE
                    </Pill>
                  </div>

                  <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
                    Hosted in the Cloud Behind a URL
                  </div>
                  <div style={{ fontSize: 18, color: TOKENS.colors.textSecondary, lineHeight: 1.4 }}>
                    Connect over standard HTTPS with OAuth 2.1 sign-in and live streaming — zero terminal setup.
                  </div>
                </div>

                {/* Mini Cloud Pipe Diagram */}
                <div style={{ position: "relative", height: 112, margin: "12px 0" }}>
                  <svg width={760} height={112} viewBox="0 0 760 112" style={{ position: "absolute", inset: 0 }}>
                    <line
                      x1={260}
                      y1={56}
                      x2={490}
                      y2={56}
                      stroke={showOauth ? TOKENS.colors.accentEmerald : TOKENS.colors.accentWarm}
                      strokeWidth={4}
                    />
                    <rect
                      x={306}
                      y={18}
                      width={138}
                      height={26}
                      rx={13}
                      fill={showOauth ? TONE_STYLES.emerald.bg : TOKENS.colors.background}
                      stroke={showOauth ? TOKENS.colors.accentEmerald : TOKENS.colors.accentWarm}
                      strokeWidth={1.5}
                    />
                    <text
                      x={375}
                      y={35}
                      textAnchor="middle"
                      fill={showOauth ? TOKENS.colors.accentEmerald : TOKENS.colors.accentWarm}
                      fontFamily={TOKENS.fonts.mono}
                      fontSize={13}
                      fontWeight={800}
                    >
                      {showOauth ? "HTTPS + OAuth 2.1" : "HTTPS Stream"}
                    </text>
                    {showRemote ? (
                      <SvgPacket
                        x1={260}
                        y1={56}
                        x2={490}
                        y2={56}
                        progress={remotePulse}
                        tone={showOauth ? "emerald" : "amber"}
                        radius={7}
                      />
                    ) : null}
                  </svg>
                  <div style={{ position: "absolute", left: 0, top: 14, width: 256 }}>
                    <NodeBox title="Any AI Host" tag="DESKTOP / WEB" tone="amber" compact />
                  </div>
                  <div style={{ position: "absolute", right: 0, top: 14, width: 266 }}>
                    <NodeBox
                      title="Cloud MCP Server"
                      tag="https://mcp.app.com"
                      tone={showOauth ? "emerald" : "amber"}
                      glow={showOauth}
                      compact
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <DataChip label="Notion" tone="amber" style={{ padding: "8px 14px", fontSize: 16 }} />
                  <DataChip label="Slack" tone="amber" style={{ padding: "8px 14px", fontSize: 16 }} />
                  <DataChip label="Linear" tone="amber" style={{ padding: "8px 14px", fontSize: 16 }} />
                  <DataChip label="Company API" tone="amber" style={{ padding: "8px 14px", fontSize: 16 }} />
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom 3-Metric Comparison Strip (P22) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
              opacity: fadeIn(frame, r22.start, 16),
            }}
          >
            <Card tone="cyan" padding={20}>
              <MeterBar
                label="Local Privacy & Speed (stdio)"
                percent={96 * privacyBar}
                tone="cyan"
                valueLabel="Laptop Local"
                height={18}
              />
            </Card>
            <Card tone="amber" padding={20}>
              <MeterBar
                label="Zero-Install Ease (HTTP)"
                percent={94 * easeBar}
                tone="amber"
                valueLabel="1-Click Cloud"
                height={18}
              />
            </Card>
            <Card tone="emerald" padding={20}>
              <MeterBar
                label="Org-Wide Team Sharing (HTTP)"
                percent={95 * teamBar}
                tone="emerald"
                valueLabel="Central Server"
                height={18}
              />
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
