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
} from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

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
    <Stage chapterIndex="07" chapterTitle={chapter.title} tone="emerald" transientHeader compactPadding>
      {/* SFX */}
      <Sfx name="whoosh-fast" from={delegCue} volume={0.26} />
      <Sfx name="ping-radar" from={isoCue} volume={0.26} />
      <Sfx name="chime-positive" from={sumCue} volume={0.28} />

      <Sfx name="power-up" from={parCue} volume={0.22} durationInFrames={60} />
      <Sfx name="magnetic-snap" from={convCue} volume={0.3} />
      <Sfx name="thud-low" from={coupCue} volume={0.28} />

      <Sfx name="slide" from={interCue} volume={0.26} />
      <Sfx name="power-up" from={bgCue} volume={0.22} durationInFrames={65} />

      {/* BEAT 28: Full-Canvas Sub-agents for Context Isolation (Zero SectionTitle chrome) */}
      <SceneBeat window={w28}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <NodeBox
            tag="CONTEXT HYGIENE • CLAUDE CODE • OPENCODE • CLINE • ROO CODE"
            title="Main Orchestrator Agent"
            subtitle="Receives crisp 300-token summaries — zero grep pollution in parent window"
            tone="cyan"
            glow={frame >= sumCue}
            style={{ width: 780, textAlign: "center" }}
          />

          <svg width={1400} height={150} viewBox="0 0 1400 150" style={{ overflow: "visible" }}>
            <SvgLink x1={560} y1={8} x2={230} y2={142} progress={progressBetween(frame, delegCue, delegCue + 24)} tone="cyan" strokeWidth={3.5} arrow />
            <SvgLink x1={700} y1={8} x2={700} y2={142} progress={progressBetween(frame, delegCue + 4, delegCue + 28)} tone="cyan" strokeWidth={3.5} arrow />
            <SvgLink x1={840} y1={8} x2={1170} y2={142} progress={progressBetween(frame, delegCue + 8, delegCue + 32)} tone="cyan" strokeWidth={3.5} arrow />

            <SvgPacket x1={230} y1={142} x2={560} y2={8} progress={progressBetween(frame, sumCue, sumCue + 24)} tone="emerald" radius={10} label="Summary" />
            <SvgPacket x1={700} y1={142} x2={700} y2={8} progress={progressBetween(frame, sumCue + 3, sumCue + 27)} tone="emerald" radius={10} label="Summary" />
            <SvgPacket x1={1170} y1={142} x2={840} y2={8} progress={progressBetween(frame, sumCue + 6, sumCue + 30)} tone="emerald" radius={10} label="Summary" />
          </svg>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30, width: "100%", maxWidth: 1560 }}>
            {[
              { title: "Codebase Search Sub-agent", noise: "Reads 40 files (~50K tok)", out: "Returns 4 key line ranges" },
              { title: "Docs Lookup Sub-agent", noise: "Fetches specs & schemas", out: "Returns API contract" },
              { title: "Test Runner Sub-agent", noise: "Parses 10K-line stack trace", out: "Returns root cause" },
            ].map((child, idx) => (
              <div key={child.title} style={slideUpStyle(frame, fps, delegCue + idx * 8, 18)}>
                <Card tone={frame >= isoCue ? "amber" : "neutral"} glow={frame >= isoCue && frame < sumCue} padding={28}>
                  <Pill tone="amber" size="md">ISOLATED CHILD WINDOW</Pill>
                  <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 28, fontWeight: 700, marginTop: 14 }}>
                    {child.title}
                  </div>
                  <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                    <DataChip label={child.noise} sublabel="Sealed inside child" tone="rose" style={{ fontSize: 17, padding: "12px 14px" }} />
                    <DataChip label={child.out} sublabel="Sent back to parent" tone="emerald" dim={frame < sumCue} style={{ fontSize: 17, padding: "12px 14px" }} />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 29: Full-Canvas Parallel Git Worktrees + When Not to Delegate (Zero SectionTitle chrome) */}
      <SceneBeat window={w29}>
        <div style={{ display: "grid", gridTemplateColumns: "0.75fr 120px 1.25fr 120px 0.85fr", alignItems: "center", marginBottom: 34 }}>
          <NodeBox
            tag="COORDINATOR"
            title="Orchestrator"
            subtitle="Splits independent subtasks"
            tone="cyan"
            glow
            style={{ minHeight: 175, display: "flex", flexDirection: "column", justifyContent: "center" }}
          />

          <svg width={120} height={380} viewBox="0 0 120 380">
            <SvgLink x1={4} y1={190} x2={116} y2={62} progress={progressBetween(frame, parCue, parCue + 24)} tone="cyan" strokeWidth={3.5} arrow />
            <SvgLink x1={4} y1={190} x2={116} y2={190} progress={progressBetween(frame, parCue, parCue + 24)} tone="cyan" strokeWidth={3.5} arrow />
            <SvgLink x1={4} y1={190} x2={116} y2={318} progress={progressBetween(frame, parCue, parCue + 24)} tone="cyan" strokeWidth={3.5} arrow />
          </svg>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
              />
            ))}
          </div>

          <svg width={120} height={380} viewBox="0 0 120 380">
            <SvgLink x1={4} y1={62} x2={116} y2={190} progress={progressBetween(frame, convCue, convCue + 24)} tone="emerald" strokeWidth={3.5} arrow />
            <SvgLink x1={4} y1={190} x2={116} y2={190} progress={progressBetween(frame, convCue, convCue + 24)} tone="emerald" strokeWidth={3.5} arrow />
            <SvgLink x1={4} y1={318} x2={116} y2={190} progress={progressBetween(frame, convCue, convCue + 24)} tone="emerald" strokeWidth={3.5} arrow />
          </svg>

          <NodeBox
            tag="CONVERGENCE"
            title="Merge + Verify Gate"
            subtitle="Single deterministic test & CI check"
            tone="emerald"
            glow={frame >= convCue}
            style={{ minHeight: 175, display: "flex", flexDirection: "column", justifyContent: "center" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", opacity: fadeIn(frame, coupCue, 14) }}>
          <Card tone="rose" glow={frame >= coupCue} padding={22} style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Pill tone="rose" size="md">✗ MULTI-AGENT TRAP</Pill>
            <span style={{ fontSize: 23, fontWeight: 600, color: TOKENS.colors.textPrimary }}>
              Never delegate tightly coupled sequential edits — merge conflicts &amp; overhead beat a single clean loop.
            </span>
          </Card>
        </div>
      </SceneBeat>

      {/* BEAT 30: Full-Canvas Local vs Cloud Ecosystem Topology (Zero SectionTitle chrome) */}
      <SceneBeat window={w30}>
        <div style={{ display: "grid", gridTemplateColumns: "1.12fr 95px 0.72fr 95px 1.12fr", alignItems: "center" }}>
          <div style={slideUpStyle(frame, fps, interCue - 12, 18)}>
            <Card tone="cyan" glow={frame >= interCue} padding={32} style={{ minHeight: 490, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <Pill tone="cyan" size="md">INTERACTIVE LOCAL HARNESSES</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 36, fontWeight: 700, marginTop: 14 }}>
                  Terminal &amp; IDE Pairing
                </div>
                <p style={{ fontSize: 20, color: TOKENS.colors.textSecondary, margin: "10px 0 22px", lineHeight: 1.45 }}>
                  Low-latency human-in-the-loop pairing directly inside your local workspace.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {LOCAL_HARNESSES.map((item) => (
                  <DataChip key={item} label={item} tone="cyan" style={{ fontSize: 17, padding: "10px 14px" }} />
                ))}
              </div>
            </Card>
          </div>

          <svg width={95} height={80} viewBox="0 0 95 80">
            <SvgLink x1={89} y1={40} x2={6} y2={40} progress={progressBetween(frame, interCue, interCue + 24)} tone="cyan" strokeWidth={3.5} arrow />
          </svg>

          <NodeBox
            tag="SAME ENGINE"
            title="Core Harness Runtime"
            subtitle="Loop • Tools • Context • Verifiers • Agent SDKs"
            tone="amber"
            glow
            style={{ textAlign: "center", minHeight: 250, display: "flex", flexDirection: "column", justifyContent: "center" }}
          />

          <svg width={95} height={80} viewBox="0 0 95 80">
            <SvgLink x1={6} y1={40} x2={89} y2={40} progress={progressBetween(frame, bgCue, bgCue + 24)} tone="emerald" strokeWidth={3.5} arrow />
          </svg>

          <div style={slideUpStyle(frame, fps, bgCue - 12, 18)}>
            <Card tone="emerald" glow={frame >= bgCue} padding={32} style={{ minHeight: 490, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <Pill tone="emerald" size="md">HEADLESS CLOUD HARNESSES</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 36, fontWeight: 700, marginTop: 14 }}>
                  Async Background Fleets
                </div>
                <p style={{ fontSize: 20, color: TOKENS.colors.textSecondary, margin: "10px 0 22px", lineHeight: 1.45 }}>
                  Ticket queue → ephemeral container → CI checks → open PR asynchronously.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {CLOUD_HARNESSES.map((item) => (
                  <DataChip key={item} label={item} tone="emerald" style={{ fontSize: 17, padding: "10px 14px" }} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
