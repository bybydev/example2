import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../lib/audio";
import { TOKENS } from "../../theme/tokens";
import { CheckRow, NodeBox, SvgLink, SvgPacket } from "../../ui/diagrams";
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

export const MemoryAndStateChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c20 = clips[0];
  const c21 = clips[1];
  const c22 = clips[2];

  const b20 = clipRange(c20, chapter.startFrame, 0, 860);
  const b21 = clipRange(c21, chapter.startFrame, b20.end, 900);
  const b22 = clipRange(c22, chapter.startFrame, b21.end, 900);

  // Beat 20 cues
  const premCue = cueFrame(c20, "prematurely", 440, chapter.startFrame);
  const loseCue = cueFrame(c20, "lose", 540, chapter.startFrame);

  // Beat 21 cues
  const diskCue = cueFrame(c21, "disk", 160, chapter.startFrame);
  const commitsCue = cueFrame(c21, "commits", 650, chapter.startFrame);
  const orientCue = cueFrame(c21, "orient", 800, chapter.startFrame);

  // Beat 22 cues
  const initCue = cueFrame(c22, "initializer", 140, chapter.startFrame);
  const codingCue = cueFrame(c22, "coding", 440, chapter.startFrame);

  const w20 = sceneWindow(frame, b20.start, b20.end);
  const w21 = sceneWindow(frame, b21.start, b21.end);
  const w22 = sceneWindow(frame, b22.start, b22.end, { keepAtEnd: true });

  const curveProgress = progressBetween(frame, b20.start + 15, premCue);
  const item1Done = frame >= codingCue + 12;
  const item2Done = frame >= codingCue + 75;
  const item3Done = frame >= codingCue + 140;

  return (
    <Stage chapterIndex="05" chapterTitle={chapter.title} tone="cyan" legend={LEGEND}>
      {/* SFX */}
      <Sfx name="error-buzz" from={premCue} volume={0.28} />
      <Sfx name="power-down" from={loseCue} volume={0.25} durationInFrames={60} />

      <Sfx name="slide" from={diskCue} volume={0.26} />
      <Sfx name="pop-in" from={commitsCue} volume={0.28} />
      <Sfx name="data-blip" from={orientCue} volume={0.28} />

      <Sfx name="power-up" from={initCue} volume={0.22} durationInFrames={65} />
      <Sfx name="tick-digital" from={codingCue + 12} volume={0.3} />
      <Sfx name="tick-digital" from={codingCue + 75} volume={0.3} />
      <Sfx name="tick-digital" from={codingCue + 140} volume={0.3} />

      {/* BEAT 20: Why Single-Window Agents Stall */}
      <SceneBeat window={w20}>
        <SectionTitle
          eyebrow="PILLAR 03 — MEMORY & DURABLE STATE"
          title="Why Single-Window Agents Stall on Multi-Hour Tasks"
          tone="rose"
        />

        <Card tone={frame >= loseCue ? "rose" : "amber"} padding={30}>
          <div style={{ position: "relative", height: 310 }}>
            <svg width={1560} height={310} viewBox="0 0 1560 310">
              {/* Baseline axes */}
              <line x1={60} y1={260} x2={1500} y2={260} stroke="rgba(255,255,255,0.16)" strokeWidth={2} />
              <line x1={60} y1={30} x2={60} y2={260} stroke="rgba(255,255,255,0.16)" strokeWidth={2} />

              {/* Early progress climb */}
              <SvgLink x1={60} y1={250} x2={520} y2={95} progress={curveProgress} tone="amber" strokeWidth={4} />
              {/* Stall / flatline */}
              <SvgLink x1={520} y1={95} x2={1040} y2={115} progress={progressBetween(frame, premCue - 30, premCue + 10)} tone="rose" strokeWidth={4} dashed />
              <SvgLink x1={1040} y1={115} x2={1460} y2={165} progress={progressBetween(frame, loseCue, loseCue + 35)} tone="rose" strokeWidth={4} dashed />

              <text x={80} y={52} fill={TOKENS.colors.textMuted} fontFamily={TOKENS.fonts.mono} fontSize={15}>
                TASK COMPLETION %
              </text>
              <text x={1350} y={290} fill={TOKENS.colors.textMuted} fontFamily={TOKENS.fonts.mono} fontSize={15}>
                SESSION TURNS →
              </text>
            </svg>

            <div style={{ position: "absolute", left: 260, top: 38, opacity: fadeIn(frame, b20.start + 60, 16) }}>
              <Pill tone="amber" size="sm">1. ONE-SHOT OVERREACH → CONTEXT FULL</Pill>
            </div>
            <div style={{ position: "absolute", left: 680, top: 34, opacity: fadeIn(frame, premCue, 14) }}>
              <Pill tone="rose" size="md">✗ PREMATURE &quot;DONE!&quot;</Pill>
            </div>
            <div style={{ position: "absolute", left: 1090, top: 170, opacity: fadeIn(frame, loseCue, 16) }}>
              <Pill tone="rose" size="sm">FORGOTTEN EDGE CASES</Pill>
            </div>
          </div>
        </Card>

        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          <NodeBox
            tag="FAILURE MODE A"
            title="Context Exhausted Mid-Refactor"
            subtitle="Tries to implement everything at once until working memory overflows."
            tone="rose"
            dim={frame >= loseCue}
            compact
          />
          <NodeBox
            tag="FAILURE MODE B"
            title="Premature Victory"
            subtitle="Fixes the happy path and forgets remaining edge cases across 30+ turns."
            tone="rose"
            glow={frame >= premCue}
            compact
          />
        </div>
      </SceneBeat>

      {/* BEAT 21: Filesystem as Durable Memory */}
      <SceneBeat window={w21}>
        <SectionTitle
          eyebrow="PILLAR 03 — WORKSPACE AS MEMORY (MANUS & CODING AGENTS)"
          title="Treat the Filesystem & Git as Durable Disk"
          subtitle="Externalized state lets any fresh context window orient itself in seconds."
          tone="cyan"
        />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 1220, ...slideUpStyle(frame, fps, diskCue, 18) }}>
            <Card tone="cyan" glow={frame >= diskCue} padding={26}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700 }}>
                  Workspace Disk (External Memory)
                </span>
                <Pill tone="emerald" size="sm">SURVIVES CONTEXT RESETS</Pill>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                <DataChip label="todo.md" sublabel="Live goal recitation (Manus)" tone="cyan" />
                <DataChip label="feature-list.json" sublabel="Structured JSON > Markdown" tone="emerald" />
                <DataChip
                  label="git log / commits"
                  sublabel="Clean auth.ts checkpoints"
                  tone="amber"
                  dim={frame < commitsCue}
                />
              </div>
            </Card>
          </div>

          <svg width={1200} height={84} viewBox="0 0 1200 84" style={{ overflow: "visible" }}>
            <SvgLink x1={260} y1={4} x2={200} y2={78} progress={progressBetween(frame, diskCue + 12, diskCue + 36)} tone="cyan" arrow />
            <SvgLink x1={600} y1={4} x2={600} y2={78} progress={progressBetween(frame, commitsCue, commitsCue + 24)} tone="cyan" arrow />
            <SvgLink x1={940} y1={4} x2={1000} y2={78} progress={progressBetween(frame, orientCue, orientCue + 24)} tone="emerald" arrow />
            <SvgPacket x1={940} y1={4} x2={1000} y2={78} progress={progressBetween(frame, orientCue + 4, orientCue + 36)} tone="emerald" label="State" />
          </svg>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, width: "100%", maxWidth: 1320 }}>
            <NodeBox tag="SESSION 1" title="Fresh Context Window" subtitle="Reads specs, sets reproducer, commits" tone="cyan" compact />
            <NodeBox tag="SESSION 2" title="Fresh Context Window" subtitle="Reads git log + JSON, implements fix" tone="cyan" glow={frame >= commitsCue} compact />
            <NodeBox tag="SESSION 3" title="Fresh Context Window" subtitle="Orients in seconds, verifies edge cases" tone="emerald" glow={frame >= orientCue} compact />
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 22: Initializer + Coding Agent Pattern (Anthropic) */}
      <SceneBeat window={w22}>
        <SectionTitle
          eyebrow="PILLAR 03 — ANTHROPIC LONG-RUNNING HARNESS PATTERN"
          title="Two-Phase Shifts: Initializer + Coding Agent"
          tone="cyan"
        />

        <div style={{ display: "grid", gridTemplateColumns: "0.95fr 110px 1.25fr", alignItems: "center" }}>
          <div style={slideUpStyle(frame, fps, initCue - 12, 20)}>
            <Card tone="cyan" glow={frame >= initCue && frame < codingCue} padding={26}>
              <Pill tone="cyan" size="sm">PHASE 1 • RUNS ONCE</Pill>
              <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700, marginTop: 10, marginBottom: 14 }}>
                Initializer Agent
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <DataChip label="init.sh" sublabel="Boot & environment script" tone="cyan" style={{ alignItems: "flex-start", fontSize: 18 }} />
                <DataChip label="feature-list.json" sublabel="Scoped verifiable checklist" tone="emerald" style={{ alignItems: "flex-start", fontSize: 18 }} />
                <DataChip label="claude-progress.txt" sublabel="Shift handoff log + baseline commit" tone="amber" style={{ alignItems: "flex-start", fontSize: 18 }} />
              </div>
            </Card>
          </div>

          <svg width={110} height={120} viewBox="0 0 110 120" style={{ overflow: "visible" }}>
            <SvgLink x1={6} y1={60} x2={104} y2={60} progress={progressBetween(frame, codingCue - 20, codingCue + 10)} tone="emerald" arrow strokeWidth={3} />
            <SvgPacket x1={6} y1={60} x2={104} y2={60} progress={progressBetween(frame, codingCue - 12, codingCue + 24)} tone="emerald" label="Handoff" />
          </svg>

          <div style={slideUpStyle(frame, fps, codingCue - 16, 20)}>
            <Card tone="emerald" glow={frame >= codingCue} padding={26}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <Pill tone="emerald" size="sm">PHASE 2 • REPEATING SHIFTS</Pill>
                  <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700, marginTop: 8 }}>
                    Coding Agent Loop (1 Item / Shift)
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <CheckRow
                  label="1. Reproduce auth.ts token race"
                  detail="Write failing concurrency test + commit"
                  status={item1Done ? "COMMITTED" : "PENDING"}
                  tone="emerald"
                  active={item1Done}
                />
                <CheckRow
                  label="2. Add single-flight refresh lock"
                  detail="Patch auth.ts + update feature-list.json"
                  status={item2Done ? "COMMITTED" : "QUEUED"}
                  tone="emerald"
                  active={item2Done}
                />
                <CheckRow
                  label="3. Verify concurrency & error paths"
                  detail="All tests pass + update claude-progress.txt"
                  status={item3Done ? "VERIFIED" : "QUEUED"}
                  tone="emerald"
                  active={item3Done}
                />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
