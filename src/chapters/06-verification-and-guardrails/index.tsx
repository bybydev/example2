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
import type { ChapterComponentProps } from "../index";

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
    <Stage chapterIndex="06" chapterTitle={chapter.title} tone="emerald" transientHeader compactPadding>
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

      {/* BEAT 23: Full-Canvas Open-Loop vs Closed-Loop Verification (Zero SectionTitle chrome) */}
      <SceneBeat window={w23}>
        <div style={{ display: "grid", gridTemplateColumns: "0.80fr 1.20fr", gap: 36, alignItems: "stretch", height: 720 }}>
          <div style={slideUpStyle(frame, fps, b23.start + 14, 18)}>
            <Card tone="rose" glow={frame >= hopesCue && frame < verifyCue} padding={34} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <Pill tone="rose" size="md">OPEN-LOOP AGENT</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 40, fontWeight: 700, marginTop: 14 }}>
                  Write Code &amp; Hope
                </div>
                <p style={{ fontSize: 22, color: TOKENS.colors.textSecondary, marginTop: 12, lineHeight: 1.45 }}>
                  No compiler, no tests, no diff audit — ships silent regressions.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0" }}>
                <NodeBox title="Generate" tone="amber" style={{ flex: 1, textAlign: "center" }} />
                <span style={{ color: TOKENS.colors.accentRose, fontSize: 34, fontWeight: 800 }}>→</span>
                <NodeBox title="Hope?" tone="rose" style={{ flex: 1, textAlign: "center" }} />
              </div>
              <MeterBar label="Single-Shot Reliability" percent={58} valueLabel="~58%" tone="rose" height={22} />
            </Card>
          </div>

          <div style={slideUpStyle(frame, fps, verifyCue - 12, 18)}>
            <Card tone="emerald" glow={frame >= auditsCue} padding={34} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Pill tone="emerald" size="md">CLOSED-LOOP HARNESS • CURSOR / WINDSURF / CLI</Pill>
                  <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 38, fontWeight: 700, marginTop: 10 }}>
                    Tests, LSP Linters &amp; Self-Check Audit
                  </div>
                </div>
                <AnimatedNumber
                  from={58}
                  to={92}
                  progress={reliabilityJump}
                  suffix="%"
                  tone="emerald"
                  size={56}
                />
              </div>

              <div style={{ position: "relative", width: 880, height: 450, margin: "0 auto" }}>
                <svg width={880} height={450} viewBox="0 0 880 450" style={{ position: "absolute", inset: 0 }}>
                  <SvgLink x1={310} y1={84} x2={540} y2={84} progress={closedLoopDraw} tone="cyan" strokeWidth={3.5} arrow />
                  <SvgLink x1={705} y1={154} x2={705} y2={290} progress={closedLoopDraw} tone="amber" strokeWidth={3.5} arrow />
                  <SvgLink x1={540} y1={358} x2={310} y2={358} progress={closedLoopDraw} tone="emerald" strokeWidth={3.5} arrow />
                  <SvgLink x1={155} y1={290} x2={155} y2={154} progress={closedLoopDraw} tone="cyan" strokeWidth={3.5} arrow />
                </svg>

                <NodeBox tag="1. EDIT" title="Patch Code" subtitle="Scoped diff applied" tone="cyan" style={{ position: "absolute", left: 10, top: 20, width: 295 }} />
                <NodeBox tag="2. VERIFY" title="LSP • Tests • Self-Check" subtitle="Typecheck + diff audit" tone="emerald" glow={frame >= auditsCue} style={{ position: "absolute", left: 545, top: 20, width: 325 }} />
                <NodeBox tag="3. SIGNAL" title="Ground-Truth Error" subtitle="Exact line & stack trace" tone="amber" style={{ position: "absolute", left: 545, top: 295, width: 325 }} />
                <NodeBox tag="4. FIX" title="Self-Correct" subtitle="Iterates until green" tone="emerald" glow={frame >= auditsCue} style={{ position: "absolute", left: 10, top: 295, width: 295 }} />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 24: Full-Canvas Prompt Begging vs Deterministic Hooks (Zero SectionTitle chrome) */}
      <SceneBeat window={w24}>
        <div style={{ display: "grid", gridTemplateColumns: "0.84fr 1.16fr", gap: 36, alignItems: "center" }}>
          <div style={slideUpStyle(frame, fps, beggingCue - 12, 18)}>
            <CodePanel
              title="Prompt Begging (Probabilistic)"
              badge="FORGOTTEN AT TURN 20"
              tone="rose"
              lines={PROMPT_BEGGING}
              fontSize={22}
              style={{ opacity: frame >= hooksCue ? 0.42 : 1 }}
            />
          </div>

          <div style={slideUpStyle(frame, fps, hooksCue - 12, 18)}>
            <Card tone="cyan" glow={frame >= hooksCue} padding={34}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <Pill tone="cyan" size="md">CLAUDE CODE LIFECYCLE HOOKS</Pill>
                <Pill tone="emerald" size="md">100% ENFORCED IN CODE</Pill>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <CheckRow
                  label="PreToolUse Hook — Policy Gate"
                  detail="Inspects every call before running; blocks .env and secret paths outright"
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

      {/* BEAT 25: Full-Canvas Concentric Physical Sandbox (Zero SectionTitle chrome) */}
      <SceneBeat window={w25}>
        <div style={{ maxWidth: 1580, width: "100%", margin: "0 auto" }}>
          <Card tone="neutral" padding={30} style={{ borderStyle: "dashed", borderWidth: 2 }}>
            <div style={{ fontFamily: TOKENS.fonts.mono, fontSize: 18, color: TOKENS.colors.textMuted, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>HOST MACHINE / PRODUCTION INFRASTRUCTURE (PROTECTED)</span>
              <Pill tone="rose" size="md" style={{ opacity: fadeIn(frame, egressCue, 14) }}>
                ✗ BLOCKED: rm -rf ~ / curl secrets
              </Pill>
            </div>

            <Card tone="emerald" glow={frame >= contCue} padding={30}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Pill tone="emerald" size="md">DOCKER • MICROVM • SEATBELT • BUBBLEWRAP</Pill>
                <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: 16, color: TOKENS.colors.textSecondary }}>
                  Codex • Devin • OpenHands • GitHub Copilot Agent
                </span>
              </div>

              <Card tone="cyan" padding={30}>
                <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 30, alignItems: "center" }}>
                  <NodeBox
                    tag="ARBITRARY CODE EXECUTION"
                    title="Agent Shell Tool"
                    subtitle="Runs builds, scripts & untrusted commands safely inside walls"
                    tone="amber"
                    glow={frame >= arbCue && frame < contCue}
                    style={{ minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center" }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <CheckRow label="Writable Filesystem Scope" detail="Pinned strictly to /workspace" status="SCOPED" tone="cyan" active={frame >= contCue} />
                    <CheckRow label="Network Egress Policy" detail="Blocks secret exfiltration & external hosts" status="DENIED" tone="emerald" active={frame >= egressCue} />
                  </div>
                </div>
              </Card>
            </Card>
          </Card>
        </div>
      </SceneBeat>

      {/* BEAT 26: Spacious Tiered Permissions Stack (Clean 1-line title only) */}
      <SceneBeat window={w26}>
        <SectionTitle
          title="Tiered Permissions: Fast Where Safe, Gated Where Risky"
          tone="cyan"
          style={{ marginBottom: 30 }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1520, width: "100%", margin: "0 auto" }}>
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
            <Card tone="amber" glow={frame >= approvalCue} padding={30} style={{ opacity: frame >= destructiveCue ? 1 : 0.45 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
                <div>
                  <Pill tone="rose" size="md">TIER 3 — DESTRUCTIVE / EXTERNAL / PROD</Pill>
                  <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 32, fontWeight: 700, marginTop: 10 }}>
                    git push • Database Writes • Deleting Files • External APIs
                  </div>
                  <div style={{ fontSize: 20, color: TOKENS.colors.textSecondary, marginTop: 6 }}>
                    Harness pauses execution and waits for explicit human sign-off before running.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
                  <Pill tone="emerald" size="lg">✓ Approve</Pill>
                  <Pill tone="rose" size="lg">✗ Deny</Pill>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 27: Full-Canvas Loop Breakers & Graceful Escalation (Zero SectionTitle chrome) */}
      <SceneBeat window={w27}>
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 110px 0.78fr 110px 1.05fr", alignItems: "center" }}>
          <Card tone={frame >= doomCue ? "rose" : "amber"} glow={frame >= doomCue && frame < breakerCue} padding={32}>
            <Pill tone="rose" size="md">DOOM-LOOP TELEMETRY</Pill>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 22 }}>
              <MeterBar label="Turn Cap" percent={48} valueLabel="12 / 25" tone="amber" height={20} />
              <MeterBar label="Dollar Spend" percent={74} valueLabel="$1.84 / $2.50" tone="amber" height={20} />
              <MeterBar
                label="Repeat Identical Error"
                percent={frame >= doomCue ? 100 : 33}
                valueLabel={frame >= doomCue ? "3 / 3 TRIPPED" : "1 / 3"}
                tone="rose"
                height={20}
              />
            </div>
          </Card>

          <svg width={110} height={80} viewBox="0 0 110 80">
            <SvgLink x1={6} y1={40} x2={104} y2={40} progress={progressBetween(frame, breakerCue - 12, breakerCue + 12)} tone="amber" strokeWidth={3.5} arrow />
          </svg>

          <NodeBox
            tag="DETERMINISTIC STOP"
            title="Circuit Breaker"
            subtitle="Halts loop cleanly on repeat error or cap"
            tone="cyan"
            glow={frame >= breakerCue}
            style={{ minHeight: 220, display: "flex", flexDirection: "column", justifyContent: "center" }}
          />

          <svg width={110} height={80} viewBox="0 0 110 80">
            <SvgLink x1={6} y1={40} x2={104} y2={40} progress={progressBetween(frame, escalateCue - 12, escalateCue + 12)} tone="emerald" strokeWidth={3.5} arrow />
            <SvgPacket x1={6} y1={40} x2={104} y2={40} progress={progressBetween(frame, escalateCue, escalateCue + 30)} tone="emerald" radius={10} label="Report" />
          </svg>

          <div style={slideUpStyle(frame, fps, b27.start + 20, 16)}>
            <Card tone="emerald" glow={frame >= escalateCue} padding={32} style={{ opacity: frame >= escalateCue - 10 ? 1 : 0.35, minHeight: 270, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Pill tone="emerald" size="md">GRACEFUL HUMAN HANDOFF</Pill>
              <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 32, fontWeight: 700, marginTop: 14 }}>
                Structured Diagnosis
              </div>
              <p style={{ fontSize: 20, color: TOKENS.colors.textSecondary, marginTop: 10, lineHeight: 1.5 }}>
                Clean working diff, exact failing assertion, and what was already tried — zero wasted spin.
              </p>
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
