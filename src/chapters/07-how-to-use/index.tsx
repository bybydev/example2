import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import type { SemanticTone } from "../../theme/tokens";
import { CheckRow, CodePanel } from "../../ui/diagrams";
import type { CodeLine } from "../../ui/diagrams";
import {
  clipRange,
  cueFrame,
  fadeIn,
  progressBetween,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import { Card, DataChip, Pill, SceneBeat, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const NO_CODE_CONNECTORS = [
  { label: "Notion", detail: "Search pages & draft notes", status: "OAuth Connected" },
  { label: "Google Drive", detail: "Read docs & quarterly plans", status: "OAuth Connected" },
  { label: "Calendar", detail: "Check availability & schedule", status: "OAuth Connected" },
  { label: "Slack", detail: "Summarize channels & threads", status: "OAuth Connected" },
];

const MCP_CONFIG_LINES: CodeLine[] = [
  { text: '{', tone: "neutral" },
  { text: '  "mcpServers": {', tone: "cyan", highlight: true },
  { text: '    "local-notes": {', tone: "emerald" },
  { text: '      "command": "npx",', tone: "neutral" },
  { text: '      "args": ["-y", "@mcp/server-filesystem", "~/Notes"]', tone: "cyan" },
  { text: '    },', tone: "neutral" },
  { text: '    "notion": {', tone: "amber" },
  { text: '      "url": "https://mcp.notion.com/mcp"', tone: "amber", highlight: true },
  { text: '    }', tone: "neutral" },
  { text: '  }', tone: "cyan" },
  { text: '}', tone: "neutral" },
];

const STARTER_STEPS: Array<{
  step: string;
  title: string;
  desc: string;
  badge: string;
  tone: SemanticTone;
}> = [
  {
    step: "STEP 01",
    title: "Pick One AI Host",
    desc: "Start with the app you already open every day — Claude, ChatGPT, Cursor, or VS Code.",
    badge: "ZERO SWITCHING COST",
    tone: "cyan",
  },
  {
    step: "STEP 02",
    title: "Add 1–2 Trusted Read-Only Servers",
    desc: "Connect your notes, docs, or knowledge base first so you get immediate value with low risk.",
    badge: "START READ-ONLY",
    tone: "emerald",
  },
  {
    step: "STEP 03",
    title: "Graduate to Writes & Custom Servers",
    desc: "Enable write actions once the workflow proves reliable — or build a 30-line server for custom tools.",
    badge: "SCALE SAFELY",
    tone: "amber",
  },
];

export const HowToUseChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c23 = clips[0];
  const c24 = clips[1];
  const c25 = clips[2];

  const r23 = clipRange(c23, chapter.startFrame, 0, 560);
  const r24 = clipRange(c24, chapter.startFrame, r23.end, 570);
  const r25 = clipRange(c25, chapter.startFrame, r24.end, 570);

  // Beat A cues (P23-P24)
  const connectorsCue = cueFrame(c23, "connectors", 210, chapter.startFrame);
  const toggleCue = cueFrame(c23, "toggle", 320, chapter.startFrame);
  const configCue = cueFrame(c24, "config", 140, chapter.startFrame);
  const linesCue = cueFrame(c24, "lines", 330, chapter.startFrame);

  // Beat B cues (P25)
  const habitCue = cueFrame(c25, "habit", 30, chapter.startFrame);
  const trustedCue = cueFrame(c25, "trusted", 200, chapter.startFrame);
  const writesCue = cueFrame(c25, "writes", 340, chapter.startFrame);

  const beatA = sceneWindow(frame, r23.start, r25.start, {
    fadeInFrames: 12,
    fadeOutFrames: 10,
  });
  const beatB = sceneWindow(frame, r25.start, r25.end, {
    fadeInFrames: 12,
    keepAtEnd: true,
  });

  const showBuilder = frame >= r24.start;
  const configReveal = progressBetween(frame, configCue - 20, configCue + 75);
  const stepCues = [habitCue, trustedCue, writesCue];

  return (
    <Stage
      chapterIndex="07"
      chapterTitle={chapter.title}
      tone="emerald"
      legend={[
        { label: "NO-CODE USERS", tone: "emerald" },
        { label: "DEVELOPERS / BUILDERS", tone: "cyan" },
      ]}
    >
      {/* SceneBeat A: Two Paths — Everyday No-Code Users vs. Developers */}
      <SceneBeat window={beatA} align="stretch">
        <div style={slideUpStyle(frame, fps, r23.start, 20)}>
          <SectionTitle
            eyebrow="TWO EASY PATHS TO START TODAY"
            title="1-Click Connectors for Everyone · Clean Config for Builders"
            subtitle="Whether you never touch code or want to build custom servers, setup takes minutes."
            tone="emerald"
            style={{ marginBottom: 24 }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.08fr", gap: 28 }}>
          {/* Left Track: No-Code Path */}
          <div style={slideUpStyle(frame, fps, r23.start + 6, 20)}>
            <Card
              tone="emerald"
              glow
              padding={28}
              style={{ height: 560, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <Pill tone="emerald" size="md">
                    PATH 1 · NO-CODE USERS
                  </Pill>
                  <Pill
                    tone="emerald"
                    size="sm"
                    style={{ opacity: fadeIn(frame, connectorsCue - 30, 14) }}
                  >
                    ZERO CODE REQUIRED
                  </Pill>
                </div>
                <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 6 }}>
                  Built-In Connector Directories
                </div>
                <div style={{ fontSize: 18, color: TOKENS.colors.textSecondary, marginBottom: 18 }}>
                  Pick an app in Claude, ChatGPT, Cursor, or VS Code, sign in once, and flip it on.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {NO_CODE_CONNECTORS.map((item, idx) => {
                    const flipped = frame >= toggleCue + idx * 12;
                    return (
                      <CheckRow
                        key={item.label}
                        label={item.label}
                        detail={item.detail}
                        status={flipped ? item.status : "Off"}
                        tone="emerald"
                        active={flipped}
                        icon={flipped ? "✓" : "○"}
                      />
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Track: Builder Path */}
          <div
            style={{
              opacity: showBuilder ? fadeIn(frame, r24.start, 16) : 0.24,
              ...slideUpStyle(frame, fps, r24.start, 20),
            }}
          >
            <Card
              tone={showBuilder ? "cyan" : "neutral"}
              glow={showBuilder}
              padding={28}
              style={{ height: 560, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <Pill tone="cyan" size="md">
                    PATH 2 · POWER USERS &amp; DEVS
                  </Pill>
                  <Pill tone="amber" size="sm">
                    STDIO + REMOTE URL
                  </Pill>
                </div>

                <CodePanel
                  title="mcp.json"
                  badge="UNIVERSAL CONFIG"
                  tone="cyan"
                  lines={MCP_CONFIG_LINES}
                  revealProgress={showBuilder ? Math.max(0.25, configReveal) : 0.2}
                  fontSize={17}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  opacity: showBuilder ? fadeIn(frame, linesCue - 10, 14) : 0.3,
                  transform: `translateY(${frame >= linesCue ? 0 : 10}px)`,
                }}
              >
                <DataChip
                  label="Python · FastMCP"
                  sublabel="~30 lines to build a server"
                  tone="emerald"
                  style={{ padding: "12px 16px", fontSize: 18 }}
                />
                <DataChip
                  label="TypeScript · MCP SDK"
                  sublabel="Official typed server SDK"
                  tone="cyan"
                  style={{ padding: "12px 16px", fontSize: 18 }}
                />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* SceneBeat B: 3-Step Smart Starter Playbook (P25) */}
      <SceneBeat window={beatB} align="stretch">
        <div style={slideUpStyle(frame, fps, r25.start, 22)}>
          <SectionTitle
            eyebrow="YOUR DAY-ONE HABIT"
            title="Start Small — Don't Wire Up 15 Servers at Once"
            subtitle="Three disciplined steps make MCP feel effortless instead of overwhelming."
            tone="emerald"
            style={{ marginBottom: 38 }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {STARTER_STEPS.map((item, idx) => {
            const lit = frame >= stepCues[idx];
            const t = TONE_STYLES[item.tone];
            return (
              <div
                key={item.step}
                style={{
                  ...slideUpStyle(frame, fps, Math.min(r25.start + idx * 8, stepCues[idx]), 22),
                  opacity: lit ? 1 : 0.42,
                }}
              >
                <Card
                  tone={lit ? item.tone : "neutral"}
                  glow={lit}
                  padding={30}
                  style={{
                    height: 360,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 18,
                      }}
                    >
                      <Pill tone={item.tone} size="sm">
                        {item.step}
                      </Pill>
                      <span
                        style={{
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 13,
                          fontWeight: 700,
                          color: t.main,
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.15, marginBottom: 14 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 21, lineHeight: 1.45, color: TOKENS.colors.textSecondary }}>
                      {item.desc}
                    </div>
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
