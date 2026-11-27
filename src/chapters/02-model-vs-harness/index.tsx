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
import type { StageLegendItem } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const LEGEND: StageLegendItem[] = [
  { label: "HARNESS", tone: "cyan" },
  { label: "MODEL", tone: "amber" },
  { label: "RELIABILITY", tone: "emerald" },
  { label: "FAILURE", tone: "rose" },
];

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

  // Beat 5 loop animation (4-node rectangle so straight SvgLinks never overlap)
  const loopDraw = progressBetween(frame, envCue, envCue + 36);
  const loopCycle = frame >= envCue ? ((frame - envCue) % 120) / 120 : 0;

  // Beat 7 perimeter link progress
  const perimLinks = progressBetween(frame, detCue, detCue + 30);

  return (
    <Stage chapterIndex="02" chapterTitle={chapter.title} tone="cyan" legend={LEGEND}>
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

      {/* BEAT 4: Three-Layer Stack */}
      <SceneBeat window={w4}>
        <SectionTitle
          eyebrow="ARCHITECTURAL BOUNDARIES"
          title="Three Distinct Layers of Every AI Product"
          tone="cyan"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 1440, width: "100%", margin: "0 auto" }}>
          {/* Top: Application */}
          <div style={slideUpStyle(frame, fps, appCue, 18)}>
            <Card tone="neutral" padding={22} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
              <div>
                <Pill tone="neutral" size="sm">LAYER 3 • APPLICATION / UX</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700, marginTop: 8 }}>
                  Interface &amp; Workflow Surface
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <DataChip label="Terminal CLI" tone="neutral" style={{ fontSize: 16, padding: "8px 14px" }} />
                <DataChip label="IDE Editor Pane" tone="neutral" style={{ fontSize: 16, padding: "8px 14px" }} />
                <DataChip label="PR / Web UI" tone="neutral" style={{ fontSize: 16, padding: "8px 14px" }} />
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", justifyContent: "center", height: 48 }}>
            <svg width={260} height={48} viewBox="0 0 260 48">
              <SvgLink x1={90} y1={4} x2={90} y2={44} progress={progressBetween(frame, appCue, appCue + 20)} tone="neutral" arrow />
              <SvgLink x1={170} y1={44} x2={170} y2={4} progress={progressBetween(frame, appCue, appCue + 20)} tone="cyan" arrow />
            </svg>
          </div>

          {/* Middle: Harness */}
          <div style={slideUpStyle(frame, fps, harnessCue, 18)}>
            <Card tone="cyan" glow={frame >= harnessCue} padding={26} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
              <div>
                <Pill tone="cyan" size="sm">LAYER 2 • THE AGENT HARNESS</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 32, fontWeight: 700, marginTop: 8 }}>
                  Loop, Tools, Context, State &amp; Safety Gates
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 680 }}>
                {["Claude Code", "Codex CLI", "Gemini CLI", "Cursor", "Windsurf Cascade"].map((h) => (
                  <DataChip key={h} label={h} tone="cyan" style={{ fontSize: 16, padding: "8px 14px" }} />
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", justifyContent: "center", height: 48 }}>
            <svg width={260} height={48} viewBox="0 0 260 48">
              <SvgLink x1={90} y1={4} x2={90} y2={44} progress={progressBetween(frame, harnessCue, harnessCue + 20)} tone="cyan" arrow />
              <SvgLink x1={170} y1={44} x2={170} y2={4} progress={progressBetween(frame, harnessCue, harnessCue + 20)} tone="amber" arrow />
              <SvgPacket x1={170} y1={44} x2={170} y2={4} progress={progressBetween(frame, harnessCue + 10, harnessCue + 46)} tone="amber" label="Tokens" />
            </svg>
          </div>

          {/* Bottom: Model */}
          <div style={slideUpStyle(frame, fps, modelCue, 18)}>
            <Card tone="amber" glow={frame >= modelCue && frame < harnessCue} padding={22} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
              <div>
                <Pill tone="amber" size="sm">LAYER 1 • FOUNDATION MODEL</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700, marginTop: 8 }}>
                  Stateless Next-Token Prediction Engine
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <DataChip label="Claude" tone="amber" style={{ fontSize: 16, padding: "8px 14px" }} />
                <DataChip label="GPT" tone="amber" style={{ fontSize: 16, padding: "8px 14px" }} />
                <DataChip label="Gemini" tone="amber" style={{ fontSize: 16, padding: "8px 14px" }} />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 5: Stateless API Call vs Stateful Harness Loop */}
      <SceneBeat window={w5}>
        <SectionTitle
          eyebrow="SINGLE-SHOT VS. CLOSED LOOP"
          title="Turning a Stateless API Into an Iterative Controller"
          tone="cyan"
        />

        <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 32, alignItems: "stretch" }}>
          {/* Left: Stateless Raw API */}
          <div style={slideUpStyle(frame, fps, statelessCue, 20)}>
            <Card tone="amber" padding={28} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <Pill tone="amber" size="sm">RAW LLM API</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700, marginTop: 10 }}>
                  Stateless &amp; Blind
                </div>
                <p style={{ fontSize: 20, color: TOKENS.colors.textSecondary, marginTop: 8 }}>
                  One prompt in, one text completion out — then it stops.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "28px 0" }}>
                <NodeBox title="Prompt" tone="neutral" compact style={{ width: 155, textAlign: "center" }} />
                <svg width={90} height={36} viewBox="0 0 90 36">
                  <SvgLink x1={4} y1={18} x2={86} y2={18} progress={progressBetween(frame, statelessCue, statelessCue + 24)} tone="amber" arrow />
                </svg>
                <NodeBox title="LLM" tone="amber" compact style={{ width: 120, textAlign: "center" }} />
                <svg width={90} height={36} viewBox="0 0 90 36">
                  <SvgLink x1={4} y1={18} x2={86} y2={18} progress={progressBetween(frame, statelessCue + 12, statelessCue + 36)} tone="amber" arrow />
                </svg>
                <NodeBox title="End" tone="rose" compact style={{ width: 110, textAlign: "center" }} />
              </div>

              <Pill tone="rose" size="sm" style={{ alignSelf: "flex-start" }}>
                NO FILES • NO TERMINAL • NO FEEDBACK
              </Pill>
            </Card>
          </div>

          {/* Right: 4-node rectangle Harness Loop */}
          <div style={slideUpStyle(frame, fps, changesCue - 8, 20)}>
            <Card tone="cyan" glow={frame >= envCue} padding={28} style={{ height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <Pill tone="cyan" size="sm">AGENT HARNESS</Pill>
                  <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700, marginTop: 8 }}>
                    Live Environment Feedback Loop
                  </div>
                </div>
                <Pill tone="emerald" size="sm">ITERATIVE</Pill>
              </div>

              <div style={{ position: "relative", width: 790, height: 340, margin: "0 auto" }}>
                <svg width={790} height={340} viewBox="0 0 790 340" style={{ position: "absolute", inset: 0 }}>
                  {/* Top: Model -> Action */}
                  <SvgLink x1={270} y1={68} x2={495} y2={68} progress={loopDraw} tone="amber" arrow />
                  {/* Right: Action -> Environment */}
                  <SvgLink x1={630} y1={118} x2={630} y2={212} progress={loopDraw} tone="cyan" arrow />
                  {/* Bottom: Environment -> Feedback */}
                  <SvgLink x1={495} y1={264} x2={270} y2={264} progress={loopDraw} tone="emerald" arrow />
                  {/* Left: Feedback -> Model */}
                  <SvgLink x1={140} y1={212} x2={140} y2={118} progress={loopDraw} tone="cyan" arrow />

                  {/* Circulating packet */}
                  {frame >= envCue && loopCycle < 0.25 ? (
                    <SvgPacket x1={270} y1={68} x2={495} y2={68} progress={loopCycle * 4} tone="amber" />
                  ) : null}
                  {frame >= envCue && loopCycle >= 0.25 && loopCycle < 0.5 ? (
                    <SvgPacket x1={630} y1={118} x2={630} y2={212} progress={(loopCycle - 0.25) * 4} tone="cyan" />
                  ) : null}
                  {frame >= envCue && loopCycle >= 0.5 && loopCycle < 0.75 ? (
                    <SvgPacket x1={495} y1={264} x2={270} y2={264} progress={(loopCycle - 0.5) * 4} tone="emerald" />
                  ) : null}
                  {frame >= envCue && loopCycle >= 0.75 ? (
                    <SvgPacket x1={140} y1={212} x2={140} y2={118} progress={(loopCycle - 0.75) * 4} tone="cyan" />
                  ) : null}
                </svg>

                <NodeBox
                  tag="1. REASON"
                  title="Model"
                  subtitle="Plans next step"
                  tone="amber"
                  compact
                  style={{ position: "absolute", left: 10, top: 18, width: 255 }}
                />
                <NodeBox
                  tag="2. PROPOSE"
                  title="Action"
                  subtitle="Tool call request"
                  tone="cyan"
                  compact
                  style={{ position: "absolute", left: 500, top: 18, width: 260 }}
                />
                <NodeBox
                  tag="3. EXECUTE"
                  title="Environment"
                  subtitle="Files, shell & tests"
                  tone="emerald"
                  glow={frame >= envCue}
                  compact
                  style={{ position: "absolute", left: 500, top: 218, width: 260 }}
                />
                <NodeBox
                  tag="4. OBSERVE"
                  title="Feedback"
                  subtitle="Real stdout & exit code"
                  tone="cyan"
                  compact
                  style={{ position: "absolute", left: 10, top: 218, width: 255 }}
                />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 6: Why Rigid Frameworks Break ("The Bitter Lesson") */}
      <SceneBeat window={w6}>
        <SectionTitle
          eyebrow="THE BITTER LESSON OF HARNESSES"
          title="Why Rigid Frameworks Break When Models Improve"
          tone="cyan"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* Left: Rigid Framework */}
          <div style={slideUpStyle(frame, fps, rigidCue, 20)}>
            <Card tone="rose" padding={28}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700 }}>
                  Heavy Rigid Frameworks
                </span>
                <Pill tone="rose" size="sm">
                  {frame >= breaksCue ? "BRITTLE • BREAKS" : "OVER-ENGINEERED"}
                </Pill>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
                    compact
                  />
                ))}
              </div>

              <div style={{ marginTop: 18, fontSize: 19, color: TOKENS.colors.accentRose, fontFamily: TOKENS.fonts.mono }}>
                {frame >= breaksCue ? "✗ New frontier model ships → rigid scaffolding fights it" : "Hardcodes yesterday's workarounds into graph topology"}
              </div>
            </Card>
          </div>

          {/* Right: Thin Unix-style Harness */}
          <div style={slideUpStyle(frame, fps, modernCue - 8, 20)}>
            <Card tone="cyan" glow={frame >= minimalCue} padding={28}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700 }}>
                  Thin Unix-Style Harnesses
                </span>
                <Pill tone="emerald" size="sm">MODEL-DRIVEN</Pill>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
                    compact
                  />
                ))}
              </div>

              <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10 }}>
                <Pill tone="cyan" size="sm">Claude Code</Pill>
                <Pill tone="cyan" size="sm">OpenCode</Pill>
                <Pill tone="cyan" size="sm">Aider</Pill>
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 7: Core + Perimeter Division of Labor (breaks split-column streak) */}
      <SceneBeat window={w7}>
        <SectionTitle
          eyebrow="DIVISION OF LABOR"
          title="What the Model Owns vs. What the Harness Owns"
          tone="cyan"
          align="center"
        />

        <div style={{ position: "relative", width: 1500, height: 500, margin: "0 auto" }}>
          <svg width={1500} height={500} viewBox="0 0 1500 500" style={{ position: "absolute", inset: 0 }}>
            <SvgLink x1={575} y1={210} x2={435} y2={135} progress={perimLinks} tone="cyan" arrow />
            <SvgLink x1={925} y1={210} x2={1065} y2={135} progress={perimLinks} tone="cyan" arrow />
            <SvgLink x1={575} y1={290} x2={435} y2={365} progress={perimLinks} tone="cyan" arrow />
            <SvgLink x1={925} y1={290} x2={1065} y2={365} progress={perimLinks} tone="cyan" arrow />
          </svg>

          {/* Center Core: Model */}
          <div
            style={{
              position: "absolute",
              left: 550,
              top: 155,
              width: 400,
              ...slideUpStyle(frame, fps, reasoningCue, 18),
            }}
          >
            <Card tone="amber" glow padding={28} style={{ textAlign: "center" }}>
              <Pill tone="amber" size="sm">PROBABILISTIC CORE</Pill>
              <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 34, fontWeight: 700, marginTop: 12 }}>
                The Model Owns
              </div>
              <div style={{ fontSize: 21, color: TOKENS.colors.textSecondary, marginTop: 8 }}>
                Reasoning, judgment &amp; dynamic planning
              </div>
            </Card>
          </div>

          {/* 4 Surrounding Harness Perimeter Cards */}
          {[
            { left: 40, top: 30, tag: "HARNESS BOUNDARY", title: "Deterministic Execution", sub: "Reliable tool calls, parsing & exit codes" },
            { left: 1040, top: 30, tag: "HARNESS BOUNDARY", title: "Context Hygiene", sub: "Caching, truncation & clean compaction" },
            { left: 40, top: 320, tag: "HARNESS BOUNDARY", title: "Safety Perimeter", sub: "Hooks, sandboxes & approval gates" },
            { left: 1040, top: 320, tag: "HARNESS BOUNDARY", title: "Ground-Truth Feedback", sub: "Tests, linters & deterministic signals" },
          ].map((card, i) => (
            <div
              key={card.title}
              style={{
                position: "absolute",
                left: card.left,
                top: card.top,
                width: 420,
                ...slideUpStyle(frame, fps, detCue + i * 6, 16),
              }}
            >
              <NodeBox tag={card.tag} title={card.title} subtitle={card.sub} tone="cyan" glow={frame >= detCue} />
            </div>
          ))}
        </div>
      </SceneBeat>

      {/* BEAT 8: One Harness Architecture, Many Agent Domains */}
      <SceneBeat window={w8}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <SectionTitle
            eyebrow="UNIVERSAL ARCHITECTURE"
            title="One Harness Engine. Many Agent Domains."
            subtitle="Swap the tools and verifiers — the underlying harness stays identical."
            tone="cyan"
            style={{ marginBottom: 0 }}
          />
          <Pill tone="cyan" size="md">SAME HARNESS ENGINE</Pill>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
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
                  padding={24}
                  style={{ height: "100%" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 28, fontWeight: 700 }}>
                      {d.title}
                    </span>
                    {d.badge ? (
                      <Pill tone={isLabFocus ? "emerald" : "cyan"} size="sm">
                        {d.badge}
                      </Pill>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 17, color: TOKENS.colors.textSecondary, marginBottom: 16 }}>
                    {d.examples}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <DataChip label={`Tools: ${d.tools}`} tone="cyan" style={{ fontSize: 15, padding: "7px 12px" }} />
                    <DataChip label={`Verify: ${d.verifier}`} tone="emerald" style={{ fontSize: 15, padding: "7px 12px" }} />
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
