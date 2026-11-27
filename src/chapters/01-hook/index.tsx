import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../lib/audio";
import { TOKENS } from "../../theme/tokens";
import type { SemanticTone } from "../../theme/tokens";
import { NodeBox, SvgLink } from "../../ui/diagrams";
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
  MeterBar,
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

const FAMOUS_HARNESSES = [
  "Claude Code",
  "Codex",
  "Cursor",
  "Gemini CLI",
  "OpenCode",
  "Devin",
  "OpenHands",
];

const PILLARS: {
  num: string;
  title: string;
  subtitle: string;
  badge: string;
  tone: SemanticTone;
}[] = [
  {
    num: "01",
    title: "Loop & Tool Calling",
    subtitle: "Think → Act → Observe → Repeat & JSON schemas",
    badge: "SINGLE-AGENT",
    tone: "cyan",
  },
  {
    num: "02",
    title: "Context & Caching",
    subtitle: "Context rot, KV prefix stability & compaction",
    badge: "SINGLE-AGENT",
    tone: "cyan",
  },
  {
    num: "03",
    title: "Memory & Durable State",
    subtitle: "Filesystem, JSON checklists & multi-session shifts",
    badge: "SINGLE-AGENT",
    tone: "cyan",
  },
  {
    num: "04",
    title: "Verification & Sandboxes",
    subtitle: "Tests, hooks, containers, permissions & breakers",
    badge: "SINGLE-AGENT",
    tone: "cyan",
  },
  {
    num: "05",
    title: "Sub-agents & Scale",
    subtitle: "Context isolation, parallel worktrees & cloud runners",
    badge: "NEXT LEVEL",
    tone: "emerald",
  },
  {
    num: "06",
    title: "Evals & Evolution",
    subtitle: "Trajectories, pass^k consistency & build-to-delete",
    badge: "PRODUCTION",
    tone: "emerald",
  },
];

