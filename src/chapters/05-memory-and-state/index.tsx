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
} from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

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
    <Stage chapterIndex="05" chapterTitle={chapter.title} tone="cyan" transientHeader compactPadding>
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

      {/* BEAT 20: Full-Canvas Single-Window Stall Trajectory (Zero SectionTitle chrome) */}
      <SceneBeat window={w20}>
        <Card tone={frame >= loseCue ? "rose" : "amber"} padding={34} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Pill tone="rose" size="md">SINGLE-WINDOW MULTI-HOUR RUN</Pill>
            <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: 16, color: TOKENS.colors.textMuted }}>
              WHY EPHEMERAL CHAT THREADS STALL
            </span>
          </div>

          <div style={{ position: "relative", height: 410 }}>
            <svg width={1640} height={410} viewBox="0 0 1640 410">
              <line x1={60} y1={350} x2={1580} y2={350} stroke="rgba(255,255,255,0.16)" strokeWidth={2.5} />
              <line x1={60} y1={36} x2={60} y2={350} stroke="rgba(255,255,255,0.16)" strokeWidth={2.5} />

              <SvgLink x1={60} y1={340} x2={560} y2={115} progress={curveProgress} tone="amber" strokeWidth={5} />
              <SvgLink x1={560} y1={115} x2={1100} y2={145} progress={progressBetween(frame, premCue - 30, premCue + 10)} tone="rose" strokeWidth={5} dashed />
              <SvgLink x1={1100} y1={145} x2={1540} y2={225} progress={progressBetween(frame, loseCue, loseCue + 35)} tone="rose" strokeWidth={5} dashed />

              <text x={84} y={62} fill={TOKENS.colors.textMuted} fontFamily={TOKENS.fonts.mono} fontSize={17}>
                TASK COMPLETION %
              </text>
              <text x={1410} y={388} fill={TOKENS.colors.textMuted} fontFamily={TOKENS.fonts.mono} fontSize={17}>
                SESSION TURNS →
              </text>
            </svg>

            <div style={{ position: "absolute", left: 260, top: 48, opacity: fadeIn(frame, b20.start + 60, 16) }}>
              <Pill tone="amber" size="md">1. ONE-SHOT OVERREACH → CONTEXT FULL</Pill>
            </div>
            <div style={{ position: "absolute", left: 740, top: 44, opacity: fadeIn(frame, premCue, 14) }}>
              <Pill tone="rose" size="lg">✗ PREMATURE &quot;DONE!&quot;</Pill>
            </div>
            <div style={{ position: "absolute", left: 1150, top: 235, opacity: fadeIn(frame, loseCue, 16) }}>
              <Pill tone="rose" size="md">FORGOTTEN EDGE CASES</Pill>
            </div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <NodeBox
            tag="FAILURE MODE A"
            title="Context Exhausted Mid-Refactor"
            subtitle="Tries to implement everything at once until working memory overflows."
            tone="rose"
            dim={frame >= loseCue}
          />
          <NodeBox
            tag="FAILURE MODE B"
            title="Premature Victory"
            subtitle="Fixes the happy path and loses subtle edge cases across dozens of steps."
            tone="rose"
            glow={frame >= premCue}
          />
        </div>
      </SceneBeat>

      {/* BEAT 21: Full-Canvas Workspace Disk as Durable Memory (Zero SectionTitle chrome) */}
      <SceneBeat window={w21}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 1440, ...slideUpStyle(frame, fps, diskCue, 18) }}>
            <Card tone="cyan" glow={frame >= diskCue} padding={34}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 38, fontWeight: 700 }}>
                  Workspace Disk — Durable External Memory
                </span>
                <Pill tone="emerald" size="md">SURVIVES CONTEXT RESETS</Pill>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
                <DataChip label="todo.md" sublabel="Live goal recitation (Manus)" tone="cyan" style={{ fontSize: 22, padding: "20px 18px" }} />
                <DataChip label="feature-list.json" sublabel="Structured JSON > Markdown" tone="emerald" style={{ fontSize: 22, padding: "20px 18px" }} />
                <DataChip
                  label="git log / commits"
                  sublabel="Clean auth.ts checkpoints"
                  tone="amber"
                  dim={frame < commitsCue}
                  style={{ fontSize: 22, padding: "20px 18px" }}
                />
              </div>
            </Card>
          </div>

          <svg width={1360} height={124} viewBox="0 0 1360 124" style={{ overflow: "visible" }}>
            <SvgLink x1={300} y1={6} x2={220} y2={116} progress={progressBetween(frame, diskCue + 12, diskCue + 36)} tone="cyan" strokeWidth={3.5} arrow />
            <SvgLink x1={680} y1={6} x2={680} y2={116} progress={progressBetween(frame, commitsCue, commitsCue + 24)} tone="cyan" strokeWidth={3.5} arrow />
            <SvgLink x1={1060} y1={6} x2={1140} y2={116} progress={progressBetween(frame, orientCue, orientCue + 24)} tone="emerald" strokeWidth={3.5} arrow />
            <SvgPacket x1={1060} y1={6} x2={1140} y2={116} progress={progressBetween(frame, orientCue + 4, orientCue + 36)} tone="emerald" radius={10} label="State" />
          </svg>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, width: "100%", maxWidth: 1480 }}>
            <NodeBox tag="SESSION 1" title="Fresh Context Window" subtitle="Reads specs, sets reproducer, commits" tone="cyan" style={{ minHeight: 165 }} />
            <NodeBox tag="SESSION 2" title="Fresh Context Window" subtitle="Reads git log + JSON, implements fix" tone="cyan" glow={frame >= commitsCue} style={{ minHeight: 165 }} />
            <NodeBox tag="SESSION 3" title="Fresh Context Window" subtitle="Orients in seconds, verifies edge cases" tone="emerald" glow={frame >= orientCue} style={{ minHeight: 165 }} />
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 22: Full-Canvas Initializer + Coding Agent Pipeline (Zero SectionTitle chrome) */}
      <SceneBeat window={w22}>
        <div style={{ display: "grid", gridTemplateColumns: "0.92fr 120px 1.28fr", alignItems: "center" }}>
          <div style={slideUpStyle(frame, fps, initCue - 12, 20)}>
            <Card tone="cyan" glow={frame >= initCue && frame < codingCue} padding={34}>
              <Pill tone="cyan" size="md">PHASE 1 • RUNS ONCE (ANTHROPIC PATTERN)</Pill>
              <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 38, fontWeight: 700, marginTop: 14, marginBottom: 22 }}>
                Initializer Agent
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <DataChip label="init.sh" sublabel="Boot & environment script" tone="cyan" style={{ alignItems: "flex-start", fontSize: 21, padding: "16px 20px" }} />
                <DataChip label="feature-list.json" sublabel="Scoped verifiable JSON checklist" tone="emerald" style={{ alignItems: "flex-start", fontSize: 21, padding: "16px 20px" }} />
                <DataChip label="claude-progress.txt" sublabel="Shift handoff log + baseline commit" tone="amber" style={{ alignItems: "flex-start", fontSize: 21, padding: "16px 20px" }} />
              </div>
            </Card>
          </div>

          <svg width={120} height={120} viewBox="0 0 120 120" style={{ overflow: "visible" }}>
            <SvgLink x1={6} y1={60} x2={114} y2={60} progress={progressBetween(frame, codingCue - 20, codingCue + 10)} tone="emerald" arrow strokeWidth={4} />
            <SvgPacket x1={6} y1={60} x2={114} y2={60} progress={progressBetween(frame, codingCue - 12, codingCue + 24)} tone="emerald" radius={10} label="Handoff" />
          </svg>

          <div style={slideUpStyle(frame, fps, codingCue - 16, 20)}>
            <Card tone="emerald" glow={frame >= codingCue} padding={34}>
              <Pill tone="emerald" size="md">PHASE 2 • REPEATING FRESH SHIFTS</Pill>
              <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 38, fontWeight: 700, marginTop: 14, marginBottom: 22 }}>
                Coding Agent Loop (1 Item / Shift)
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
