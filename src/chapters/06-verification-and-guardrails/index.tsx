import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../lib/audio";
import { TOKENS } from "../../theme/tokens";
import { CheckRow, CodePanel, NodeBox, SvgLink, SvgPacket } from "../../ui/diagrams";
import type { CodeLine } from "../../ui/diagrams";
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

const PROMPT_BEGGING: CodeLine[] = [
  { text: "SYSTEM PROMPT (FRAGILE):", tone: "rose" },
  { text: "NEVER TOUCH .env FILES!!!", tone: "rose", highlight: true },
  { text: "PLEASE ALWAYS RUN TYPECHECK", tone: "amber" },
  { text: "BEFORE ANSWERING! IMPORTANT!!", tone: "amber" },
  { text: "→ forgotten 20 turns later...", tone: "neutral" },
];

export const VerificationAndGuardrailsChapter: React.FC<ChapterComponentProps> = ({
  chapter,
  clips,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c23 = clips[0];
  const c24 = clips[1];
  const c25 = clips[2];
  const c26 = clips[3];
  const c27 = clips[4];

  const b23 = clipRange(c23, chapter.startFrame, 0, 1000);
  const b24 = clipRange(c24, chapter.startFrame, b23.end, 980);
  const b25 = clipRange(c25, chapter.startFrame, b24.end, 980);
  const b26 = clipRange(c26, chapter.startFrame, b25.end, 1000);
  const b27 = clipRange(c27, chapter.startFrame, b26.end, 1000);

  // Beat 23 cues
  const hopesCue = cueFrame(c23, "hopes", 280, chapter.startFrame);
  const verifyCue = cueFrame(c23, "verification", 410, chapter.startFrame);
  const auditsCue = cueFrame(c23, "audits", 760, chapter.startFrame);

  // Beat 24 cues
  const beggingCue = cueFrame(c24, "begging", 110, chapter.startFrame);
  const hooksCue = cueFrame(c24, "hooks", 480, chapter.startFrame);

  // Beat 25 cues
  const arbCue = cueFrame(c25, "arbitrary", 150, chapter.startFrame);
  const contCue = cueFrame(c25, "container", 460, chapter.startFrame);
  const egressCue = cueFrame(c25, "egress", 740, chapter.startFrame);

  // Beat 26 cues
  const silentlyCue = cueFrame(c26, "silently", 390, chapter.startFrame);
  const scopedCue = cueFrame(c26, "scoped", 490, chapter.startFrame);
  const destructiveCue = cueFrame(c26, "destructive", 680, chapter.startFrame);
  const approvalCue = cueFrame(c26, "approval", 840, chapter.startFrame);

  // Beat 27 cues
  const doomCue = cueFrame(c27, "doom", 120, chapter.startFrame);
  const breakerCue = cueFrame(c27, "breaker", 540, chapter.startFrame);
  const escalateCue = cueFrame(c27, "escalate", 760, chapter.startFrame);

  const w23 = sceneWindow(frame, b23.start, b23.end);
  const w24 = sceneWindow(frame, b24.start, b24.end);
  const w25 = sceneWindow(frame, b25.start, b25.end);
  const w26 = sceneWindow(frame, b26.start, b26.end);
  const w27 = sceneWindow(frame, b27.start, b27.end, { keepAtEnd: true });

  const closedLoopDraw = progressBetween(frame, verifyCue, verifyCue + 34);
  const reliabilityJump = progressBetween(frame, auditsCue, auditsCue + 40);

  return (
    <Stage chapterIndex="06" chapterTitle={chapter.title} tone="emerald" legend={LEGEND}>
      {/* SFX */}
      <Sfx name="slide" from={hopesCue} volume={0.26} />
      <Sfx name="magnetic-snap" from={verifyCue} volume={0.3} />
      <Sfx name="scale-up" from={auditsCue} volume={0.25} />
      <Sfx name="success-ding" from={auditsCue + 14} volume={0.28} />

      <Sfx name="error-buzz" from={beggingCue} volume={0.26} />
      <Sfx name="toggle-on" from={hooksCue} volume={0.28} />

      <Sfx name="thud-low" from={arbCue} volume={0.28} />
      <Sfx name="magnetic-snap" from={contCue} volume={0.3} />
      <Sfx name="error-buzz" from={egressCue} volume={0.28} />

      <Sfx name="pop-in" from={silentlyCue} volume={0.28} />
      <Sfx name="click-subtle" from={scopedCue} volume={0.26} />
      <Sfx name="mouse-click" from={approvalCue} volume={0.32} />

      <Sfx name="glitch-short" from={doomCue} volume={0.28} />
      <Sfx name="toggle-off" from={breakerCue} volume={0.28} />
      <Sfx name="chime-positive" from={escalateCue} volume={0.28} />

      {/* BEAT 23: Closed-Loop Verification */}
      <SceneBeat window={w23}>
        <SectionTitle
          eyebrow="PILLAR 04 — VERIFICATION & SANDBOXES"
          title="Closed-Loop Verification: The Reliability Multiplier"
          tone="emerald"
        />

        <div style={{ display: "grid", gridTemplateColumns: "0.82fr 1.18fr", gap: 30, alignItems: "stretch" }}>
          <div style={slideUpStyle(frame, fps, b23.start + 14, 18)}>
            <Card tone="rose" glow={frame >= hopesCue && frame < verifyCue} padding={26} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <Pill tone="rose" size="sm">OPEN-LOOP AGENT</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700, marginTop: 10 }}>
                  Write Code &amp; Hope
                </div>
                <p style={{ fontSize: 19, color: TOKENS.colors.textSecondary, marginTop: 8 }}>
                  No compiler, no tests, no diff audit — ships silent regressions.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "18px 0" }}>
                <NodeBox title="Generate" tone="amber" compact style={{ flex: 1, textAlign: "center" }} />
                <span style={{ color: TOKENS.colors.accentRose, fontSize: 28, fontWeight: 800 }}>→</span>
                <NodeBox title="Hope?" tone="rose" compact style={{ flex: 1, textAlign: "center" }} />
              </div>
              <MeterBar label="Single-Shot Reliability" percent={58} valueLabel="~58%" tone="rose" height={18} />
            </Card>
          </div>

          <div style={slideUpStyle(frame, fps, verifyCue - 12, 18)}>
            <Card tone="emerald" glow={frame >= auditsCue} padding={26} style={{ height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <Pill tone="emerald" size="sm">CLOSED-LOOP HARNESS • CURSOR / WINDSURF / CLI</Pill>
                  <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 28, fontWeight: 700, marginTop: 6 }}>
                    Tests, LSP Linters &amp; Self-Check Audit
                  </div>
                </div>
                <AnimatedNumber
                  from={58}
                  to={92}
                  progress={reliabilityJump}
                  suffix="%"
                  tone="emerald"
                  size={44}
                />
              </div>

              <div style={{ position: "relative", width: 820, height: 305, margin: "0 auto" }}>
                <svg width={820} height={305} viewBox="0 0 820 305" style={{ position: "absolute", inset: 0 }}>
                  <SvgLink x1={275} y1={58} x2={505} y2={58} progress={closedLoopDraw} tone="cyan" arrow />
                  <SvgLink x1={655} y1={108} x2={655} y2={192} progress={closedLoopDraw} tone="amber" arrow />
                  <SvgLink x1={505} y1={242} x2={275} y2={242} progress={closedLoopDraw} tone="emerald" arrow />
                  <SvgLink x1={140} y1={192} x2={140} y2={108} progress={closedLoopDraw} tone="cyan" arrow />
                </svg>

                <NodeBox tag="1. EDIT" title="Patch Code" subtitle="Scoped diff applied" tone="cyan" compact style={{ position: "absolute", left: 10, top: 12, width: 260 }} />
                <NodeBox tag="2. VERIFY" title="LSP • Tests • Self-Check" subtitle="Typecheck + diff audit" tone="emerald" glow={frame >= auditsCue} compact style={{ position: "absolute", left: 510, top: 12, width: 290 }} />
                <NodeBox tag="3. SIGNAL" title="Ground-Truth Error" subtitle="Exact line & stack trace" tone="amber" compact style={{ position: "absolute", left: 510, top: 196, width: 290 }} />
                <NodeBox tag="4. FIX" title="Self-Correct" subtitle="Iterates until green" tone="emerald" glow={frame >= auditsCue} compact style={{ position: "absolute", left: 10, top: 196, width: 260 }} />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 24: Deterministic Hooks Over Prompt Begging */}
      <SceneBeat window={w24}>
        <SectionTitle
          eyebrow="PILLAR 04 — DETERMINISTIC MIDDLEWARE (CLAUDE CODE)"
          title="Enforce Invariants With Hooks, Not Prompt Begging"
          tone="emerald"
        />

        <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 30, alignItems: "center" }}>
          <div style={slideUpStyle(frame, fps, beggingCue - 12, 18)}>
            <CodePanel
              title="Prompt Begging (Probabilistic)"
              badge="IGNORES AT TURN 20"
              tone="rose"
              lines={PROMPT_BEGGING}
              fontSize={18}
              style={{ opacity: frame >= hooksCue ? 0.42 : 1 }}
            />
          </div>

          <div style={slideUpStyle(frame, fps, hooksCue - 12, 18)}>
            <Card tone="cyan" glow={frame >= hooksCue} padding={26}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Pill tone="cyan" size="sm">DETERMINISTIC LIFECYCLE HOOKS</Pill>
                <Pill tone="emerald" size="sm">100% ENFORCED IN CODE</Pill>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <CheckRow
                  label="PreToolUse Hook — Policy Gate"
                  detail="Inspects call before execution; blocks .env and secret paths outright"
                  status="BLOCKED .env"
                  tone="emerald"
                  active={frame >= hooksCue}
                />
                <CheckRow
                  label="Tool Execution — Edit auth.ts"
                  detail="Applies targeted patch inside allowed repository scope"
                  status="APPLIED"
                  tone="cyan"
                  active={frame >= hooksCue + 18}
                />
                <CheckRow
                  label="PostToolUse Hook — Auto-Verify"
                  detail="Runs TypeScript compiler + auth.test.ts automatically after edit"
                  status="TSC + TESTS ✓"
                  tone="emerald"
                  active={frame >= hooksCue + 36}
                />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 25: Sandboxing & Hard Isolation Boundaries */}
      <SceneBeat window={w25}>
        <SectionTitle
          eyebrow="PILLAR 04 — PHYSICAL CONTAINMENT"
          title="Shell Access = Arbitrary Code Execution. Sandbox It."
          subtitle="Codex • Devin • OpenHands • GitHub Copilot Coding Agent"
          tone="emerald"
        />

        <div style={{ position: "relative", maxWidth: 1420, width: "100%", margin: "0 auto" }}>
          <Card tone="neutral" padding={22} style={{ borderStyle: "dashed" }}>
            <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: 15, color: TOKENS.colors.textMuted, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
              <span>HOST MACHINE / PRODUCTION INFRASTRUCTURE (PROTECTED)</span>
              <span style={{ color: TOKENS.colors.accentRose, opacity: fadeIn(frame, egressCue, 14) }}>
                ✗ BLOCKED: rm -rf ~ / curl secrets
              </span>
            </div>

            <Card tone="emerald" glow={frame >= contCue} padding={22}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <Pill tone="emerald" size="sm">EPHEMERAL DOCKER CONTAINER / MICROVM / SEATBELT • BUBBLEWRAP</Pill>
                <Pill tone="rose" size="sm" style={{ opacity: fadeIn(frame, egressCue, 14) }}>
                  EGRESS RESTRICTED
                </Pill>
              </div>

              <Card tone="cyan" padding={22}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, alignItems: "center" }}>
                  <NodeBox
                    tag="UNTRUSTED EXECUTION"
                    title="Agent Shell Tool"
                    subtitle="Runs arbitrary builds, scripts & tests"
                    tone="amber"
                    glow={frame >= arbCue && frame < contCue}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <CheckRow label="Writable Filesystem Scope" detail="Pinned strictly to /workspace" status="SCOPED" tone="cyan" active={frame >= contCue} />
                    <CheckRow label="Network Egress Policy" detail="Blocks secret exfiltration & external hosts" status="DENIED" tone="emerald" active={frame >= egressCue} />
                  </div>
                </div>
              </Card>
            </Card>
          </Card>
        </div>
      </SceneBeat>

      {/* BEAT 26: Tiered Permissions & Human Approval Gates */}
      <SceneBeat window={w26}>
        <SectionTitle
          eyebrow="PILLAR 04 — PERMISSION UX & TRUST"
          title="Tiered Permissions: Fast Where Safe, Gated Where Risky"
          tone="cyan"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1460, width: "100%", margin: "0 auto" }}>
          <div style={slideUpStyle(frame, fps, b26.start + 12, 16)}>
            <CheckRow
              label="Tier 1 — Read-Only Inspection (read_file, grep, git status)"
              detail="Zero side effects — runs silently with zero friction"
              status="AUTO-ALLOW"
              tone="emerald"
              active={frame >= silentlyCue}
            />
          </div>

          <div style={slideUpStyle(frame, fps, b26.start + 22, 16)}>
            <CheckRow
              label="Tier 2 — Scoped Workspace Edits & Local Tests"
              detail="Contained inside the sandbox directory — allowed by policy"
              status="SANDBOX POLICY"
              tone="cyan"
              active={frame >= scopedCue}
            />
          </div>

          <div style={slideUpStyle(frame, fps, b26.start + 32, 16)}>
            <Card tone="amber" glow={frame >= approvalCue} padding={24} style={{ opacity: frame >= destructiveCue ? 1 : 0.45 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
                <div>
                  <Pill tone="rose" size="sm">TIER 3 — DESTRUCTIVE / EXTERNAL / PROD</Pill>
                  <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 28, fontWeight: 700, marginTop: 8 }}>
                    git push • Database Writes • Deleting Files • External APIs
                  </div>
                  <div style={{ fontSize: 18, color: TOKENS.colors.textSecondary, marginTop: 4 }}>
                    Harness pauses execution and waits for explicit human sign-off before running.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                  <Pill tone="emerald" size="lg">✓ Approve</Pill>
                  <Pill tone="rose" size="lg">✗ Deny</Pill>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 27: Loop Breakers, Budgets & Graceful Escalation */}
      <SceneBeat window={w27}>
        <SectionTitle
          eyebrow="PILLAR 04 — STOP CONDITIONS"
          title="Break Doom Loops Before They Burn Your Budget"
          tone="amber"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 0.75fr 110px 1fr", alignItems: "center" }}>
          <Card tone={frame >= doomCue ? "rose" : "amber"} glow={frame >= doomCue && frame < breakerCue} padding={24}>
            <Pill tone="rose" size="sm">LIVE TELEMETRY</Pill>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
              <MeterBar label="Turn Cap" percent={48} valueLabel="12 / 25" tone="amber" height={16} />
              <MeterBar label="Dollar Spend" percent={74} valueLabel="$1.84 / $2.50" tone="amber" height={16} />
              <MeterBar
                label="Repeat Identical Error"
                percent={frame >= doomCue ? 100 : 33}
                valueLabel={frame >= doomCue ? "3 / 3 TRIPPED" : "1 / 3"}
                tone="rose"
                height={16}
              />
            </div>
          </Card>

          <svg width={110} height={80} viewBox="0 0 110 80">
            <SvgLink x1={6} y1={40} x2={104} y2={40} progress={progressBetween(frame, breakerCue - 12, breakerCue + 12)} tone="amber" arrow />
          </svg>

          <NodeBox
            tag="DETERMINISTIC STOP"
            title="Circuit Breaker"
            subtitle="Halts loop cleanly on repeat error or cap"
            tone="cyan"
            glow={frame >= breakerCue}
          />

          <svg width={110} height={80} viewBox="0 0 110 80">
            <SvgLink x1={6} y1={40} x2={104} y2={40} progress={progressBetween(frame, escalateCue - 12, escalateCue + 12)} tone="emerald" arrow />
            <SvgPacket x1={6} y1={40} x2={104} y2={40} progress={progressBetween(frame, escalateCue, escalateCue + 30)} tone="emerald" label="Report" />
          </svg>

          <div style={slideUpStyle(frame, fps, b27.start + 20, 16)}>
            <Card tone="emerald" glow={frame >= escalateCue} padding={24} style={{ opacity: frame >= escalateCue - 10 ? 1 : 0.35 }}>
              <Pill tone="emerald" size="sm">GRACEFUL HUMAN HANDOFF</Pill>
              <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 26, fontWeight: 700, marginTop: 10 }}>
                Structured Diagnosis
              </div>
              <p style={{ fontSize: 18, color: TOKENS.colors.textSecondary, marginTop: 8, lineHeight: 1.45 }}>
                Clean working diff, exact failing assertion, and what was already tried — zero wasted spin.
              </p>
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