export const HookChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c1 = clips[0];
  const c2 = clips[1];
  const c3 = clips[2];

  const b1 = clipRange(c1, chapter.startFrame, 0, 880);
  const b2 = clipRange(c2, chapter.startFrame, b1.end, 820);
  const b3 = clipRange(c3, chapter.startFrame, b2.end, 820);

  // Beat 1 cues
  const identicalCue = cueFrame(c1, "identical", 30, chapter.startFrame);
  const failsCue = cueFrame(c1, "fails", 480, chapter.startFrame);
  const passesCue = cueFrame(c1, "passes", 640, chapter.startFrame);

  // Beat 2 cues
  const harnessCue = cueFrame(c2, "harness", 35, chapter.startFrame);
  const operatingCue = cueFrame(c2, "operating", 310, chapter.startFrame);

  // Beat 3 cues
  const loopCue = cueFrame(c3, "loop", 270, chapter.startFrame);
  const contextCue = cueFrame(c3, "context", 340, chapter.startFrame);
  const memoryCue = cueFrame(c3, "memory", 410, chapter.startFrame);
  const verifyCue = cueFrame(c3, "verification", 480, chapter.startFrame);
  const delegationCue = cueFrame(c3, "delegation", 570, chapter.startFrame);
  const evalsCue = cueFrame(c3, "evals", 660, chapter.startFrame);

  const w1 = sceneWindow(frame, b1.start, b1.end);
  const w2 = sceneWindow(frame, b2.start, b2.end);
  const w3 = sceneWindow(frame, b3.start, b3.end, { keepAtEnd: true });

  const link1 = progressBetween(frame, identicalCue + 6, identicalCue + 34);
  const failMeter = 24 * progressBetween(frame, failsCue, failsCue + 36);
  const passMeter = 88 * progressBetween(frame, passesCue, passesCue + 40);

  const pillarCues = [loopCue, contextCue, memoryCue, verifyCue, delegationCue, evalsCue];

  return (
    <Stage chapterIndex="01" chapterTitle={chapter.title} tone="cyan" legend={LEGEND}>
      {/* Beat 1 SFX */}
      <Sfx name="pop-in" from={identicalCue} volume={0.3} />
      <Sfx name="error-buzz" from={failsCue} volume={0.28} />
      <Sfx name="chime-positive" from={passesCue} volume={0.28} />

      {/* Beat 2 SFX */}
      <Sfx name="bass-drop" from={harnessCue} volume={0.22} durationInFrames={90} />
      <Sfx name="marker-draw" from={operatingCue} volume={0.28} />

      {/* Beat 3 SFX */}
      <Sfx name="pop-in" from={loopCue} volume={0.25} />
      <Sfx name="click-subtle" from={contextCue} volume={0.24} />
      <Sfx name="click-subtle" from={memoryCue} volume={0.24} />
      <Sfx name="click-subtle" from={verifyCue} volume={0.24} />
      <Sfx name="pop-in" from={delegationCue} volume={0.26} />
      <Sfx name="chime-positive" from={evalsCue} volume={0.25} />

      {/* BEAT 1: Identical Model, Wildly Different Results */}
      <SceneBeat window={w1}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <SectionTitle
            eyebrow="THE HARNESS PARADOX"
            title="Same Frontier Model. Opposite Outcomes."
            tone="cyan"
            style={{ marginBottom: 0 }}
          />
          <Pill tone="amber" size="md">
            TASK: FIX RACE CONDITION IN auth.ts
          </Pill>
        </div>

        {/* Top shared model node */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            ...slideUpStyle(frame, fps, identicalCue, 20),
          }}
        >
          <NodeBox
            tag="IDENTICAL WEIGHTS • IDENTICAL API"
            title="Same Frontier Language Model"
            subtitle="Zero difference in intelligence, parameters, or training data"
            tone="amber"
            glow
            compact
            style={{ width: 560, textAlign: "center" }}
          />
        </div>

        {/* Fork connectors */}
        <div style={{ display: "flex", justifyContent: "center", height: 70 }}>
          <svg width={900} height={70} viewBox="0 0 900 70" style={{ overflow: "visible" }}>
            <SvgLink x1={450} y1={4} x2={210} y2={66} progress={link1} tone="rose" arrow />
            <SvgLink x1={450} y1={4} x2={690} y2={66} progress={link1} tone="emerald" arrow />
          </svg>
        </div>

        {/* Split Agent Comparison */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div style={slideUpStyle(frame, fps, identicalCue + 20, 20)}>
            <Card tone={frame >= failsCue ? "rose" : "neutral"} glow={frame >= failsCue} padding={26}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700 }}>
                  Agent A — Weak Harness
                </span>
                <Pill tone={frame >= failsCue ? "rose" : "amber"} size="sm">
                  {frame >= failsCue ? "FAILED • 20 TURNS" : "RUNNING..."}
                </Pill>
              </div>
              <p style={{ margin: "0 0 18px", fontSize: 21, color: TOKENS.colors.textSecondary, lineHeight: 1.4 }}>
                Burns context in a blind retry loop, opaque errors, no verification feedback.
              </p>
              <MeterBar
                label="Benchmark Solve Rate"
                percent={failMeter}
                valueLabel={frame >= failsCue ? `${Math.round(failMeter)}%` : "—"}
                tone="rose"
                height={20}
              />
            </Card>
          </div>

          <div style={slideUpStyle(frame, fps, identicalCue + 32, 20)}>
            <Card tone={frame >= passesCue ? "emerald" : "neutral"} glow={frame >= passesCue} padding={26}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700 }}>
                  Agent B — Strong Harness
                </span>
                <Pill tone={frame >= passesCue ? "emerald" : "cyan"} size="sm">
                  {frame >= passesCue ? "TESTS PASSING" : "RUNNING..."}
                </Pill>
              </div>
              <p style={{ margin: "0 0 18px", fontSize: 21, color: TOKENS.colors.textSecondary, lineHeight: 1.4 }}>
                Isolates auth.ts race, applies targeted patch, verifies with deterministic tests.
              </p>
              <MeterBar
                label="Benchmark Solve Rate"
                percent={passMeter}
                valueLabel={frame >= passesCue ? `${Math.round(passMeter)}%` : "—"}
                tone="emerald"
                height={20}
              />
            </Card>
          </div>
        </div>

        {/* Real-world harness strip */}
        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
            opacity: fadeIn(frame, identicalCue + 24, 18),
          }}
        >
          <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: 15, color: TOKENS.colors.textMuted }}>
            SWE-BENCH &amp; TERMINAL-BENCH ECOSYSTEM:
          </span>
          {FAMOUS_HARNESSES.map((name) => (
            <DataChip key={name} label={name} tone="cyan" style={{ padding: "6px 14px", fontSize: 16 }} />
          ))}
        </div>
      </SceneBeat>

      {/* BEAT 2: The Core Thesis */}
      <SceneBeat window={w2} align="center">
        <div style={{ width: "100%", maxWidth: 1480, textAlign: "center" }}>
          <SectionTitle
            eyebrow="CORE THESIS"
            title="The Model Is Not the Agent"
            subtitle="Raw intelligence is stateless — the harness turns it into reliable engineering software."
            tone="cyan"
            align="center"
          />

          <div style={slideUpStyle(frame, fps, harnessCue, 24)}>
            <Card
              tone="cyan"
              glow
              padding={44}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 32,
                marginTop: 12,
              }}
            >
              <NodeBox
                tag="INTELLIGENCE"
                title="Model"
                subtitle="Reasoning & planning"
                tone="amber"
                style={{ minWidth: 280, textAlign: "center" }}
              />
              <span
                style={{
                  fontFamily: TOKENS.fonts.display,
                  fontSize: 60,
                  fontWeight: 800,
                  color: TOKENS.colors.textSecondary,
                }}
              >
                +
              </span>
              <NodeBox
                tag="RUNTIME SYSTEM"
                title="Harness"
                subtitle="Tools, memory, safety, tests"
                tone="cyan"
                glow
                style={{ minWidth: 320, textAlign: "center" }}
              />
              <span
                style={{
                  fontFamily: TOKENS.fonts.display,
                  fontSize: 60,
                  fontWeight: 800,
                  color: TOKENS.colors.textSecondary,
                }}
              >
                =
              </span>
              <NodeBox
                tag="OUTCOME"
                title="Reliable Agent"
                subtitle="Closed-loop software"
                tone="emerald"
                glow={frame >= operatingCue}
                style={{ minWidth: 300, textAlign: "center" }}
              />
            </Card>
          </div>

          <div
            style={{
              marginTop: 34,
              opacity: fadeIn(frame, operatingCue, 16),
              transform: `translateY(${(1 - fadeIn(frame, operatingCue, 16)) * 14}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            <span
              style={{
                fontFamily: TOKENS.fonts.handwritten,
                fontSize: 48,
                fontWeight: 700,
                color: TOKENS.colors.accentWarm,
              }}
            >
              CPU without an Operating System → needs the Harness OS!
            </span>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 3: 6-Pillar Architecture Map */}
      <SceneBeat window={w3}>
        <SectionTitle
          eyebrow="ARCHITECTURE ROADMAP"
          title="6 Pillars of a Production Agent Harness"
          subtitle="Four single-agent foundations, followed by next-level delegation and production evals."
          tone="cyan"
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
          {PILLARS.map((pillar, index) => {
            const trigger = pillarCues[index];
            const active = frame >= trigger;
            return (
              <div key={pillar.num} style={slideUpStyle(frame, fps, b3.start + index * 6, 18)}>
                <NodeBox
                  title={pillar.title}
                  subtitle={pillar.subtitle}
                  tone={pillar.tone}
                  glow={active}
                  dim={!active && frame > loopCue - 15}
                  style={{ height: "100%", minHeight: 195, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
                    <Pill tone={pillar.tone} size="sm">
                      PILLAR {pillar.num}
                    </Pill>
                    <span
                      style={{
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 13,
                        fontWeight: 700,
                        color: active ? TOKENS.colors.textPrimary : TOKENS.colors.textMuted,
                      }}
                    >
                      {pillar.badge}
                    </span>
                  </div>
                </NodeBox>
              </div>
            );
          })}
        </div>
      </SceneBeat>
    </Stage>
  );
};
