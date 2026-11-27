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
  StatCallout,
} from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

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
    <Stage chapterIndex="03" chapterTitle={chapter.title} tone="cyan" transientHeader compactPadding>
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

      {/* BEAT 9: Full-Canvas 15-Line Core Loop + 4-Node Cycle */}
      <SceneBeat window={w9}>
        <div style={{ display: "grid", gridTemplateColumns: "1.02fr 0.98fr", gap: 36, alignItems: "center" }}>
          <div style={slideUpStyle(frame, fps, b9.start + 6, 20)}>
            <CodePanel
              title="harness-loop.ts"
              badge="15-LINE CORE ENGINE"
              tone="cyan"
              lines={LOOP_CODE}
              revealProgress={loopCodeReveal}
              fontSize={22}
            />
          </div>

          <Card tone="neutral" padding={28} style={{ position: "relative", height: 560 }}>
            <svg width={780} height={504} viewBox="0 0 780 504" style={{ position: "absolute", left: 28, top: 28 }}>
              <SvgLink x1={290} y1={96} x2={480} y2={96} progress={progressBetween(frame, actCue, actCue + 20)} tone="amber" strokeWidth={3.5} arrow />
              <SvgLink x1={625} y1={172} x2={625} y2={332} progress={progressBetween(frame, observeCue, observeCue + 20)} tone="cyan" strokeWidth={3.5} arrow />
              <SvgLink x1={480} y1={408} x2={290} y2={408} progress={progressBetween(frame, repeatCue, repeatCue + 20)} tone="emerald" strokeWidth={3.5} arrow />
              <SvgLink x1={155} y1={332} x2={155} y2={172} progress={progressBetween(frame, repeatCue + 8, repeatCue + 28)} tone="cyan" strokeWidth={3.5} arrow />

              {frame >= repeatCue && loopCycle < 0.25 ? (
                <SvgPacket x1={290} y1={96} x2={480} y2={96} progress={loopCycle * 4} tone="amber" radius={11} />
              ) : null}
              {frame >= repeatCue && loopCycle >= 0.25 && loopCycle < 0.5 ? (
                <SvgPacket x1={625} y1={172} x2={625} y2={332} progress={(loopCycle - 0.25) * 4} tone="cyan" radius={11} />
              ) : null}
              {frame >= repeatCue && loopCycle >= 0.5 && loopCycle < 0.75 ? (
                <SvgPacket x1={480} y1={408} x2={290} y2={408} progress={(loopCycle - 0.5) * 4} tone="emerald" radius={11} />
              ) : null}
              {frame >= repeatCue && loopCycle >= 0.75 ? (
                <SvgPacket x1={155} y1={332} x2={155} y2={172} progress={(loopCycle - 0.75) * 4} tone="cyan" radius={11} />
              ) : null}
            </svg>

            <NodeBox tag="STEP 1" title="1. Think" subtitle="LLM reasons over history" tone="amber" glow={frame >= thinkCue} style={{ position: "absolute", left: 36, top: 54, width: 278 }} />
            <NodeBox tag="STEP 2" title="2. Act" subtitle="Harness runs tool call" tone="cyan" glow={frame >= actCue} style={{ position: "absolute", left: 514, top: 54, width: 278 }} />
            <NodeBox tag="STEP 3" title="3. Observe" subtitle="Append real output" tone="emerald" glow={frame >= observeCue} style={{ position: "absolute", left: 514, top: 366, width: 278 }} />
            <NodeBox tag="STEP 4" title="4. Repeat" subtitle="Loop until solved or cap" tone="cyan" glow={frame >= repeatCue} style={{ position: "absolute", left: 36, top: 366, width: 278 }} />
          </Card>
        </div>
      </SceneBeat>

      {/* BEAT 10: Full-Canvas How the Model Calls a Tool */}
      <SceneBeat window={w10}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 1fr 160px 1fr", alignItems: "center", marginBottom: 40 }}>
          <NodeBox
            tag="ZERO DISK OR SHELL ACCESS"
            title="Language Model"
            subtitle="Reads tool schemas → outputs JSON"
            tone="amber"
            glow={frame >= neverCue}
            style={{ minHeight: 165, display: "flex", flexDirection: "column", justifyContent: "center" }}
          />
          <svg width={160} height={110} viewBox="0 0 160 110" style={{ overflow: "visible" }}>
            <SvgLink x1={6} y1={34} x2={154} y2={34} progress={progressBetween(frame, jsonCue, jsonCue + 24)} tone="amber" strokeWidth={3.5} arrow />
            <SvgPacket x1={6} y1={34} x2={154} y2={34} progress={progressBetween(frame, jsonCue + 4, jsonCue + 44)} tone="amber" radius={10} label="JSON" />
            <SvgLink x1={154} y1={78} x2={6} y2={78} progress={progressBetween(frame, resultCue, resultCue + 24)} tone="emerald" strokeWidth={3.5} arrow />
            <SvgPacket x1={154} y1={78} x2={6} y2={78} progress={progressBetween(frame, resultCue + 4, resultCue + 44)} tone="emerald" radius={10} label="result" />
          </svg>
          <NodeBox
            tag="PARSER & EXECUTOR"
            title="Harness Runtime"
            subtitle="Matches tool_call_id & executes"
            tone="cyan"
            glow={frame >= execCue}
            style={{ minHeight: 165, display: "flex", flexDirection: "column", justifyContent: "center" }}
          />
          <svg width={160} height={110} viewBox="0 0 160 110" style={{ overflow: "visible" }}>
            <SvgLink x1={6} y1={34} x2={154} y2={34} progress={progressBetween(frame, execCue, execCue + 22)} tone="cyan" strokeWidth={3.5} arrow />
            <SvgPacket x1={6} y1={34} x2={154} y2={34} progress={progressBetween(frame, execCue + 4, execCue + 40)} tone="cyan" radius={10} label="fs.read" />
            <SvgLink x1={154} y1={78} x2={6} y2={78} progress={progressBetween(frame, execCue + 22, execCue + 44)} tone="emerald" strokeWidth={3.5} arrow />
          </svg>
          <NodeBox
            tag="REAL ENVIRONMENT"
            title="Local Machine / Repo"
            subtitle="Reads auth.ts from disk"
            tone="emerald"
            glow={frame >= execCue}
            style={{ minHeight: 165, display: "flex", flexDirection: "column", justifyContent: "center" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 34 }}>
          <div style={slideUpStyle(frame, fps, jsonCue, 18)}>
            <CodePanel
              title="1. Model Output (Structured Tool Call)"
              badge="ID: call_9f2a"
              tone="amber"
              lines={TOOL_CALL_JSON}
              fontSize={22}
            />
          </div>
          <div style={slideUpStyle(frame, fps, resultCue, 18)}>
            <CodePanel
              title="2. Harness Appends Paired Observation"
              badge="PAIRED ID"
              tone="emerald"
              lines={TOOL_RESULT_JSON}
              fontSize={22}
            />
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 11: Full-Canvas MCP Bloat vs Orthogonal Primitives */}
      <SceneBeat window={w11}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, height: 700 }}>
          <div style={slideUpStyle(frame, fps, b11.start + 14, 20)}>
            <Card tone="rose" glow={frame >= schemasCue} padding={32} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 34, fontWeight: 700 }}>
                  5 MCP Servers • 70 Schemas
                </span>
                <Pill tone="rose" size="md">BLOATED</Pill>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {BLOATED_TOOLS.map((t) => (
                  <DataChip key={t} label={t} tone="rose" style={{ fontSize: 15, padding: "11px 8px" }} />
                ))}
              </div>
              <MeterBar
                label="Pre-Turn Prompt Schema Overhead"
                percent={85 * progressBetween(frame, schemasCue, schemasCue + 36)}
                valueLabel="~25K tokens"
                tone="amber"
                height={24}
              />
            </Card>
          </div>

          <div style={slideUpStyle(frame, fps, b11.start + 26, 20)}>
            <Card tone="cyan" glow={frame >= compCue} padding={32} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", opacity: frame >= compCue - 20 ? 1 : 0.38 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: TOKENS.fonts.display, fontSize: 34, fontWeight: 700 }}>
                  6 Composable Primitives
                </span>
                <Pill tone="emerald" size="md">SHARP &amp; FAST</Pill>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {CLEAN_PRIMITIVES.map((p) => (
                  <DataChip key={p.label} label={p.label} sublabel={p.sub} tone="cyan" style={{ fontSize: 20, padding: "22px 14px" }} />
                ))}
              </div>
              <MeterBar
                label="Tool Selection Accuracy"
                percent={94 * progressBetween(frame, compCue, compCue + 36)}
                valueLabel="High"
                tone="emerald"
                height={24}
              />
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 12: Full-Canvas SWE-agent ACI Before→After Transform */}
      <SceneBeat window={w12}>
        <div style={{ maxWidth: 1320, width: "100%", margin: "0 auto" }}>
          <div style={slideUpStyle(frame, fps, b12.start + 16, 16)}>
            <CodePanel
              title="Opaque Error — Forces Blind Retries"
              badge="EXIT CODE 1"
              tone="rose"
              lines={OPAQUE_ERR}
              fontSize={22}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, height: 112 }}>
            <svg width={90} height={112} viewBox="0 0 90 112">
              <SvgLink
                x1={45}
                y1={8}
                x2={45}
                y2={104}
                progress={progressBetween(frame, actionCue, actionCue + 24)}
                tone="cyan"
                strokeWidth={4}
                arrow
              />
            </svg>
            <span
              style={{
                fontFamily: TOKENS.fonts.handwritten,
                fontSize: 50,
                fontWeight: 700,
                color: TOKENS.colors.accentWarm,
                opacity: fadeIn(frame, actionCue + 10, 14),
              }}
            >
              SWE-agent ACI: Tools are a UI for the model!
            </span>
          </div>

          <div style={slideUpStyle(frame, fps, actionCue, 16)}>
            <CodePanel
              title="Actionable Harness Error — auth.ts"
              badge="SELF-RECOVERABLE"
              tone="emerald"
              lines={ACTIONABLE_ERR}
              fontSize={22}
            />
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 13: Full-Canvas Full Rewrite vs Targeted Diffs */}
      <SceneBeat window={w13}>
        <div style={{ display: "grid", gridTemplateColumns: "0.86fr 1.14fr", gap: 36, alignItems: "stretch", height: 680 }}>
          <div style={slideUpStyle(frame, fps, rewriteCue - 12, 20)}>
            <Card tone="rose" padding={34} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <Pill tone="rose" size="md">FULL-FILE REWRITE</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 38, fontWeight: 700, marginTop: 14 }}>
                  Regenerate All 800 Lines
                </div>
                <p style={{ fontSize: 22, color: TOKENS.colors.textSecondary, marginTop: 12, lineHeight: 1.45 }}>
                  Wastes output tokens, adds seconds of latency, and invites accidental deletions.
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
                    size={54}
                  />
                }
                detail="For a 5-line race-condition fix"
                tone="amber"
              />
            </Card>
          </div>

          <div style={slideUpStyle(frame, fps, modernCue - 8, 20)}>
            <Card tone="emerald" glow={frame >= targetedCue} padding={34} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div>
                  <Pill tone="emerald" size="md">AIDER • CLAUDE CODE • CURSOR</Pill>
                  <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 38, fontWeight: 700, marginTop: 14 }}>
                    Targeted Search-and-Replace / Diff-Merge
                  </div>
                </div>
                <DataChip label="10× FEWER TOKENS" tone="emerald" style={{ fontSize: 18, padding: "12px 16px" }} />
              </div>

              <CodePanel
                title="Targeted Patch (auth.ts)"
                badge="~120 TOKENS"
                tone="emerald"
                lines={PATCH_DIFF}
                fontSize={22}
              />
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
