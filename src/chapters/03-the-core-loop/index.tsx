import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Sfx } from "../../lib/audio";
import { TOKENS } from "../../theme/tokens";
import { CodePanel, NodeBox, SvgLink, SvgPacket } from "../../ui/diagrams";
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
  DataChip,
  MeterBar,
  Pill,
  SceneBeat,
  SectionTitle,
  StatCallout,
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

const LOOP_CODE: CodeLine[] = [
  { text: "while (!done && steps < MAX_STEPS) {", tone: "cyan", highlight: true },
  { text: "  // 1. THINK — model reasons on history", tone: "neutral" },
  { text: "  const msg = await llm.call(messages, tools);", tone: "amber", highlight: true },
  { text: "  if (!msg.toolCalls.length) return msg.text;", tone: "emerald" },
  { text: "  // 2. ACT — harness executes tool calls", tone: "neutral" },
  { text: "  const out = await runTools(msg.toolCalls);", tone: "cyan", highlight: true },
  { text: "  // 3. OBSERVE — append real output", tone: "neutral" },
  { text: "  messages.push(msg, ...out);", tone: "emerald" },
  { text: "} // 4. REPEAT", tone: "cyan" },
];

const TOOL_CALL_JSON: CodeLine[] = [
  { text: '{ "type": "tool_use",', tone: "amber" },
  { text: '  "id": "call_9f2a",', tone: "cyan", highlight: true },
  { text: '  "name": "read_file",', tone: "amber" },
  { text: '  "input": { "path": "auth.ts" } }', tone: "amber" },
];

const TOOL_RESULT_JSON: CodeLine[] = [
  { text: '{ "role": "tool_result",', tone: "emerald" },
  { text: '  "tool_call_id": "call_9f2a",', tone: "cyan", highlight: true },
  { text: '  "content": "40: async refreshToken()..." }', tone: "emerald" },
];

const OPAQUE_ERR: CodeLine[] = [
  { text: "$ apply_patch auth.ts", tone: "neutral" },
  { text: "Error: exit code 1", tone: "rose", highlight: true },
  { text: "(no line numbers, no hint → model guesses blindly)", tone: "rose" },
];

const ACTIONABLE_ERR: CodeLine[] = [
  { text: "EditError: target block not found in auth.ts", tone: "amber" },
  { text: "42 | if (this.refreshing) return this.pending;", tone: "emerald" },
  { text: "43 | this.refreshing = true;", tone: "emerald" },
  { text: "Hint: match lines 42–43 above and retry patch.", tone: "cyan", highlight: true },
];

const PATCH_DIFF: CodeLine[] = [
  { text: "@@ auth.ts:42-46 @@", tone: "cyan" },
  { text: "- const tok = await fetchToken();", tone: "rose" },
  { text: "+ if (!this.inflight) this.inflight = fetchToken();", tone: "emerald", highlight: true },
  { text: "+ const tok = await this.inflight;", tone: "emerald", highlight: true },
];

const BLOATED_TOOLS = [
  "mcp_jira_get", "mcp_jira_list", "mcp_jira_edit", "mcp_gh_pr_1",
  "mcp_gh_pr_2", "mcp_slack_msg", "mcp_slack_dm", "mcp_db_sql",
  "mcp_db_schema", "mcp_fs_cat", "mcp_fs_head", "mcp_fs_tail",
  "mcp_k8s_pod", "mcp_k8s_log", "mcp_aws_s3", "+55 more...",
];

const CLEAN_PRIMITIVES = [
  { label: "read_file", sub: "Line-numbered" },
  { label: "edit_file", sub: "Targeted patch" },
  { label: "grep_search", sub: "Fast regex" },
  { label: "find_files", sub: "Glob tree" },
  { label: "run_shell", sub: "Composable CLI" },
  { label: "web_fetch", sub: "Docs & specs" },
];

