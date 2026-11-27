import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../lib/audio";
import { TOKENS } from "../../theme/tokens";
import type { SemanticTone } from "../../theme/tokens";
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
import type { ChapterComponentProps } from "../index";

const DOMAINS: {
  key: string;
  title: string;
  examples: string;
  tools: string;
  verifier: string;
  tone: SemanticTone;
  badge?: string;
}[] = [
  {
    key: "coding",
    title: "Coding Agents",
    examples: "Claude Code • Codex • Cursor • OpenCode",
    tools: "Shell, Edit, Grep, Git",
    verifier: "Tests, Types & LSP",
    tone: "cyan",
    badge: "OUR RUNNING LAB",
  },
  {
    key: "browser",
    title: "Browser & Computer-Use",
    examples: "ChatGPT Agent / CUA • Claude Computer Use • Browser Use • Manus",
    tools: "Click, Type, DOM, Screenshot",
    verifier: "Visual State & Approvals",
    tone: "amber",
  },
  {
    key: "research",
    title: "Deep Research & Knowledge",
    examples: "Deep Research • Enterprise RAG",
    tools: "Search, Fetch, Query DB",
    verifier: "Citation Grounding",
    tone: "emerald",
  },
  {
    key: "ops",
    title: "Support, SRE & Operations",
    examples: "Incident Triage • Back-Office Ops",
    tools: "Logs, Metrics, Tickets, APIs",
    verifier: "Policy + Human Gate",
    tone: "neutral",
  },
];

