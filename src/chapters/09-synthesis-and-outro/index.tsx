import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../lib/audio";
import { TOKENS } from "../../theme/tokens";
import type { SemanticTone } from "../../theme/tokens";
import { CheckRow, SvgLink } from "../../ui/diagrams";
import {
  clipRange,
  cueFrame,
  fadeIn,
  progressBetween,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import {
  Card,
  DataChip,
  Pill,
  SceneBeat,
  SectionTitle,
} from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { StageLegendItem } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const LEGEND: StageLegendItem[] = [
  { label: "HARNESS", tone: "cyan" },
  { label: "MODEL", tone: "amber" },
  { label: "RELIABILITY", tone: "emerald" },
  { label: "FAILURE", tone: "rose" },
];

const OS_MAPPINGS: {
  agentPart: string;
  osPart: string;
  detail: string;
  tone: SemanticTone;
}[] = [
  { agentPart: "Language Model", osPart: "CPU", detail: "Raw reasoning & planning power", tone: "amber" },
  { agentPart: "Context Window", osPart: "RAM", detail: "Fast, finite working memory (guard against rot)", tone: "amber" },
  { agentPart: "Filesystem & Git", osPart: "Disk", detail: "Durable state, JSON checklists & commits across sessions", tone: "cyan" },
  { agentPart: "Tools, Hooks & Sandbox", osPart: "Kernel & I/O", detail: "Deterministic execution, policy & physical containment", tone: "cyan" },
  { agentPart: "Tests, Linters & Evals", osPart: "Debugger", detail: "Ground-truth verification & flight-recorder trajectories", tone: "emerald" },
];

export const SynthesisAndOutroChapter: React.FC<ChapterComponentProps> = ({
  chapter,
  clips,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c35 = clips[0];
  const c36 = clips[1];
  const c37 = clips[2];

  const b35 = clipRange(c35, chapter.startFrame, 0, 920);
  const b36 = clipRange(c36, chapter.startFrame, b35.end, 860);
  const b37 = clipRange(c37, chapter.startFrame, b36.end, 600);

  // Beat 35 cues
  const cpuCue = cueFrame(c35, "CPU", 320, chapter.startFrame);
  const ramCue = cueFrame(c35, "RAM", 440, chapter.startFrame);
  const diskCue = cueFrame(c35, "disk", 580, chapter.startFrame);
  const kernelCue = cueFrame(c35, "kernel", 700, chapter.startFrame);
  const debugCue = cueFrame(c35, "debugger", 820, chapter.startFrame);
  const osCues = [cpuCue, ramCue, diskCue, kernelCue, debugCue];

  // Beat 36 cues
  const toolsCue = cueFrame(c36, "tools", 380, chapter.startFrame);
  const prefixCue = cueFrame(c36, "prefix", 470, chapter.startFrame);
  const verifyCue = cueFrame(c36, "verification", 560, chapter.startFrame);
  const sandboxCue = cueFrame(c36, "sandbox", 670, chapter.startFrame);

  // Beat 37 cue
  const bottleCue = cueFrame(c37, "bottleneck", 180, chapter.startFrame);

  const w35 = sceneWindow(frame, b35.start, b35.end);
  const w36 = sceneWindow(frame, b36.start, b36.end);
  const w37 = sceneWindow(frame, b37.start, b37.end, { keepAtEnd: true });

  return (
    <Stage chapterIndex="09" chapterTitle={chapter.title} tone="emerald" legend={LEGEND}>
      {/* SFX */}
      <Sfx name="pop-in" from={cpuCue} volume={0.28} />
      <Sfx name="pop-in" from={ramCue} volume={0.26} />
      <Sfx name="magnetic-snap" from={diskCue} volume={0.28} />
      <Sfx name="magnetic-snap" from={kernelCue} volume={0.28} />
      <Sfx name="chime-positive" from={debugCue} volume={0.3} />

      <Sfx name="success-ding" from={toolsCue} volume={0.28} />
      <Sfx name="click-subtle" from={prefixCue} volume={0.26} />
      <Sfx name="click-subtle" from={verifyCue} volume={0.26} />
      <Sfx name="chime-positive" from={sandboxCue} volume={0.3} />

      <Sfx name="whoosh-soft" from={bottleCue} volume={0.24} />

      {/* BEAT 35: Complete 5-Part OS Mental Model */}
      <SceneBeat window={w35}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
          <SectionTitle
            eyebrow="ONE MENTAL MODEL TO REMEMBER"
            title="The Agent Harness Is an Operating System"
            tone="emerald"
            style={{ marginBottom: 0 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            {["Coding", "Browser", "Research", "Ops"].map((dom) => (
              <Pill key={dom} tone="cyan" size="sm">{dom}</Pill>
            ))}
          </div>
        </div>

        <Card tone="cyan" glow padding={26}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {OS_MAPPINGS.map((row, idx) => {
              const trigger = osCues[idx];
              const active = frame >= trigger;
              return (
                <div
                  key={row.osPart}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "340px 90px 210px 1fr",
                    alignItems: "center",
                    padding: "12px 18px",
                    borderRadius: 14,
                    backgroundColor: active ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.015)",
                    border: `1.5px solid ${active ? TOKENS.colors.borderStrong : TOKENS.colors.border}`,
                    opacity: active ? 1 : 0.4,
                  }}
                >
                  <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 24, fontWeight: 700, color: TOKENS.colors.textPrimary }}>
                    {row.agentPart}
                  </span>
                  <svg width={90} height={24} viewBox="0 0 90 24">
                    <SvgLink x1={6} y1={12} x2={84} y2={12} progress={progressBetween(frame, trigger, trigger + 16)} tone={row.tone} arrow />
                  </svg>
                  <div>
                    <Pill tone={row.tone} size="md">{row.osPart}</Pill>
                  </div>
                  <span style={{ fontSize: 20, color: TOKENS.colors.textSecondary }}>
                    {row.detail}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </SceneBeat>

      {/* BEAT 36: Practical Builder Audit Checklist */}
      <SceneBeat window={w36}>
        <SectionTitle
          eyebrow="BEFORE YOU SWAP MODELS AGAIN"
          title="Audit Your Harness First"
          subtitle="More often than not, the intelligence was already there — it just needed a better OS."
          tone="emerald"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1440, width: "100%", margin: "0 auto" }}>
          <div style={slideUpStyle(frame, fps, b36.start + 10, 16)}>
            <CheckRow
              label="1. Clean Tool Ergonomics & Actionable Errors"
              detail="Trim bloated MCP schemas, use targeted diffs, and return recovery hints"
              status="AUDIT TOOLS"
              tone="emerald"
              active={frame >= toolsCue}
            />
          </div>
          <div style={slideUpStyle(frame, fps, b36.start + 18, 16)}>
            <CheckRow
              label="2. Stable Prompt Cache Prefix & Append-Only History"
              detail="Freeze system prompts/tools, truncate giant logs, compact cleanly"
              status="CACHE INTACT"
              tone="emerald"
              active={frame >= prefixCue}
            />
          </div>
          <div style={slideUpStyle(frame, fps, b36.start + 26, 16)}>
            <CheckRow
              label="3. Closed-Loop Verification & Deterministic Hooks"
              detail="Enforce tests, linters, and policy gates in code — not ALL-CAPS prompt begging"
              status="VERIFIED"
              tone="emerald"
              active={frame >= verifyCue}
            />
          </div>
          <div style={slideUpStyle(frame, fps, b36.start + 34, 16)}>
            <CheckRow
              label="4. Scoped Sandbox & Tiered Human Approval"
              detail="Contain arbitrary shell execution and gate irreversible actions cleanly"
              status="CONTAINED"
              tone="emerald"
              active={frame >= sandboxCue}
            />
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 37: Outro & YouTube End-Screen Safe Zone (~20s, right/bottom reserved) */}
      <SceneBeat window={w37}>
        <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 40, alignItems: "center" }}>
          <div style={slideUpStyle(frame, fps, b37.start + 6, 18)}>
            <Card tone="cyan" glow padding={34}>
              <Pill tone="emerald" size="sm">AI AGENT HARNESSES EXPLAINED</Pill>
              <div
                style={{
                  fontFamily: TOKENS.fonts.display,
                  fontSize: 44,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  marginTop: 16,
                  color: TOKENS.colors.textPrimary,
                }}
              >
                Agent = Model + Harness
              </div>
              <p
                style={{
                  fontSize: 22,
                  lineHeight: 1.5,
                  color: TOKENS.colors.textSecondary,
                  margin: "16px 0 24px",
                }}
              >
                Which harness bottleneck has hit your team hardest? Drop it in the comments below.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, opacity: fadeIn(frame, bottleCue, 14) }}>
                <DataChip label="Context Rot" tone="rose" style={{ fontSize: 16 }} />
                <DataChip label="Tool Sprawl" tone="amber" style={{ fontSize: 16 }} />
                <DataChip label="Sandboxing & Permissions" tone="emerald" style={{ fontSize: 16 }} />
              </div>

              <div
                style={{
                  marginTop: 26,
                  fontFamily: TOKENS.fonts.handwritten,
                  fontSize: 34,
                  fontWeight: 700,
                  color: TOKENS.colors.accent,
                }}
              >
                CPU • RAM • Disk • Kernel • Debugger
              </div>
            </Card>
          </div>

          {/* Right & lower-right intentionally left clean for YouTube end-screen cards */}
          <div aria-hidden="true" />
        </div>
      </SceneBeat>
    </Stage>
  );
};
