import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../lib/audio";
import { TOKENS } from "../../theme/tokens";
import { NodeBox, SvgLink, SvgPacket } from "../../ui/diagrams";
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

const LOCAL_HARNESSES = [
  "Claude Code",
  "Codex CLI",
  "Gemini CLI",
  "Cursor",
  "Windsurf",
  "OpenCode",
  "Aider",
  "Cline",
];

const CLOUD_HARNESSES = [
  "Devin",
  "Codex Cloud",
  "GitHub Copilot",
  "Cursor Background",
  "OpenHands",
];

export const NextLevelSubagentsChapter: React.FC<ChapterComponentProps> = ({
  chapter,
  clips,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c28 = clips[0];
  const c29 = clips[1];
  const c30 = clips[2];

  const b28 = clipRange(c28, chapter.startFrame, 0, 960);
  const b29 = clipRange(c29, chapter.startFrame, b28.end, 940);
  const b30 = clipRange(c30, chapter.startFrame, b29.end, 1020);

  // Beat 28 cues
  const delegCue = cueFrame(c28, "delegation", 200, chapter.startFrame);
  const isoCue = cueFrame(c28, "isolated", 640, chapter.startFrame);
  const sumCue = cueFrame(c28, "summary", 840, chapter.startFrame);

  // Beat 29 cues
  const parCue = cueFrame(c29, "parallel", 100, chapter.startFrame);
  const convCue = cueFrame(c29, "converge", 440, chapter.startFrame);
  const coupCue = cueFrame(c29, "coupled", 660, chapter.startFrame);

  // Beat 30 cues
  const interCue = cueFrame(c30, "interactive", 210, chapter.startFrame);
  const bgCue = cueFrame(c30, "background", 550, chapter.startFrame);

  const w28 = sceneWindow(frame, b28.start, b28.end);
  const w29 = sceneWindow(frame, b29.start, b29.end);
  const w30 = sceneWindow(frame, b30.start, b30.end, { keepAtEnd: true });

  return (
    <Stage chapterIndex="07" chapterTitle={chapter.title} tone="emerald" legend={LEGEND}>
      {/* SFX */}
      <Sfx name="whoosh-fast" from={delegCue} volume={0.26} />
      <Sfx name="ping-radar" from={isoCue} volume={0.26} />
      <Sfx name="chime-positive" from={sumCue} volume={0.28} />

      <Sfx name="power-up" from={parCue} volume={0.22} durationInFrames={60} />
      <Sfx name="magnetic-snap" from={convCue} volume={0.3} />
      <Sfx name="thud-low" from={coupCue} volume={0.28} />

      <Sfx name="slide" from={interCue} volume={0.26} />
      <Sfx name="power-up" from={bgCue} volume={0.22} durationInFrames={65} />

      {/* BEAT 28: Sub-agents for Context Isolation */}
      <SceneBeat window={w28}>
        <SectionTitle
          eyebrow="PILLAR 05 — NEXT LEVEL: SUB-AGENTS & SCALE"
          title="Sub-agents Exist for Context Hygiene, Not Role-Play"
          subtitle="Claude Code • OpenCode • Cline • Roo Code"
          tone="emerald"
        />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <NodeBox
            tag="PARENT CONTEXT (STAYING CRISP)"
            title="Main Orchestrator Agent"
            subtitle="Receives clean 300-token summaries — zero grep pollution"
            tone="cyan"
            glow={frame >= sumCue}
            style={{ width: 640, textAlign: "center" }}
          />

          <svg width={1260} height={104} viewBox="0 0 1260 104" style={{ overflow: "visible" }}>
            <SvgLink x1={520} y1={6} x2={210} y2={98} progress={progressBetween(frame, delegCue, delegCue + 24)} tone="cyan" arrow />
            <SvgLink x1={630} y1={6} x2={630} y2={98} progress={progressBetween(frame, delegCue + 4, delegCue + 28)} tone="cyan" arrow />
            <SvgLink x1={740} y1={6} x2={1050} y2={98} progress={progressBetween(frame, delegCue + 8, delegCue + 32)} tone="cyan" arrow />

            <SvgPacket x1={210} y1={98} x2={520} y2={6} progress={progressBetween(frame, sumCue, sumCue + 24)} tone="emerald" label="Summary" />
            <SvgPacket x1={630} y1={98} x2={630} y2={6} progress={progressBetween(frame, sumCue + 3, sumCue + 27)} tone="emerald" label="Summary" />
            <SvgPacket x1={1050} y1={98} x2={740} y2={6} progress={progressBetween(frame, sumCue + 6, sumCue + 30)} tone="emerald" label="Summary" />
          </svg>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, width: "100%", maxWidth: 1380 }}>
            {[
              { title: "Codebase Search Sub-agent", noise: "Reads 40 files (~50K tok)", out: "Returns 4 key line ranges" },
              { title: "Docs Lookup Sub-agent", noise: "Fetches specs & schemas", out: "Returns API contract" },
              { title: "Test Runner Sub-agent", noise: "Parses verbose failures", out: "Returns root cause" },
            ].map((child, idx) => (
              <div key={child.title} style={slideUpStyle(frame, fps, delegCue + idx * 8, 18)}>
                <Card tone={frame >= isoCue ? "amber" : "neutral"} glow={frame >= isoCue && frame < sumCue} padding={22}>
                  <Pill tone="amber" size="sm">ISOLATED WINDOW</Pill>
                  <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 24, fontWeight: 700, marginTop: 10 }}>
                    {child.title}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    <DataChip label={child.noise} tone="rose" style={{ fontSize: 14, padding: "7px 10px" }} />
                    <DataChip label={child.out} tone="emerald" dim={frame < sumCue} style={{ fontSize: 14, padding: "7px 10px" }} />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 29: Parallel Delegation & When Not to Delegate */}
      <SceneBeat window={w29}>
        <SectionTitle
          eyebrow="PILLAR 05 — PARALLEL GIT WORKTREES"
          title="Fan Out Independent Work. Never Split Coupled Steps."
          tone="emerald"
        />

        <div style={{ display: "grid", gridTemplateColumns: "0.75fr 110px 1.25fr 110px 0.85fr", alignItems: "center", marginBottom: 24 }}>
          <NodeBox
            tag="COORDINATOR"
            title="Orchestrator"
            subtitle="Splits independent subtasks"
            tone="cyan"
            glow
          />

          <svg width={110} height={290} viewBox="0 0 110 290">
            <SvgLink x1={4} y1={145} x2={106} y2={48} progress={progressBetween(frame, parCue, parCue + 24)} tone="cyan" arrow />
            <SvgLink x1={4} y1={145} x2={106} y2={145} progress={progressBetween(frame, parCue, parCue + 24)} tone="cyan" arrow />
            <SvgLink x1={4} y1={145} x2={106} y2={242} progress={progressBetween(frame, parCue, parCue + 24)} tone="cyan" arrow />
          </svg>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { wt: "worktree/backend-tests", desc: "Specialist Worker A — Concurrency tests" },
              { wt: "worktree/ui-state", desc: "Specialist Worker B — Session UI banner" },
              { wt: "worktree/docs-update", desc: "Specialist Worker C — Migration notes" },
            ].map((lane) => (
              <NodeBox
                key={lane.wt}
                tag="ISOLATED GIT WORKTREE"
                title={lane.wt}
                subtitle={lane.desc}
                tone="cyan"
                glow={frame >= parCue && frame < convCue}
                compact
              />
            ))}
          </div>

          <svg width={110} height={290} viewBox="0 0 110 290">
            <SvgLink x1={4} y1={48} x2={106} y2={145} progress={progressBetween(frame, convCue, convCue + 24)} tone="emerald" arrow />
            <SvgLink x1={4} y1={145} x2={106} y2={145} progress={progressBetween(frame, convCue, convCue + 24)} tone="emerald" arrow />
            <SvgLink x1={4} y1={242} x2={106} y2={145} progress={progressBetween(frame, convCue, convCue + 24)} tone="emerald" arrow />
          </svg>

          <NodeBox
            tag="CONVERGENCE"
            title="Merge + Verify Gate"
            subtitle="Single deterministic test & CI check"
            tone="emerald"
            glow={frame >= convCue}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", opacity: fadeIn(frame, coupCue, 14) }}>
          <Card tone="rose" glow={frame >= coupCue} padding={18} style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Pill tone="rose" size="sm">✗ MULTI-AGENT TRAP</Pill>
            <span style={{ fontSize: 21, fontWeight: 600, color: TOKENS.colors.textPrimary }}>
              Never delegate tightly coupled sequential edits — merge conflicts &amp; coordination overhead beat a single clean loop.
            </span>
          </Card>
        </div>
      </SceneBeat>

      {/* BEAT 30: Local Interactive vs Cloud Background Harnesses */}
      <SceneBeat window={w30}>
        <SectionTitle
          eyebrow="PILLAR 05 — DEPLOYMENT TOPOLOGIES"
          title="Same Core Harness Engine. Two Production Topologies."
          tone="cyan"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 90px 0.72fr 90px 1.1fr", alignItems: "center" }}>
          <div style={slideUpStyle(frame, fps, interCue - 12, 18)}>
            <Card tone="cyan" glow={frame >= interCue} padding={24}>
              <Pill tone="cyan" size="sm">INTERACTIVE LOCAL HARNESSES</Pill>
              <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 28, fontWeight: 700, marginTop: 10 }}>
                Terminal &amp; IDE Pairing
              </div>
              <p style={{ fontSize: 17, color: TOKENS.colors.textSecondary, margin: "6px 0 16px" }}>
                Low-latency human-in-the-loop editing inside your local workspace.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {LOCAL_HARNESSES.map((item) => (
                  <DataChip key={item} label={item} tone="cyan" style={{ fontSize: 15, padding: "7px 11px" }} />
                ))}
              </div>
            </Card>
          </div>

          <svg width={90} height={80} viewBox="0 0 90 80">
            <SvgLink x1={84} y1={40} x2={6} y2={40} progress={progressBetween(frame, interCue, interCue + 24)} tone="cyan" arrow />
          </svg>

          <NodeBox
            tag="SHARED RUNTIME"
            title="Core Harness Engine"
            subtitle="Loop • Tools • Context • Verifiers • Agent SDKs"
            tone="amber"
            glow
            style={{ textAlign: "center" }}
          />

          <svg width={90} height={80} viewBox="0 0 90 80">
            <SvgLink x1={6} y1={40} x2={84} y2={40} progress={progressBetween(frame, bgCue, bgCue + 24)} tone="emerald" arrow />
          </svg>

          <div style={slideUpStyle(frame, fps, bgCue - 12, 18)}>
            <Card tone="emerald" glow={frame >= bgCue} padding={24}>
              <Pill tone="emerald" size="sm">HEADLESS CLOUD HARNESSES</Pill>
              <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 28, fontWeight: 700, marginTop: 10 }}>
                Async Background Fleets
              </div>
              <p style={{ fontSize: 17, color: TOKENS.colors.textSecondary, margin: "6px 0 16px" }}>
                Task queue → ephemeral container → CI verification → open PR.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CLOUD_HARNESSES.map((item) => (
                  <DataChip key={item} label={item} tone="emerald" style={{ fontSize: 15, padding: "7px 11px" }} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
