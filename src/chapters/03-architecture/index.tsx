import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import { CodePanel, NodeBox, SvgPacket } from "../../ui/diagrams";
import type { CodeLine } from "../../ui/diagrams";
import {
  clipRange,
  cueFrame,
  fadeIn,
  progressBetween,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import { Card, Pill, SceneBeat, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const SERVERS = [
  { name: "Files Server", scope: "Local Workspace", port: "CLIENT #1" },
  { name: "Slack Server", scope: "Team Channels", port: "CLIENT #2" },
  { name: "Notion Server", scope: "Docs & Wiki", port: "CLIENT #3" },
];

const HANDSHAKE_LINES: CodeLine[] = [
  { text: "// 1. Client -> Server (JSON-RPC 2.0)", tone: "neutral" },
  { text: '{ "jsonrpc": "2.0", "id": 1, "method": "initialize",', tone: "cyan", highlight: true },
  { text: '  "params": { "protocolVersion": "2025-03-26", "capabilities": {} } }', tone: "cyan" },
  { text: "", tone: "neutral" },
  { text: "// 2. Server -> Client (Capabilities Announced)", tone: "neutral" },
  { text: '{ "jsonrpc": "2.0", "id": 1, "result": {', tone: "emerald", highlight: true },
  { text: '  "capabilities": { "tools": {}, "resources": {}, "prompts": {} } } }', tone: "emerald" },
];

export const ArchitectureChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c8 = clips[0];
  const c9 = clips[1];
  const c10 = clips[2];
  const c11 = clips[3];

  const r8 = clipRange(c8, chapter.startFrame, 0, 620);
  const r9 = clipRange(c9, chapter.startFrame, r8.end, 610);
  const r10 = clipRange(c10, chapter.startFrame, r9.end, 610);
  const r11 = clipRange(c11, chapter.startFrame, r10.end, 610);

  // Beat A cues (P8-P9)
  const hostCue = cueFrame(c8, "host", 60, chapter.startFrame);
  const permissionCue = cueFrame(c8, "permission", 260, chapter.startFrame);
  const clientCue = cueFrame(c9, "client", 45, chapter.startFrame);
  const serverCue = cueFrame(c9, "server", 190, chapter.startFrame);

  // Beat B cues (P10)
  const messagesCue = cueFrame(c10, "messages", 110, chapter.startFrame);
  const handshakeCue = cueFrame(c10, "handshake", 210, chapter.startFrame);

  // Beat C cues (P11)
  const isolationCue = cueFrame(c11, "isolation", 60, chapter.startFrame);
  const crashesCue = cueFrame(c11, "crashes", 240, chapter.startFrame);

  const beatA = sceneWindow(frame, r8.start, r10.start, {
    fadeInFrames: 12,
    fadeOutFrames: 10,
  });
  const beatB = sceneWindow(frame, r10.start, r11.start, {
    fadeInFrames: 12,
    fadeOutFrames: 10,
  });
  const beatC = sceneWindow(frame, r11.start, r11.end, {
    fadeInFrames: 12,
    keepAtEnd: true,
  });

  const showClients = frame >= clientCue;
  const showServers = frame >= serverCue;
  const lineDraw = progressBetween(frame, serverCue, serverCue + 32);

  const reqPacket = progressBetween(frame, handshakeCue, handshakeCue + 42);
  const resPacket = progressBetween(frame, handshakeCue + 46, handshakeCue + 88);
  const codeReveal = progressBetween(frame, messagesCue, handshakeCue + 75);

  const serverCrashed = frame >= crashesCue;

  return (
    <Stage
      chapterIndex="03"
      chapterTitle={chapter.title}
      tone="cyan"
      legend={[
        { label: "HOST / CLIENT", tone: "cyan" },
        { label: "MCP SERVER", tone: "emerald" },
        { label: "JSON-RPC 2.0", tone: "amber" },
      ]}
    >
      {/* SceneBeat A: Progressive 3-Tier Host -> Clients -> Servers */}
      <SceneBeat window={beatA} align="stretch">
        <div style={slideUpStyle(frame, fps, r8.start, 20)}>
          <SectionTitle
            eyebrow="THE 3 ROLES INSIDE MCP"
            title="Host, Client & Server — Clean 1-to-1 Wiring"
            subtitle="The Host is your AI app. Inside it, each Client connects 1:1 to a single focused MCP Server."
            tone="cyan"
            style={{ marginBottom: 28 }}
          />
        </div>

        <div style={{ position: "relative", width: 1680, height: 590 }}>
          {/* SVG 1-to-1 connectors */}
          <svg
            width={1680}
            height={590}
            viewBox="0 0 1680 590"
            style={{ position: "absolute", inset: 0 }}
          >
            {SERVERS.map((srv, idx) => {
              const y = 115 + idx * 180;
              const x1 = 960;
              const x2 = 1200;
              const drawX = x1 + (x2 - x1) * lineDraw;
              const pkt = ((frame - serverCue + idx * 15) % 45) / 45;
              return (
                <g key={srv.name} opacity={showServers ? 1 : 0}>
                  <line
                    x1={x1}
                    y1={y}
                    x2={drawX}
                    y2={y}
                    stroke={TOKENS.colors.accent}
                    strokeWidth={4}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={y - 14}
                    textAnchor="middle"
                    fill={TOKENS.colors.textSecondary}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={14}
                    fontWeight={700}
                  >
                    1 : 1 SESSION
                  </text>
                  {lineDraw >= 1 ? (
                    <SvgPacket x1={x1} y1={y} x2={x2} y2={y} progress={pkt} tone="cyan" radius={6} />
                  ) : null}
                </g>
              );
            })}
          </svg>

          {/* Left/Center: Large MCP HOST Container */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 10,
              width: 980,
              height: 560,
              ...slideUpStyle(frame, fps, Math.min(r8.start + 6, hostCue), 22),
            }}
          >
            <Card
              tone="cyan"
              glow
              padding={28}
              style={{
                height: "100%",
                display: "grid",
                gridTemplateColumns: "1.05fr 0.95fr",
                gap: 24,
              }}
            >
              {/* Host Core Column */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <Pill tone="cyan" size="md" style={{ marginBottom: 14 }}>
                    MCP HOST (YOUR AI APP)
                  </Pill>
                  <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 10 }}>
                    Claude · ChatGPT · Cursor · VS Code
                  </div>
                  <div style={{ fontSize: 19, color: TOKENS.colors.textSecondary, lineHeight: 1.4 }}>
                    Manages the chat UI, calls the LLM, and owns every security check.
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <NodeBox title="Chat & Workspace UI" tag="INTERFACE" tone="neutral" compact />
                  <NodeBox title="Language Model (LLM)" tag="REASONING" tone="cyan" compact />
                  <NodeBox
                    title="Permission & Approval Gate"
                    tag="SECURITY CONTROL"
                    tone="amber"
                    glow={frame >= permissionCue}
                    compact
                  />
                </div>
              </div>

              {/* Dedicated 1:1 Clients Column inside the Host */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderLeft: `1px dashed ${TOKENS.colors.borderStrong}`,
                  paddingLeft: 24,
                }}
              >
                {SERVERS.map((srv, idx) => (
                  <div
                    key={srv.port}
                    style={{
                      opacity: showClients ? fadeIn(frame, clientCue + idx * 8, 12) : 0.18,
                      transform: `translateY(${showClients ? 0 : 10}px)`,
                    }}
                  >
                    <NodeBox
                      tag={srv.port}
                      title="MCP Client"
                      subtitle={`Dedicated translator for ${srv.name.split(" ")[0]}`}
                      tone={showClients ? "cyan" : "neutral"}
                      glow={showClients}
                      compact
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: 3 External MCP Servers */}
          <div
            style={{
              position: "absolute",
              left: 1200,
              top: 22,
              width: 480,
              height: 540,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {SERVERS.map((srv, idx) => (
              <div
                key={srv.name}
                style={{
                  opacity: showServers ? fadeIn(frame, serverCue + idx * 10, 14) : 0,
                  ...slideUpStyle(frame, fps, serverCue + idx * 10, 18),
                }}
              >
                <NodeBox
                  tag="MCP SERVER"
                  title={srv.name}
                  subtitle={`Focused capability · ${srv.scope}`}
                  tone="emerald"
                  glow
                />
              </div>
            ))}
          </div>
        </div>
      </SceneBeat>

      {/* SceneBeat B: Zoomed JSON-RPC 2.0 Initialize Handshake (P10) */}
      <SceneBeat window={beatB} align="stretch">
        <div style={slideUpStyle(frame, fps, r10.start, 20)}>
          <SectionTitle
            eyebrow="THE WIRE LANGUAGE"
            title="JSON-RPC 2.0 & The Initialize Handshake"
            subtitle="Before doing real work, Client and Server agree on a protocol version and declare capabilities."
            tone="amber"
            style={{ marginBottom: 24 }}
          />
        </div>

        {/* Top Animated Link */}
        <div style={{ position: "relative", width: 1680, height: 190, marginBottom: 24 }}>
          <svg width={1680} height={190} viewBox="0 0 1680 190" style={{ position: "absolute", inset: 0 }}>
            <line
              x1={380}
              y1={70}
              x2={1300}
              y2={70}
              stroke={TONE_STYLES.cyan.border}
              strokeWidth={3.5}
            />
            <line
              x1={1300}
              y1={125}
              x2={380}
              y2={125}
              stroke={TONE_STYLES.emerald.border}
              strokeWidth={3.5}
            />
            <text
              x={840}
              y={52}
              textAnchor="middle"
              fill={TOKENS.colors.accent}
              fontFamily={TOKENS.fonts.mono}
              fontSize={16}
              fontWeight={700}
            >
              1. initialize (protocolVersion, clientInfo) →
            </text>
            <text
              x={840}
              y={156}
              textAnchor="middle"
              fill={TOKENS.colors.accentEmerald}
              fontFamily={TOKENS.fonts.mono}
              fontSize={16}
              fontWeight={700}
            >
              ← 2. capabilities (tools, resources, prompts)
            </text>
            <SvgPacket
              x1={380}
              y1={70}
              x2={1300}
              y2={70}
              progress={reqPacket}
              tone="cyan"
              radius={10}
              label="initialize"
            />
            <SvgPacket
              x1={1300}
              y1={125}
              x2={380}
              y2={125}
              progress={resPacket}
              tone="emerald"
              radius={10}
              label="capabilities"
            />
          </svg>

          <div style={{ position: "absolute", left: 0, top: 24, width: 380 }}>
            <NodeBox tag="INSIDE HOST" title="MCP Client" subtitle="Initiates session" tone="cyan" glow />
          </div>
          <div style={{ position: "absolute", right: 0, top: 24, width: 380 }}>
            <NodeBox
              tag="EXTERNAL PROCESS / URL"
              title="MCP Server"
              subtitle="Advertises capabilities"
              tone="emerald"
              glow
            />
          </div>
        </div>

        {/* Bottom JSON-RPC Inspector */}
        <div style={slideUpStyle(frame, fps, messagesCue, 18)}>
          <CodePanel
            title="json-rpc-2.0-handshake.json"
            badge="CAPABILITY NEGOTIATION"
            tone="amber"
            lines={HANDSHAKE_LINES}
            revealProgress={Math.max(0.25, codeReveal)}
            fontSize={20}
          />
        </div>
      </SceneBeat>

      {/* SceneBeat C: 1-to-1 Session Isolation Spotlight (P11) */}
      <SceneBeat window={beatC} align="stretch">
        <div style={slideUpStyle(frame, fps, r11.start, 20)}>
          <SectionTitle
            eyebrow="WHY 1 CLIENT PER SERVER?"
            title="Scoped Permissions & Fault Isolation"
            subtitle="Servers never share context with each other — and if one crashes, the rest keep running."
            tone={serverCrashed ? "emerald" : "cyan"}
            style={{ marginBottom: 34 }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {SERVERS.map((srv, idx) => {
            const isFaulty = idx === 1 && serverCrashed;
            const tone = isFaulty ? "rose" : "emerald";
            const showWall = frame >= isolationCue;
            return (
              <div key={srv.name} style={slideUpStyle(frame, fps, r11.start + idx * 8, 22)}>
                <Card
                  tone={tone}
                  glow
                  padding={28}
                  style={{
                    height: 430,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Pill tone={isFaulty ? "rose" : "cyan"} size="sm">
                      {srv.port}
                    </Pill>
                    <Pill tone={tone} size="sm">
                      {isFaulty ? "OFFLINE / CRASHED" : "HEALTHY"}
                    </Pill>
                  </div>

                  <div style={{ textAlign: "center", padding: "18px 0" }}>
                    <div
                      style={{
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 16,
                        color: showWall ? TONE_STYLES[tone].main : TOKENS.colors.textMuted,
                        marginBottom: 8,
                      }}
                    >
                      {showWall ? "── ISOLATED SANDBOX ──" : "1:1 CONNECTION"}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 10 }}>
                      {srv.name}
                    </div>
                    <div style={{ fontSize: 20, color: TOKENS.colors.textSecondary }}>
                      {isFaulty
                        ? "Session terminated cleanly — zero impact on sibling servers."
                        : `Only sees scoped ${srv.scope.toLowerCase()} permissions.`}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      backgroundColor: TONE_STYLES[tone].bg,
                      border: `1px solid ${TONE_STYLES[tone].border}`,
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 15,
                      fontWeight: 700,
                      color: TONE_STYLES[tone].main,
                      textAlign: "center",
                    }}
                  >
                    {isFaulty ? "CONTAINED FAILURE" : "RUNNING UNINTERRUPTED"}
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
