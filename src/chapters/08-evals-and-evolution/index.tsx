import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../lib/audio";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import type { SemanticTone } from "../../theme/tokens";
import { NodeBox } from "../../ui/diagrams";
import {
  clipRange,
  cueFrame,
  fadeIn,
  progressBetween,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import {
  AnimatedNumber,
  Card,
  DataChip,
  MeterBar,
  Pill,
  SceneBeat,
  SectionTitle,
  StatCallout,
} from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const TRACE_TURNS: {
  turn: string;
  action: string;
  offsetPct: number;
  widthPct: number;
  meta: string;
  tone: SemanticTone;
  highlightOnReplay?: boolean;
}[] = [
  { turn: "Turn 1", action: "read_file(auth.ts)", offsetPct: 0, widthPct: 16, meta: "0.7s • cache 82%", tone: "cyan" },
  { turn: "Turn 2", action: "grep_search(refreshToken)", offsetPct: 16, widthPct: 14, meta: "0.5s • cache 87%", tone: "cyan" },
  { turn: "Turn 3", action: "edit_file(auth.ts)", offsetPct: 30, widthPct: 18, meta: "1.1s • patch applied", tone: "amber" },
  { turn: "Turn 4", action: "run_shell(vitest auth.test.ts) [FAIL]", offsetPct: 48, widthPct: 26, meta: "2.4s • exit 1 (replay)", tone: "rose", highlightOnReplay: true },
  { turn: "Turn 5", action: "edit_file + vitest [PASS]", offsetPct: 74, widthPct: 26, meta: "1.9s • exit 0 ✓", tone: "emerald" },
];

export const EvalsAndEvolutionChapter: React.FC<ChapterComponentProps> = ({
  chapter,
  clips,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c31 = clips[0];
  const c32 = clips[1];
  const c33 = clips[2];
  const c34 = clips[3];

  const b31 = clipRange(c31, chapter.startFrame, 0, 920);
  const b32 = clipRange(c32, chapter.startFrame, b31.end, 940);
  const b33 = clipRange(c33, chapter.startFrame, b32.end, 920);
  const b34 = clipRange(c34, chapter.startFrame, b33.end, 950);

  // Beat 31 cues
  const trajCue = cueFrame(c31, "trajectories", 300, chapter.startFrame);
  const replayCue = cueFrame(c31, "replay", 740, chapter.startFrame);

  // Beat 32 cues
  const consCue = cueFrame(c32, "consistency", 340, chapter.startFrame);
  const costCue = cueFrame(c32, "cost", 800, chapter.startFrame);

  // Beat 33 cues
  const matrixCue = cueFrame(c33, "matrix", 80, chapter.startFrame);
  const throtCue = cueFrame(c33, "throttles", 430, chapter.startFrame);
  const stripCue = cueFrame(c33, "stripping", 760, chapter.startFrame);

  // Beat 34 cues
  const permCue = cueFrame(c34, "permanent", 270, chapter.startFrame);
  const delCue = cueFrame(c34, "delete", 730, chapter.startFrame);

  const w31 = sceneWindow(frame, b31.start, b31.end);
  const w32 = sceneWindow(frame, b32.start, b32.end);
  const w33 = sceneWindow(frame, b33.start, b33.end);
  const w34 = sceneWindow(frame, b34.start, b34.end, { keepAtEnd: true });

  const pass3Progress = progressBetween(frame, consCue, consCue + 40);
  const costDrop = progressBetween(frame, costCue, costCue + 36);
  const deleteProgress = progressBetween(frame, delCue, delCue + 45);

  return (
    <Stage chapterIndex="08" chapterTitle={chapter.title} tone="cyan" transientHeader compactPadding>
      {/* SFX */}
      <Sfx name="whoosh-soft" from={trajCue} volume={0.25} />
      <Sfx name="camera-shutter" from={replayCue} volume={0.28} />

      <Sfx name="scale-up" from={consCue} volume={0.26} />
      <Sfx name="cash-chime" from={costCue} volume={0.28} />

      <Sfx name="slide" from={matrixCue} volume={0.26} />
      <Sfx name="thud-low" from={throtCue} volume={0.28} />
      <Sfx name="chime-positive" from={stripCue} volume={0.28} />

      <Sfx name="magnetic-snap" from={permCue} volume={0.3} />
      <Sfx name="pop-out" from={delCue} volume={0.28} />

      {/* BEAT 31: Full-Canvas Flight Recorder Trace Waterfall (Zero SectionTitle chrome) */}
      <SceneBeat window={w31}>
        <Card tone="cyan" padding={34}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Pill tone="cyan" size="md">FLIGHT RECORDER TRACE</Pill>
              <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 32, fontWeight: 700 }}>
                auth.ts — 5-Turn Trajectory
              </span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <DataChip label="TTFT 0.8s" tone="cyan" style={{ fontSize: 17, padding: "9px 14px" }} />
              <DataChip label="Cache 88%" tone="emerald" style={{ fontSize: 17, padding: "9px 14px" }} />
              <DataChip label="Cost $0.14" tone="amber" style={{ fontSize: 17, padding: "9px 14px" }} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {TRACE_TURNS.map((row, idx) => {
              const barReveal = progressBetween(frame, trajCue + idx * 14, trajCue + idx * 14 + 26);
              const t = TONE_STYLES[row.tone];
              const focused = Boolean(row.highlightOnReplay && frame >= replayCue);
              return (
                <div
                  key={row.turn}
                  style={{
                    height: 76,
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 250px",
                    alignItems: "center",
                    gap: 20,
                    padding: "0 18px",
                    borderRadius: 14,
                    backgroundColor: focused ? "rgba(251, 113, 133, 0.16)" : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${focused ? TOKENS.colors.accentRose : TOKENS.colors.border}`,
                  }}
                >
                  <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: 19, fontWeight: 700, color: TOKENS.colors.textSecondary }}>
                    {row.turn}
                  </span>
                  <div style={{ position: "relative", height: 44, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, overflow: "hidden" }}>
                    <div
                      style={{
                        position: "absolute",
                        left: `${row.offsetPct}%`,
                        width: `${row.widthPct * barReveal}%`,
                        height: "100%",
                        backgroundColor: t.bg,
                        border: `2px solid ${t.main}`,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 14,
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 17,
                        fontWeight: 700,
                        color: t.main,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      {row.action}
                    </div>
                  </div>
                  <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: 16, color: focused ? TOKENS.colors.accentRose : TOKENS.colors.textMuted, textAlign: "right" }}>
                    {row.meta}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </SceneBeat>

      {/* BEAT 32: Spacious Evals Dashboard (Clean 1-line title only) */}
      <SceneBeat window={w32}>
        <SectionTitle
          title="Measure Consistency (pass^k), Not Lucky Runs (pass@k)"
          tone="cyan"
          style={{ marginBottom: 32 }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, marginBottom: 28 }}>
          <StatCallout
            label="Reliability (pass^3)"
            value={
              <AnimatedNumber
                from={51}
                to={86}
                progress={pass3Progress}
                suffix="%"
                tone="emerald"
                size={60}
              />
            }
            detail="Succeeds 3/3 consecutive runs"
            tone="emerald"
            glow={frame >= consCue}
          />
          <StatCallout
            label="Cost / Solved Task"
            value={
              <AnimatedNumber
                from={1.45}
                to={0.42}
                progress={costDrop}
                decimals={2}
                prefix="$"
                tone="cyan"
                size={60}
              />
            }
            detail="Driven down by caching & clean diffs"
            tone="cyan"
            glow={frame >= costCue}
          />
          <StatCallout
            label="Median Turns"
            value={
              <AnimatedNumber
                from={19}
                to={7}
                progress={costDrop}
                suffix=" turns"
                tone="amber"
                size={54}
              />
            }
            detail="Fewer retries via actionable tool errors"
            tone="amber"
          />
        </div>

        <Card tone="neutral" padding={30} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <MeterBar label="Harness v1 — pass^3 Consistency (80% single-run → 99% pass@3, 51% pass^3)" percent={51} valueLabel="51.2%" tone="amber" height={24} />
          <MeterBar
            label="Harness v2 — pass^3 Consistency (95% single-run)"
            percent={interpolate(pass3Progress, [0, 1], [51, 86])}
            valueLabel={`${Math.round(interpolate(pass3Progress, [0, 1], [51, 86]))}%`}
            tone="emerald"
            height={24}
          />
        </Card>
      </SceneBeat>

      {/* BEAT 33: Full-Canvas 2x2 Evaluation Matrix (Zero SectionTitle chrome) */}
      <SceneBeat window={w33}>
        <Card tone="neutral" padding={36} style={{ maxWidth: 1520, width: "100%", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr", gap: 26, alignItems: "stretch" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Pill tone="cyan" size="md">2×2 EVAL MATRIX</Pill>
            </div>
            <div style={{ textAlign: "center", fontFamily: TOKENS.fonts.mono, fontSize: 20, fontWeight: 700, color: TOKENS.colors.accentWarm, display: "flex", alignItems: "center", justifyContent: "center" }}>
              HEAVY HARNESS v1 (RIGID SCAFFOLD)
            </div>
            <div style={{ textAlign: "center", fontFamily: TOKENS.fonts.mono, fontSize: 20, fontWeight: 700, color: TOKENS.colors.accentEmerald, display: "flex", alignItems: "center", justifyContent: "center" }}>
              THIN HARNESS v2 (MINIMAL PRIMITIVES)
            </div>

            <div style={{ display: "flex", alignItems: "center", fontFamily: TOKENS.fonts.display, fontSize: 32, fontWeight: 700, color: TOKENS.colors.textSecondary }}>
              Last-Gen Model A
            </div>
            <NodeBox tag="OLD BASELINE" title="64% Solved" subtitle="Rigid prompt scaffold helped rescue weak reasoning" tone="amber" style={{ minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center" }} />
            <NodeBox tag="UNDER-GUIDED" title="52% Solved" subtitle="Older model struggled without guardrails" tone="neutral" dim style={{ minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center" }} />

            <div style={{ display: "flex", alignItems: "center", fontFamily: TOKENS.fonts.display, fontSize: 32, fontWeight: 700, color: TOKENS.colors.textPrimary }}>
              Frontier Model B
            </div>
            <div style={{ opacity: frame >= throtCue - 16 ? 1 : 0.38 }}>
              <NodeBox
                tag="THROTTLED BY OLD SCAFFOLD"
                title="71% Solved"
                subtitle="Legacy chains & routers box in stronger reasoning"
                tone="rose"
                glow={frame >= throtCue && frame < stripCue}
                style={{ minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center" }}
              />
            </div>
            <div style={{ opacity: frame >= stripCue - 16 ? 1 : 0.38 }}>
              <NodeBox
                tag="STRIPPING CONSTRAINTS WINS"
                title="89% Solved (+18%)"
                subtitle="Removing legacy workarounds unlocks frontier capability"
                tone="emerald"
                glow={frame >= stripCue}
                style={{ minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center" }}
              />
            </div>
          </div>
        </Card>
      </SceneBeat>

      {/* BEAT 34: Spacious Build-to-Delete Generational Timeline (Clean 1-line title only) */}
      <SceneBeat window={w34}>
        <SectionTitle
          title="Build Temporary Workarounds to Delete"
          tone="emerald"
          style={{ marginBottom: 28 }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <Card tone="amber" padding={28}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <Pill tone="rose" size="md">TEMPORARY MODEL WORKAROUNDS — SHED OVER GENERATIONS</Pill>
              <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: 17, color: TOKENS.colors.textSecondary }}>
                MODEL GEN 1 → GEN 2 → GEN 3
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
              {[
                { gen: "GEN 1", items: ["JSON Repair Shim", "Rigid Chain Router", "Verbose CoT Nudge"] },
                { gen: "GEN 2", items: ["Rigid Chain Router", "Verbose CoT Nudge"] },
                { gen: "GEN 3", items: ["All Legacy Shims Deleted ✓"] },
              ].map((col, idx) => {
                const lift = idx < 2 ? interpolate(deleteProgress, [0, 1], [0, -18]) : 0;
                const op = idx < 2 ? interpolate(deleteProgress, [0, 1], [1, 0.25]) : 0.35 + 0.65 * fadeIn(frame, delCue + 6, 16);
                return (
                  <div
                    key={col.gen}
                    style={{
                      padding: 20,
                      borderRadius: 18,
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: `1px solid ${TOKENS.colors.border}`,
                      transform: `translateY(${lift}px)`,
                      opacity: op,
                    }}
                  >
                    <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: 17, fontWeight: 700, color: idx === 2 ? TOKENS.colors.accentEmerald : TOKENS.colors.accentWarm, marginBottom: 12 }}>
                      {col.gen}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {col.items.map((chip) => (
                        <DataChip
                          key={chip}
                          label={chip}
                          tone={idx === 2 ? "emerald" : "rose"}
                          style={{ fontSize: 17, padding: "10px 12px" }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div style={slideUpStyle(frame, fps, permCue - 12, 16)}>
            <Card tone="cyan" glow={frame >= permCue} padding={30}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <Pill tone="emerald" size="md">PERMANENT HARNESS INFRASTRUCTURE — KEEP FOREVER</Pill>
                <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: 16, color: TOKENS.colors.accent }}>
                  Claude Agent SDK • OpenAI Agents SDK • LangChain Deep Agents (LangGraph)
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
                <DataChip label="Sandboxes" sublabel="OS / container isolation" tone="emerald" style={{ fontSize: 19, padding: "16px 14px" }} />
                <DataChip label="Deterministic Verifiers" sublabel="Tests, types & hooks" tone="emerald" style={{ fontSize: 19, padding: "16px 14px" }} />
                <DataChip label="Prompt Caching" sublabel="Prefix & context hygiene" tone="cyan" style={{ fontSize: 19, padding: "16px 14px" }} />
                <DataChip label="Trajectory Traces" sublabel="Replayable evals" tone="cyan" style={{ fontSize: 19, padding: "16px 14px" }} />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