export const CoreLoopChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c9 = clips[0];
  const c10 = clips[1];
  const c11 = clips[2];
  const c12 = clips[3];
  const c13 = clips[4];

  const b9 = clipRange(c9, chapter.startFrame, 0, 860);
  const b10 = clipRange(c10, chapter.startFrame, b9.end, 920);
  const b11 = clipRange(c11, chapter.startFrame, b10.end, 860);
  const b12 = clipRange(c12, chapter.startFrame, b11.end, 860);
  const b13 = clipRange(c13, chapter.startFrame, b12.end, 860);

  // Beat 9 cues
  const thinkCue = cueFrame(c9, "think", 200, chapter.startFrame);
  const actCue = cueFrame(c9, "act", 230, chapter.startFrame);
  const observeCue = cueFrame(c9, "observe", 260, chapter.startFrame);
  const repeatCue = cueFrame(c9, "repeat", 300, chapter.startFrame);

  // Beat 10 cues
  const neverCue = cueFrame(c10, "never", 100, chapter.startFrame);
  const jsonCue = cueFrame(c10, "JSON", 240, chapter.startFrame);
  const execCue = cueFrame(c10, "executes", 610, chapter.startFrame);
  const resultCue = cueFrame(c10, "result", 760, chapter.startFrame);

  // Beat 11 cues
  const schemasCue = cueFrame(c11, "schemas", 300, chapter.startFrame);
  const compCue = cueFrame(c11, "composable", 640, chapter.startFrame);

  // Beat 12 cues
  const crypticCue = cueFrame(c12, "cryptic", 420, chapter.startFrame);
  const actionCue = cueFrame(c12, "actionable", 530, chapter.startFrame);

  // Beat 13 cues
  const rewriteCue = cueFrame(c13, "rewrite", 170, chapter.startFrame);
  const modernCue = cueFrame(c13, "modern", 420, chapter.startFrame);
  const targetedCue = cueFrame(c13, "targeted", 540, chapter.startFrame);

  const w9 = sceneWindow(frame, b9.start, b9.end);
  const w10 = sceneWindow(frame, b10.start, b10.end);
  const w11 = sceneWindow(frame, b11.start, b11.end);
  const w12 = sceneWindow(frame, b12.start, b12.end);
  const w13 = sceneWindow(frame, b13.start, b13.end, { keepAtEnd: true });

  const loopCodeReveal = progressBetween(frame, b9.start + 12, repeatCue + 40);
  const loopCycle = frame >= repeatCue ? ((frame - repeatCue) % 120) / 120 : 0;

  return (
    <Stage chapterIndex="03" chapterTitle={chapter.title} tone="cyan" legend={LEGEND}>
      {/* SFX */}
      <Sfx name="typing-loop" from={thinkCue} volume={0.14} durationInFrames={65} />
      <Sfx name="pop-in" from={actCue} volume={0.26} />
      <Sfx name="data-blip" from={observeCue} volume={0.26} />
      <Sfx name="swish" from={repeatCue} volume={0.26} />

      <Sfx name="click-subtle" from={neverCue} volume={0.26} />
      <Sfx name="pop-in" from={jsonCue} volume={0.28} />
      <Sfx name="data-blip" from={execCue} volume={0.28} />
      <Sfx name="chime-positive" from={resultCue} volume={0.28} />

      <Sfx name="thud-low" from={schemasCue} volume={0.28} />
      <Sfx name="magnetic-snap" from={compCue} volume={0.3} />

      <Sfx name="error-buzz" from={crypticCue} volume={0.28} />
      <Sfx name="chime-positive" from={actionCue} volume={0.28} />
      <Sfx name="marker-draw" from={actionCue + 18} volume={0.25} />

      <Sfx name="clock-tick" from={rewriteCue} volume={0.18} durationInFrames={55} />
      <Sfx name="scale-down" from={targetedCue} volume={0.28} />

      {/* BEAT 9: 15-Line Core Loop */}
      <SceneBeat window={w9}>
        <SectionTitle
          eyebrow="PILLAR 01 — LOOP & TOOLS"
          title="The 15-Line Heart of Every Agent Harness"
          tone="cyan"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 32, alignItems: "center" }}>
          <div style={slideUpStyle(frame, fps, b9.start + 6, 20)}>
            <CodePanel
              title="harness-loop.ts"
              badge="CORE ENGINE"
              tone="cyan"
              lines={LOOP_CODE}
              revealProgress={loopCodeReveal}
              fontSize={19}
            />
          </div>

          <Card tone="neutral" padding={24} style={{ position: "relative", height: 420 }}>
            <svg width={720} height={372} viewBox="0 0 720 372" style={{ position: "absolute", left: 24, top: 24 }}>
              <SvgLink x1={265} y1={72} x2={445} y2={72} progress={progressBetween(frame, actCue, actCue + 20)} tone="amber" arrow />
              <SvgLink x1={575} y1={134} x2={575} y2={236} progress={progressBetween(frame, observeCue, observeCue + 20)} tone="cyan" arrow />
              <SvgLink x1={445} y1={298} x2={265} y2={298} progress={progressBetween(frame, repeatCue, repeatCue + 20)} tone="emerald" arrow />
              <SvgLink x1={135} y1={236} x2={135} y2={134} progress={progressBetween(frame, repeatCue + 8, repeatCue + 28)} tone="cyan" arrow />

              {frame >= repeatCue && loopCycle < 0.25 ? (
                <SvgPacket x1={265} y1={72} x2={445} y2={72} progress={loopCycle * 4} tone="amber" />
              ) : null}
              {frame >= repeatCue && loopCycle >= 0.25 && loopCycle < 0.5 ? (
                <SvgPacket x1={575} y1={134} x2={575} y2={236} progress={(loopCycle - 0.25) * 4} tone="cyan" />
              ) : null}
              {frame >= repeatCue && loopCycle >= 0.5 && loopCycle < 0.75 ? (
                <SvgPacket x1={445} y1={298} x2={265} y2={298} progress={(loopCycle - 0.5) * 4} tone="emerald" />
              ) : null}
              {frame >= repeatCue && loopCycle >= 0.75 ? (
                <SvgPacket x1={135} y1={236} x2={135} y2={134} progress={(loopCycle - 0.75) * 4} tone="cyan" />
              ) : null}
            </svg>

            <NodeBox
              tag="STEP 1"
              title="1. Think"
              subtitle="LLM reasons over history"
              tone="amber"
              glow={frame >= thinkCue}
              compact
              style={{ position: "absolute", left: 32, top: 38, width: 255 }}
            />
            <NodeBox
              tag="STEP 2"
              title="2. Act"
              subtitle="Harness runs tool call"
              tone="cyan"
              glow={frame >= actCue}
              compact
              style={{ position: "absolute", left: 472, top: 38, width: 255 }}
            />
            <NodeBox
              tag="STEP 3"
              title="3. Observe"
              subtitle="Append output to history"
              tone="emerald"
              glow={frame >= observeCue}
              compact
              style={{ position: "absolute", left: 472, top: 262, width: 255 }}
            />
            <NodeBox
              tag="STEP 4"
              title="4. Repeat"
              subtitle="Loop until solved or cap"
              tone="cyan"
              glow={frame >= repeatCue}
              compact
              style={{ position: "absolute", left: 32, top: 262, width: 255 }}
            />
          </Card>
        </div>
      </SceneBeat>

      {/* BEAT 10: How the Model Actually Calls a Tool */}
      <SceneBeat window={w10}>
        <SectionTitle
          eyebrow="PILLAR 01 — TOOL CALLING MECHANIC"
          title="The Model Never Runs Code — It Emits JSON"
          tone="cyan"
        />

        {/* 3-Column Architecture Handoff */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 1fr 140px 1fr", alignItems: "center", marginBottom: 24 }}>
          <NodeBox
            tag="TEXT IN → JSON OUT"
            title="Language Model"
            subtitle="Zero disk or shell access"
            tone="amber"
            glow={frame >= neverCue}
          />
          <svg width={140} height={90} viewBox="0 0 140 90" style={{ overflow: "visible" }}>
            <SvgLink x1={6} y1={28} x2={134} y2={28} progress={progressBetween(frame, jsonCue, jsonCue + 24)} tone="amber" arrow />
            <SvgPacket x1={6} y1={28} x2={134} y2={28} progress={progressBetween(frame, jsonCue + 4, jsonCue + 44)} tone="amber" label="JSON" />
            <SvgLink x1={134} y1={64} x2={6} y2={64} progress={progressBetween(frame, resultCue, resultCue + 24)} tone="emerald" arrow />
            <SvgPacket x1={134} y1={64} x2={6} y2={64} progress={progressBetween(frame, resultCue + 4, resultCue + 44)} tone="emerald" label="result" />
          </svg>
          <NodeBox
            tag="PARSER & EXECUTOR"
            title="Harness Runtime"
            subtitle="Matches tool_call_id & runs tool"
            tone="cyan"
            glow={frame >= execCue}
          />
          <svg width={140} height={90} viewBox="0 0 140 90" style={{ overflow: "visible" }}>
            <SvgLink x1={6} y1={28} x2={134} y2={28} progress={progressBetween(frame, execCue, execCue + 22)} tone="cyan" arrow />
            <SvgPacket x1={6} y1={28} x2={134} y2={28} progress={progressBetween(frame, execCue + 4, execCue + 40)} tone="cyan" label="fs.read" />
            <SvgLink x1={134} y1={64} x2={6} y2={64} progress={progressBetween(frame, execCue + 22, execCue + 44)} tone="emerald" arrow />
          </svg>
          <NodeBox
            tag="REAL ENVIRONMENT"
            title="Local Machine / Repo"
            subtitle="Reads auth.ts from disk"
            tone="emerald"
            glow={frame >= execCue}
          />
        </div>

        {/* Paired Payloads */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <div style={slideUpStyle(frame, fps, jsonCue, 18)}>
            <CodePanel
              title="1. Model Output (Structured Tool Call)"
              badge="ID: call_9f2a"
              tone="amber"
              lines={TOOL_CALL_JSON}
              fontSize={18}
            />
          </div>
          <div style={slideUpStyle(frame, fps, resultCue, 18)}>
            <CodePanel
              title="2. Harness Appends Paired Observation"
              badge="PAIRED ID"
              tone="emerald"
              lines={TOOL_RESULT_JSON}
              fontSize={18}
            />
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 11: Tool Sprawl & MCP Schema Bloat vs Orthogonal Primitives */}
      <SceneBeat window={w11}>
        <SectionTitle
          eyebrow="PILLAR 01 — TOOL DESIGN"
          title="Tool Sprawl & MCP Bloat vs. Orthogonal Primitives"
          tone="cyan"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div style={slideUpStyle(frame, fps, b11.start + 14, 20)}>
            <Card tone="rose" glow={frame >= schemasCue} padding={26}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 28, fontWeight: 700 }}>
                  5 MCP Servers • 70 Schemas
                </span>
                <Pill tone="rose" size="sm">BLOATED</Pill>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
                {BLOATED_TOOLS.map((t) => (
                  <DataChip key={t} label={t} tone="rose" style={{ fontSize: 13, padding: "7px 8px" }} />
                ))}
              </div>
              <MeterBar
                label="Pre-Turn Prompt Overhead"
                percent={85 * progressBetween(frame, schemasCue, schemasCue + 36)}
                valueLabel="~25K tokens"
                tone="amber"
                height={20}
              />
            </Card>
          </div>

          <div style={slideUpStyle(frame, fps, b11.start + 26, 20)}>
            <Card tone="cyan" glow={frame >= compCue} padding={26} style={{ opacity: frame >= compCue - 20 ? 1 : 0.38 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 28, fontWeight: 700 }}>
                  6 Composable Primitives
                </span>
                <Pill tone="emerald" size="sm">SHARP &amp; FAST</Pill>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                {CLEAN_PRIMITIVES.map((p) => (
                  <DataChip key={p.label} label={p.label} sublabel={p.sub} tone="cyan" style={{ fontSize: 17, padding: "12px 10px" }} />
                ))}
              </div>
              <MeterBar
                label="Tool Selection Accuracy"
                percent={94 * progressBetween(frame, compCue, compCue + 36)}
                valueLabel="High"
                tone="emerald"
                height={20}
              />
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 12: SWE-agent ACI & Actionable Errors (Compact vertical transform) */}
      <SceneBeat window={w12}>
        <SectionTitle
          eyebrow="PILLAR 01 — AGENT-COMPUTER INTERFACE (SWE-AGENT)"
          title="Design Tool Errors for Recovery, Not Silence"
          tone="cyan"
        />

        <div style={{ maxWidth: 1180, width: "100%", margin: "0 auto" }}>
          <div style={slideUpStyle(frame, fps, b12.start + 16, 16)}>
            <CodePanel
              title="Opaque Error (Forces Blind Retries)"
              badge="EXIT CODE 1"
              tone="rose"
              lines={OPAQUE_ERR}
              fontSize={17}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36, height: 74 }}>
            <svg width={80} height={74} viewBox="0 0 80 74">
              <SvgLink
                x1={40}
                y1={6}
                x2={40}
                y2={68}
                progress={progressBetween(frame, actionCue, actionCue + 24)}
                tone="cyan"
                strokeWidth={3.5}
                arrow
              />
            </svg>
            <span
              style={{
                fontFamily: TOKENS.fonts.handwritten,
                fontSize: 40,
                fontWeight: 700,
                color: TOKENS.colors.accentWarm,
                opacity: fadeIn(frame, actionCue + 12, 14),
              }}
            >
              ACI: Tools are a UI for the model!
            </span>
          </div>

          <div style={slideUpStyle(frame, fps, actionCue, 16)}>
            <CodePanel
              title="Actionable Harness Error (auth.ts)"
              badge="SELF-RECOVERABLE"
              tone="emerald"
              lines={ACTIONABLE_ERR}
              fontSize={17}
            />
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 13: Targeted Diffs vs Full-File Rewrites */}
      <SceneBeat window={w13}>
        <SectionTitle
          eyebrow="PILLAR 01 — EDITING ERGONOMICS"
          title="Targeted Diffs Beat Full-File Rewrites"
          tone="cyan"
        />

        <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 30, alignItems: "stretch" }}>
          <div style={slideUpStyle(frame, fps, rewriteCue - 12, 20)}>
            <Card tone="rose" padding={28} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <Pill tone="rose" size="sm">FULL-FILE REWRITE</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700, marginTop: 10 }}>
                  Regenerate All 800 Lines
                </div>
                <p style={{ fontSize: 20, color: TOKENS.colors.textSecondary, marginTop: 8 }}>
                  Wastes output tokens, adds seconds of latency, risks accidental deletions.
                </p>
              </div>
              <StatCallout
                label="Output Tokens Generated"
                value={
                  <AnimatedNumber
                    from={0}
                    to={6400}
                    progress={progressBetween(frame, rewriteCue, rewriteCue + 55)}
                    suffix=" tok"
                    tone="amber"
                    size={46}
                  />
                }
                detail="For a 5-line race-condition fix"
                tone="amber"
              />
            </Card>
          </div>

          <div style={slideUpStyle(frame, fps, modernCue - 8, 20)}>
            <Card tone="emerald" glow={frame >= targetedCue} padding={28} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Pill tone="emerald" size="sm">TARGETED PATCH • AIDER / CLAUDE CODE / CURSOR</Pill>
                  <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700, marginTop: 10 }}>
                    Search-and-Replace / Diff-Merge
                  </div>
                </div>
                <DataChip label="10× FEWER TOKENS" tone="emerald" style={{ fontSize: 16 }} />
              </div>

              <CodePanel
                title="Targeted Diff (auth.ts)"
                badge="~120 TOKENS"
                tone="emerald"
                lines={PATCH_DIFF}
                fontSize={18}
              />
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