export const ModelVsHarnessChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c4 = clips[0];
  const c5 = clips[1];
  const c6 = clips[2];
  const c7 = clips[3];
  const c8 = clips[4];

  const b4 = clipRange(c4, chapter.startFrame, 0, 860);
  const b5 = clipRange(c5, chapter.startFrame, b4.end, 860);
  const b6 = clipRange(c6, chapter.startFrame, b5.end, 860);
  const b7 = clipRange(c7, chapter.startFrame, b6.end, 860);
  const b8 = clipRange(c8, chapter.startFrame, b7.end, 960);

  // Beat 4 cues
  const modelCue = cueFrame(c4, "model", 160, chapter.startFrame);
  const harnessCue = cueFrame(c4, "harness", 320, chapter.startFrame);
  const appCue = cueFrame(c4, "application", 620, chapter.startFrame);

  // Beat 5 cues
  const statelessCue = cueFrame(c5, "stateless", 120, chapter.startFrame);
  const changesCue = cueFrame(c5, "changes", 340, chapter.startFrame);
  const envCue = cueFrame(c5, "environment", 430, chapter.startFrame);

  // Beat 6 cues
  const rigidCue = cueFrame(c6, "rigid", 170, chapter.startFrame);
  const breaksCue = cueFrame(c6, "breaks", 450, chapter.startFrame);
  const modernCue = cueFrame(c6, "modern", 510, chapter.startFrame);
  const minimalCue = cueFrame(c6, "minimal", 620, chapter.startFrame);

  // Beat 7 cues
  const reasoningCue = cueFrame(c7, "reasoning", 90, chapter.startFrame);
  const detCue = cueFrame(c7, "deterministic", 310, chapter.startFrame);

  // Beat 8 cues
  const browserCue = cueFrame(c8, "browser", 240, chapter.startFrame);
  const researchCue = cueFrame(c8, "research", 450, chapter.startFrame);
  const opsCue = cueFrame(c8, "operations", 580, chapter.startFrame);
  const labCue = cueFrame(c8, "laboratory", 780, chapter.startFrame);

  const w4 = sceneWindow(frame, b4.start, b4.end);
  const w5 = sceneWindow(frame, b5.start, b5.end);
  const w6 = sceneWindow(frame, b6.start, b6.end);
  const w7 = sceneWindow(frame, b7.start, b7.end);
  const w8 = sceneWindow(frame, b8.start, b8.end, { keepAtEnd: true });

  const loopDraw = progressBetween(frame, envCue, envCue + 36);
  const loopCycle = frame >= envCue ? ((frame - envCue) % 120) / 120 : 0;
  const perimLinks = progressBetween(frame, detCue, detCue + 30);

  return (
    <Stage chapterIndex="02" chapterTitle={chapter.title} tone="cyan" transientHeader compactPadding>
      {/* SFX */}
      <Sfx name="slide" from={modelCue} volume={0.26} />
      <Sfx name="magnetic-snap" from={harnessCue} volume={0.3} />
      <Sfx name="pop-in" from={appCue} volume={0.26} />

      <Sfx name="whoosh-soft" from={statelessCue} volume={0.24} />
      <Sfx name="power-up" from={envCue} volume={0.22} durationInFrames={65} />

      <Sfx name="thud-low" from={rigidCue} volume={0.28} />
      <Sfx name="glitch-short" from={breaksCue} volume={0.26} />
      <Sfx name="chime-positive" from={minimalCue} volume={0.28} />

      <Sfx name="pop-in" from={reasoningCue} volume={0.28} />
      <Sfx name="magnetic-snap" from={detCue} volume={0.3} />

      <Sfx name="pop-in" from={browserCue} volume={0.26} />
      <Sfx name="click-subtle" from={researchCue} volume={0.24} />
      <Sfx name="click-subtle" from={opsCue} volume={0.24} />
      <Sfx name="chime-positive" from={labCue} volume={0.28} />

      {/* BEAT 4: Spacious 3-Layer Stack (Clean 1-line title only) */}
      <SceneBeat window={w4}>
        <SectionTitle
          title="Three Layers of Every AI Product"
          tone="cyan"
          align="center"
          style={{ marginBottom: 32 }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 1520, width: "100%", margin: "0 auto" }}>
          <div style={slideUpStyle(frame, fps, appCue, 18)}>
            <Card tone="neutral" padding={28} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
              <div>
                <Pill tone="neutral" size="sm">LAYER 3 • APPLICATION / UX</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 34, fontWeight: 700, marginTop: 10 }}>
                  Interface &amp; Workflow Surface
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <DataChip label="Terminal CLI" tone="neutral" style={{ fontSize: 18, padding: "10px 16px" }} />
                <DataChip label="IDE Editor Pane" tone="neutral" style={{ fontSize: 18, padding: "10px 16px" }} />
                <DataChip label="PR / Web UI" tone="neutral" style={{ fontSize: 18, padding: "10px 16px" }} />
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", justifyContent: "center", height: 58 }}>
            <svg width={260} height={58} viewBox="0 0 260 58">
              <SvgLink x1={90} y1={4} x2={90} y2={54} progress={progressBetween(frame, appCue, appCue + 20)} tone="neutral" strokeWidth={3} arrow />
              <SvgLink x1={170} y1={54} x2={170} y2={4} progress={progressBetween(frame, appCue, appCue + 20)} tone="cyan" strokeWidth={3} arrow />
            </svg>
          </div>

          <div style={slideUpStyle(frame, fps, harnessCue, 18)}>
            <Card tone="cyan" glow={frame >= harnessCue} padding={32} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
              <div>
                <Pill tone="cyan" size="md">LAYER 2 • THE AGENT HARNESS</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 36, fontWeight: 700, marginTop: 10 }}>
                  Loop, Tools, Context, State &amp; Safety Gates
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 680 }}>
                {["Claude Code", "Codex CLI", "Gemini CLI", "Cursor", "Windsurf Cascade"].map((h) => (
                  <DataChip key={h} label={h} tone="cyan" style={{ fontSize: 17, padding: "9px 15px" }} />
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", justifyContent: "center", height: 58 }}>
            <svg width={260} height={58} viewBox="0 0 260 58">
              <SvgLink x1={90} y1={4} x2={90} y2={54} progress={progressBetween(frame, harnessCue, harnessCue + 20)} tone="cyan" strokeWidth={3} arrow />
              <SvgLink x1={170} y1={54} x2={170} y2={4} progress={progressBetween(frame, harnessCue, harnessCue + 20)} tone="amber" strokeWidth={3} arrow />
              <SvgPacket x1={170} y1={54} x2={170} y2={4} progress={progressBetween(frame, harnessCue + 10, harnessCue + 46)} tone="amber" label="Tokens" />
            </svg>
          </div>

          <div style={slideUpStyle(frame, fps, modelCue, 18)}>
            <Card tone="amber" glow={frame >= modelCue && frame < harnessCue} padding={28} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
              <div>
                <Pill tone="amber" size="sm">LAYER 1 • FOUNDATION MODEL</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 34, fontWeight: 700, marginTop: 10 }}>
                  Stateless Next-Token Prediction Engine
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <DataChip label="Claude" tone="amber" style={{ fontSize: 18, padding: "10px 16px" }} />
                <DataChip label="GPT" tone="amber" style={{ fontSize: 18, padding: "10px 16px" }} />
                <DataChip label="Gemini" tone="amber" style={{ fontSize: 18, padding: "10px 16px" }} />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 5: Full-Canvas Stateless API vs Closed Harness Loop (Zero SectionTitle chrome) */}
      <SceneBeat window={w5}>
        <div style={{ display: "grid", gridTemplateColumns: "0.84fr 1.16fr", gap: 36, alignItems: "stretch", height: 740 }}>
          {/* Left: Stateless Raw API */}
          <div style={slideUpStyle(frame, fps, statelessCue, 20)}>
            <Card tone="amber" padding={34} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <Pill tone="amber" size="md">RAW LLM API</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 42, fontWeight: 700, marginTop: 16 }}>
                  Stateless &amp; Blind
                </div>
                <p style={{ fontSize: 23, color: TOKENS.colors.textSecondary, marginTop: 12, lineHeight: 1.45 }}>
                  One prompt in, one text completion out — then the interaction ends.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "24px 0" }}>
                <NodeBox title="Prompt" tone="neutral" style={{ width: 170, textAlign: "center" }} />
                <svg width={95} height={40} viewBox="0 0 95 40">
                  <SvgLink x1={4} y1={20} x2={91} y2={20} progress={progressBetween(frame, statelessCue, statelessCue + 24)} tone="amber" strokeWidth={3} arrow />
                </svg>
                <NodeBox title="LLM" tone="amber" style={{ width: 135, textAlign: "center" }} />
                <svg width={95} height={40} viewBox="0 0 95 40">
                  <SvgLink x1={4} y1={20} x2={91} y2={20} progress={progressBetween(frame, statelessCue + 12, statelessCue + 36)} tone="amber" strokeWidth={3} arrow />
                </svg>
                <NodeBox title="Stop" tone="rose" style={{ width: 125, textAlign: "center" }} />
              </div>

              <Pill tone="rose" size="md" style={{ alignSelf: "flex-start" }}>
                NO FILES • NO TERMINAL • NO FEEDBACK
              </Pill>
            </Card>
          </div>

          {/* Right: Massive 4-node Harness Loop */}
          <div style={slideUpStyle(frame, fps, changesCue - 8, 20)}>
            <Card tone="cyan" glow={frame >= envCue} padding={34} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Pill tone="cyan" size="md">AGENT HARNESS</Pill>
                  <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 40, fontWeight: 700, marginTop: 12 }}>
                    Iterative Environment Controller
                  </div>
                </div>
                <Pill tone="emerald" size="md">CLOSED LOOP</Pill>
              </div>

              <div style={{ position: "relative", width: 840, height: 470, margin: "0 auto" }}>
                <svg width={840} height={470} viewBox="0 0 840 470" style={{ position: "absolute", inset: 0 }}>
                  <SvgLink x1={300} y1={90} x2={520} y2={90} progress={loopDraw} tone="amber" strokeWidth={3.5} arrow />
                  <SvgLink x1={675} y1={165} x2={675} y2={305} progress={loopDraw} tone="cyan" strokeWidth={3.5} arrow />
                  <SvgLink x1={520} y1={375} x2={300} y2={375} progress={loopDraw} tone="emerald" strokeWidth={3.5} arrow />
                  <SvgLink x1={155} y1={305} x2={155} y2={165} progress={loopDraw} tone="cyan" strokeWidth={3.5} arrow />

                  {frame >= envCue && loopCycle < 0.25 ? (
                    <SvgPacket x1={300} y1={90} x2={520} y2={90} progress={loopCycle * 4} tone="amber" radius={11} />
                  ) : null}
                  {frame >= envCue && loopCycle >= 0.25 && loopCycle < 0.5 ? (
                    <SvgPacket x1={675} y1={165} x2={675} y2={305} progress={(loopCycle - 0.25) * 4} tone="cyan" radius={11} />
                  ) : null}
                  {frame >= envCue && loopCycle >= 0.5 && loopCycle < 0.75 ? (
                    <SvgPacket x1={520} y1={375} x2={300} y2={375} progress={(loopCycle - 0.5) * 4} tone="emerald" radius={11} />
                  ) : null}
                  {frame >= envCue && loopCycle >= 0.75 ? (
                    <SvgPacket x1={155} y1={305} x2={155} y2={165} progress={(loopCycle - 0.75) * 4} tone="cyan" radius={11} />
                  ) : null}
                </svg>

                <NodeBox tag="1. REASON" title="Model" subtitle="Plans next step" tone="amber" style={{ position: "absolute", left: 10, top: 24, width: 285 }} />
                <NodeBox tag="2. PROPOSE" title="Action" subtitle="Tool call request" tone="cyan" style={{ position: "absolute", left: 530, top: 24, width: 295 }} />
                <NodeBox tag="3. EXECUTE" title="Environment" subtitle="Real files, shell & tests" tone="emerald" glow={frame >= envCue} style={{ position: "absolute", left: 530, top: 312, width: 295 }} />
                <NodeBox tag="4. OBSERVE" title="Feedback" subtitle="Actual output & exit code" tone="cyan" style={{ position: "absolute", left: 10, top: 312, width: 285 }} />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 6: Full-Canvas Rigid Frameworks vs Thin Unix Harnesses (Zero SectionTitle chrome) */}
      <SceneBeat window={w6}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, height: 700 }}>
          <div style={slideUpStyle(frame, fps, rigidCue, 20)}>
            <Card tone="rose" padding={34} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 38, fontWeight: 700 }}>
                  Heavy Rigid Frameworks
                </span>
                <Pill tone="rose" size="md">
                  {frame >= breaksCue ? "BRITTLE • BREAKS" : "HARDCODED"}
                </Pill>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {[
                  { t: "Fixed Prompt Chain", s: "Hardcoded step order" },
                  { t: "Static DAG Router", s: "Second-guesses model" },
                  { t: "Regex Output Parser", s: "Snaps on format drift" },
                  { t: "Nested Retry Wrapper", s: "Hides root failures" },
                ].map((item) => (
                  <NodeBox
                    key={item.t}
                    title={item.t}
                    subtitle={item.s}
                    tone="rose"
                    dim={frame >= breaksCue}
                    style={{ minHeight: 155, display: "flex", flexDirection: "column", justifyContent: "center" }}
                  />
                ))}
              </div>

              <div style={{ fontSize: 21, color: TOKENS.colors.accentRose, fontFamily: TOKENS.fonts.mono }}>
                {frame >= breaksCue ? "✗ Stronger model ships → scaffolding fights it & breaks" : "Hardcodes yesterday's workarounds into graph topology"}
              </div>
            </Card>
          </div>

          <div style={slideUpStyle(frame, fps, modernCue - 8, 20)}>
            <Card tone="cyan" glow={frame >= minimalCue} padding={34} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 38, fontWeight: 700 }}>
                  Thin Unix-Style Harnesses
                </span>
                <Pill tone="emerald" size="md">THE BITTER LESSON</Pill>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                {[
                  { t: "Shell", s: "Composable CLI power" },
                  { t: "Files", s: "Direct read & patch" },
                  { t: "Search", s: "Fast repo navigation" },
                  { t: "Verify", s: "Tests & typechecks" },
                ].map((item) => (
                  <NodeBox
                    key={item.t}
                    title={item.t}
                    subtitle={item.s}
                    tone="cyan"
                    glow={frame >= minimalCue}
                    style={{ minHeight: 155, display: "flex", flexDirection: "column", justifyContent: "center" }}
                  />
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Pill tone="cyan" size="md">Claude Code</Pill>
                <Pill tone="cyan" size="md">OpenCode</Pill>
                <Pill tone="cyan" size="md">Aider</Pill>
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 7: Full-Canvas Orbital Core + Perimeter (Zero SectionTitle chrome) */}
      <SceneBeat window={w7}>
        <div style={{ position: "relative", width: 1620, height: 700, margin: "0 auto" }}>
          <svg width={1620} height={700} viewBox="0 0 1620 700" style={{ position: "absolute", inset: 0 }}>
            <SvgLink x1={615} y1={285} x2={470} y2={175} progress={perimLinks} tone="cyan" strokeWidth={3.5} arrow />
            <SvgLink x1={1005} y1={285} x2={1150} y2={175} progress={perimLinks} tone="cyan" strokeWidth={3.5} arrow />
            <SvgLink x1={615} y1={415} x2={470} y2={525} progress={perimLinks} tone="cyan" strokeWidth={3.5} arrow />
            <SvgLink x1={1005} y1={415} x2={1150} y2={525} progress={perimLinks} tone="cyan" strokeWidth={3.5} arrow />
          </svg>

          <div
            style={{
              position: "absolute",
              left: 590,
              top: 225,
              width: 440,
              ...slideUpStyle(frame, fps, reasoningCue, 18),
            }}
          >
            <Card tone="amber" glow padding={34} style={{ textAlign: "center" }}>
              <Pill tone="amber" size="md">PROBABILISTIC CORE</Pill>
              <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 40, fontWeight: 700, marginTop: 14 }}>
                The Model Owns
              </div>
              <div style={{ fontSize: 23, color: TOKENS.colors.textSecondary, marginTop: 10 }}>
                Reasoning, judgment &amp; dynamic planning
              </div>
            </Card>
          </div>

          {[
            { left: 20, top: 48, tag: "HARNESS OWNS", title: "Deterministic Execution", sub: "Reliable tool calls, parsing & exit codes" },
            { left: 1130, top: 48, tag: "HARNESS OWNS", title: "Context Hygiene", sub: "Caching, truncation & clean compaction" },
            { left: 20, top: 472, tag: "HARNESS OWNS", title: "Safety Perimeter", sub: "Hooks, sandboxes & approval gates" },
            { left: 1130, top: 472, tag: "HARNESS OWNS", title: "Ground-Truth Feedback", sub: "Tests, linters & deterministic signals" },
          ].map((card, i) => (
            <div
              key={card.title}
              style={{
                position: "absolute",
                left: card.left,
                top: card.top,
                width: 470,
                ...slideUpStyle(frame, fps, detCue + i * 6, 16),
              }}
            >
              <NodeBox tag={card.tag} title={card.title} subtitle={card.sub} tone="cyan" glow={frame >= detCue} />
            </div>
          ))}
        </div>
      </SceneBeat>

      {/* BEAT 8: Full-Canvas 2x2 Multi-Domain Grid (Inline centered hub pill, zero SectionTitle chrome) */}
      <SceneBeat window={w8}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Pill tone="cyan" size="lg">SAME HARNESS ENGINE • FOUR AGENT DOMAINS</Pill>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          {DOMAINS.map((d) => {
            const cueMap: Record<string, number> = {
              coding: labCue,
              browser: browserCue,
              research: researchCue,
              ops: opsCue,
            };
            const isHighlighted = frame >= cueMap[d.key];
            const isLabFocus = d.key === "coding" && frame >= labCue;
            return (
              <div
                key={d.key}
                style={{
                  opacity: fadeIn(frame, b8.start + 8, 16),
                  transform: `scale(${isLabFocus ? 1.015 : 1})`,
                }}
              >
                <Card
                  tone={isLabFocus ? "emerald" : d.tone}
                  glow={isLabFocus || (isHighlighted && d.key !== "coding")}
                  padding={30}
                  style={{ height: "100%", minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 34, fontWeight: 700 }}>
                        {d.title}
                      </span>
                      {d.badge ? (
                        <Pill tone={isLabFocus ? "emerald" : "cyan"} size="md">
                          {d.badge}
                        </Pill>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 20, color: TOKENS.colors.textSecondary }}>
                      {d.examples}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 18 }}>
                    <DataChip label={`Tools: ${d.tools}`} tone="cyan" style={{ fontSize: 17, padding: "10px 15px" }} />
                    <DataChip label={`Verify: ${d.verifier}`} tone="emerald" style={{ fontSize: 17, padding: "10px 15px" }} />
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
