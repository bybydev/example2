import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import type { SemanticTone } from "../../theme/tokens";
import { CodePanel, SvgPacket } from "../../ui/diagrams";
import type { CodeLine } from "../../ui/diagrams";
import {
  clipRange,
  cueFrame,
  fadeIn,
  progressBetween,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import { Card, Pill, SceneBeat } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const LANES: Array<{ label: string; sub: string; x: number; tone: SemanticTone }> = [
  { label: "You", sub: "User Prompt", x: 145, tone: "neutral" },
  { label: "Host + Client", sub: "Orchestrator", x: 490, tone: "cyan" },
  { label: "LLM", sub: "Reasoning Only", x: 840, tone: "amber" },
  { label: "Slack MCP", sub: "Read Tools", x: 1190, tone: "emerald" },
  { label: "Notion MCP", sub: "Write Tools", x: 1535, tone: "emerald" },
];

const PAYLOAD_DISCOVERY: CodeLine[] = [
  { text: "// Step 1 — Host Clients fetch live tool catalogs via tools/list", tone: "neutral" },
  { text: 'Slack MCP  ->  slack.search_messages({ channel, query })', tone: "cyan", highlight: true },
  { text: 'Notion MCP ->  notion.create_draft({ title, bullets[] })', tone: "emerald", highlight: true },
  { text: 'Status: 2 servers connected · tools ready before you press Enter', tone: "neutral" },
];

const PAYLOAD_DECISION: CodeLine[] = [
  { text: "// Step 2 — LLM reasons & outputs a structured decision (never calls Slack directly)", tone: "neutral" },
  { text: '{ "method": "tools/call", "params": {', tone: "cyan", highlight: true },
  { text: '    "name": "slack.search_messages",', tone: "amber" },
  { text: '    "arguments": { "channel": "#feedback", "query": "urgent" } } }', tone: "cyan" },
];

const PAYLOAD_RETURN: CodeLine[] = [
  { text: "// Step 3 — Slack MCP Server executes & returns verified structured JSON", tone: "neutral" },
  { text: '[ { "id": "REQ-104", "item": "CSV export for reports", "priority": "urgent" },', tone: "emerald", highlight: true },
  { text: '  { "id": "REQ-109", "item": "Dark mode toggle",      "priority": "urgent" },', tone: "emerald" },
  { text: '  { "id": "REQ-112", "item": "Team SSO login",        "priority": "urgent" } ]', tone: "emerald" },
];

const PAYLOAD_NOTION: CodeLine[] = [
  { text: "// Step 4 — Human approves write -> Notion MCP creates live draft", tone: "neutral" },
  { text: 'tools/call  notion.create_draft({ title: "Monday Customer Update", items: 3 })', tone: "amber", highlight: true },
  { text: 'Result ->  { "status": "created", "url": "notion.so/monday-update-draft" }', tone: "emerald", highlight: true },
  { text: 'Assistant: "Draft ready! Here is your direct link to Monday Customer Update."', tone: "cyan" },
];

export const WalkthroughChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c16 = clips[0];
  const c17 = clips[1];
  const c18 = clips[2];
  const c19 = clips[3];

  const r16 = clipRange(c16, chapter.startFrame, 0, 560);
  const r17 = clipRange(c17, chapter.startFrame, r16.end, 550);
  const r18 = clipRange(c18, chapter.startFrame, r17.end, 540);
  const r19 = clipRange(c19, chapter.startFrame, r18.end, 550);

  // Spoken cue anchors (all verified against real Whisper output)
  const urgentCue = cueFrame(c16, "urgent", 75, chapter.startFrame);
  const catalogCue = cueFrame(c16, "catalog", 260, chapter.startFrame);
  const directlyCue = cueFrame(c17, "directly", 140, chapter.startFrame);
  const structuredCue = cueFrame(c17, "structured", 240, chapter.startFrame);
  const routesCue = cueFrame(c18, "routes", 40, chapter.startFrame);
  const returnsCue = cueFrame(c18, "returns", 170, chapter.startFrame);
  const pausesCue = cueFrame(c19, "pauses", 130, chapter.startFrame);
  const approveCue = cueFrame(c19, "approve", 225, chapter.startFrame);
  const linkCue = cueFrame(c19, "link", 330, chapter.startFrame);

  const window = sceneWindow(frame, r16.start, r19.end, {
    fadeInFrames: 12,
    keepAtEnd: true,
  });

  // Step-by-step animation progress values
  const discSlack = progressBetween(frame, catalogCue, catalogCue + 36);
  const discNotion = progressBetween(frame, catalogCue + 12, catalogCue + 48);
  const promptToLlm = progressBetween(frame, r17.start, r17.start + 42);
  const llmToHost = progressBetween(frame, structuredCue, structuredCue + 36);
  const hostToSlack = progressBetween(frame, routesCue, routesCue + 38);
  const slackReturn = progressBetween(frame, returnsCue, returnsCue + 42);
  const hostToNotion = progressBetween(frame, approveCue + 8, approveCue + 46);
  const notionDone = progressBetween(frame, linkCue - 20, linkCue + 22);

  // Dynamic bottom CodePanel inspector state
  let panelTitle = "01-discovery-tools-list.json";
  let panelBadge = "STEP 1 · DISCOVERY";
  let panelTone: SemanticTone = "cyan";
  let panelLines = PAYLOAD_DISCOVERY;
  let panelReveal = progressBetween(frame, catalogCue, catalogCue + 55);

  if (frame >= r19.start) {
    panelTitle = "04-write-approval-and-notion.json";
    panelBadge = frame >= approveCue ? "STEP 4 · APPROVED & CREATED" : "STEP 4 · AWAITING APPROVAL";
    panelTone = frame >= approveCue ? "emerald" : "amber";
    panelLines = PAYLOAD_NOTION;
    panelReveal = progressBetween(frame, r19.start, linkCue + 10);
  } else if (frame >= r18.start) {
    panelTitle = "03-slack-mcp-response.json";
    panelBadge = "STEP 3 · LIVE DATA RETURNED";
    panelTone = "emerald";
    panelLines = PAYLOAD_RETURN;
    panelReveal = progressBetween(frame, routesCue, returnsCue + 45);
  } else if (frame >= r17.start) {
    panelTitle = "02-llm-tool-decision.json";
    panelBadge = "STEP 2 · LLM DECIDES";
    panelTone = "amber";
    panelLines = PAYLOAD_DECISION;
    panelReveal = progressBetween(frame, r17.start, structuredCue + 40);
  }

  const showApprovalModal = frame >= pausesCue && frame < linkCue + 45;
  const isApproved = frame >= approveCue;

  return (
    <Stage
      chapterIndex="05"
      chapterTitle={chapter.title}
      tone="cyan"
      legend={[
        { label: "CONTROL FLOW", tone: "cyan" },
        { label: "DATA RETURN", tone: "emerald" },
        { label: "HUMAN APPROVAL", tone: "amber" },
      ]}
    >
      {/* Intentionally omit SectionTitle so 5 swimlanes + CodePanel fit cleanly in 1680x850 */}
      <SceneBeat window={window} align="stretch">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Upper 64%: 5-Lane Animated Sequence Diagram */}
          <div
            style={{
              position: "relative",
              width: 1680,
              height: 550,
              backgroundColor: "rgba(20, 27, 48, 0.45)",
              border: `1px solid ${TOKENS.colors.border}`,
              borderRadius: 22,
              overflow: "hidden",
            }}
          >
            {/* Lane Header Boxes */}
            {LANES.map((lane) => {
              const t = TONE_STYLES[lane.tone];
              return (
                <div
                  key={lane.label}
                  style={{
                    position: "absolute",
                    left: lane.x - 115,
                    top: 16,
                    width: 230,
                    height: 64,
                    borderRadius: 14,
                    backgroundColor: TOKENS.colors.surface,
                    border: `1.5px solid ${t.border}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: 21, fontWeight: 800, color: TOKENS.colors.textPrimary }}>
                    {lane.label}
                  </div>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 13,
                      fontWeight: 700,
                      color: t.main,
                    }}
                  >
                    {lane.sub}
                  </div>
                </div>
              );
            })}

            {/* SVG Swimlanes, Arrows & Traveling Packets */}
            <svg width={1680} height={550} viewBox="0 0 1680 550" style={{ position: "absolute", inset: 0 }}>
              {/* Vertical lifelines */}
              {LANES.map((lane) => (
                <line
                  key={`line-${lane.label}`}
                  x1={lane.x}
                  y1={82}
                  x2={lane.x}
                  y2={530}
                  stroke="rgba(255, 255, 255, 0.14)"
                  strokeWidth={2}
                  strokeDasharray="6 8"
                />
              ))}

              {/* Subtle security boundary between LLM and external MCP servers during P17 */}
              {frame >= directlyCue && frame < r18.start ? (
                <g opacity={fadeIn(frame, directlyCue, 10)}>
                  <line
                    x1={1015}
                    y1={92}
                    x2={1015}
                    y2={520}
                    stroke={TOKENS.colors.accentRose}
                    strokeWidth={3}
                    strokeDasharray="10 8"
                  />
                  <rect
                    x={910}
                    y={104}
                    width={210}
                    height={32}
                    rx={16}
                    fill={TOKENS.colors.background}
                    stroke={TOKENS.colors.accentRose}
                    strokeWidth={1.5}
                  />
                  <text
                    x={1015}
                    y={125}
                    textAnchor="middle"
                    fill={TOKENS.colors.accentRose}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={13}
                    fontWeight={800}
                  >
                    NO DIRECT LLM ACCESS
                  </text>
                </g>
              ) : null}

              {/* Row 0 (y=130): Step 1 Discovery tools/list */}
              {frame >= catalogCue ? (
                <g opacity={fadeIn(frame, catalogCue, 10)}>
                  <line x1={490} y1={132} x2={1535} y2={132} stroke={TOKENS.colors.accent} strokeWidth={3} />
                  <text
                    x={1015}
                    y={121}
                    textAnchor="middle"
                    fill={TOKENS.colors.accent}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={15}
                    fontWeight={700}
                  >
                    1. tools/list → Live Tool Catalog
                  </text>
                  <SvgPacket x1={490} y1={132} x2={1190} y2={132} progress={discSlack} tone="cyan" radius={8} />
                  <SvgPacket x1={490} y1={132} x2={1535} y2={132} progress={discNotion} tone="cyan" radius={8} />
                </g>
              ) : null}

              {/* Row 1 (y=198): Step 2 User Prompt + Tool Catalog -> LLM */}
              {frame >= r17.start ? (
                <g opacity={fadeIn(frame, r17.start, 10)}>
                  <line x1={145} y1={202} x2={840} y2={202} stroke={TOKENS.colors.accent} strokeWidth={3} />
                  <text
                    x={490}
                    y={190}
                    textAnchor="middle"
                    fill={TOKENS.colors.textPrimary}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={15}
                    fontWeight={700}
                  >
                    2. Prompt + Tool Catalog → LLM
                  </text>
                  <SvgPacket x1={145} y1={202} x2={840} y2={202} progress={promptToLlm} tone="cyan" radius={8} />
                </g>
              ) : null}

              {/* Row 2 (y=266): LLM Structured Decision -> Host */}
              {frame >= structuredCue ? (
                <g opacity={fadeIn(frame, structuredCue, 10)}>
                  <line x1={840} y1={266} x2={490} y2={266} stroke={TOKENS.colors.accentWarm} strokeWidth={3} />
                  <text
                    x={665}
                    y={254}
                    textAnchor="middle"
                    fill={TOKENS.colors.accentWarm}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={15}
                    fontWeight={700}
                  >
                    ← Call slack.search_messages()
                  </text>
                  <SvgPacket x1={840} y1={266} x2={490} y2={266} progress={llmToHost} tone="amber" radius={8} />
                </g>
              ) : null}

              {/* Row 3 (y=334): Host -> Slack MCP & Return -> LLM */}
              {frame >= routesCue ? (
                <g opacity={fadeIn(frame, routesCue, 10)}>
                  <line x1={490} y1={332} x2={1190} y2={332} stroke={TOKENS.colors.accent} strokeWidth={3} />
                  <text
                    x={840}
                    y={320}
                    textAnchor="middle"
                    fill={TOKENS.colors.accent}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={15}
                    fontWeight={700}
                  >
                    3. tools/call → Slack API
                  </text>
                  <SvgPacket x1={490} y1={332} x2={1190} y2={332} progress={hostToSlack} tone="cyan" radius={8} />
                </g>
              ) : null}

              {frame >= returnsCue ? (
                <g opacity={fadeIn(frame, returnsCue, 10)}>
                  <line
                    x1={1190}
                    y1={376}
                    x2={840}
                    y2={376}
                    stroke={TOKENS.colors.accentEmerald}
                    strokeWidth={3.5}
                  />
                  <text
                    x={1015}
                    y={365}
                    textAnchor="middle"
                    fill={TOKENS.colors.accentEmerald}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={14}
                    fontWeight={700}
                  >
                    ← 3 Urgent Requests (JSON)
                  </text>
                  <SvgPacket x1={1190} y1={376} x2={840} y2={376} progress={slackReturn} tone="emerald" radius={8} />
                </g>
              ) : null}

              {/* Row 4 (y=438): Approved Write -> Notion MCP */}
              {frame >= approveCue ? (
                <g opacity={fadeIn(frame, approveCue, 10)}>
                  <line
                    x1={490}
                    y1={440}
                    x2={1535}
                    y2={440}
                    stroke={TOKENS.colors.accentEmerald}
                    strokeWidth={3.5}
                  />
                  <text
                    x={1190}
                    y={428}
                    textAnchor="middle"
                    fill={TOKENS.colors.accentEmerald}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={15}
                    fontWeight={700}
                  >
                    4. Approved: notion.create_draft() →
                  </text>
                  <SvgPacket x1={490} y1={440} x2={1535} y2={440} progress={hostToNotion} tone="emerald" radius={8} />
                </g>
              ) : null}

              {/* Row 5 (y=502): Final Link Back to User */}
              {frame >= linkCue - 20 ? (
                <g opacity={fadeIn(frame, linkCue - 20, 12)}>
                  <line
                    x1={1535}
                    y1={502}
                    x2={145}
                    y2={502}
                    stroke={TOKENS.colors.accentEmerald}
                    strokeWidth={4}
                  />
                  <text
                    x={840}
                    y={490}
                    textAnchor="middle"
                    fill={TOKENS.colors.accentEmerald}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={15}
                    fontWeight={800}
                  >
                    ← Draft Created · Live Link Delivered to User
                  </text>
                  <SvgPacket x1={1535} y1={502} x2={145} y2={502} progress={notionDone} tone="emerald" radius={9} />
                </g>
              ) : null}
            </svg>

            {/* User Prompt Floating Bubble (P16) */}
            {frame >= urgentCue && frame < r18.start ? (
              <div
                style={{
                  position: "absolute",
                  left: 34,
                  top: 235,
                  width: 390,
                  ...slideUpStyle(frame, fps, urgentCue, 16),
                }}
              >
                <Card tone="cyan" glow padding={18}>
                  <Pill tone="cyan" size="sm" style={{ marginBottom: 8 }}>
                    USER PROMPT
                  </Pill>
                  <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.38 }}>
                    &ldquo;Find urgent customer requests in Slack #feedback and draft a Monday update in Notion.&rdquo;
                  </div>
                </Card>
              </div>
            ) : null}

            {/* LLM Decides / Host Executes Callout (P17) */}
            {frame >= directlyCue && frame < r18.start ? (
              <div
                style={{
                  position: "absolute",
                  right: 36,
                  top: 235,
                  ...slideUpStyle(frame, fps, directlyCue, 14),
                }}
              >
                <Pill tone="amber" size="lg">
                  LLM DECIDES · HOST EXECUTES
                </Pill>
              </div>
            ) : null}

            {/* Human-in-the-Loop Write Approval Modal (P19) */}
            {showApprovalModal ? (
              <div
                style={{
                  position: "absolute",
                  left: 280,
                  top: 382,
                  width: 440,
                  ...slideUpStyle(frame, fps, pausesCue, 16),
                }}
              >
                <Card tone={isApproved ? "emerald" : "amber"} glow padding={18}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Pill tone={isApproved ? "emerald" : "amber"} size="sm">
                      {isApproved ? "APPROVED BY YOU ✓" : "HUMAN APPROVAL REQUIRED"}
                    </Pill>
                    <span
                      style={{
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 13,
                        fontWeight: 700,
                        color: TOKENS.colors.textMuted,
                      }}
                    >
                      WRITE ACTION
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 16,
                      color: TOKENS.colors.textPrimary,
                      fontWeight: 700,
                    }}
                  >
                    notion.create_draft(&ldquo;Monday Update&rdquo;)
                  </div>
                </Card>
              </div>
            ) : null}
          </div>

          {/* Lower 34%: Live JSON-RPC & Status Inspector */}
          <CodePanel
            title={panelTitle}
            badge={panelBadge}
            tone={panelTone}
            lines={panelLines}
            revealProgress={Math.max(0.3, panelReveal)}
            fontSize={19}
            style={{ height: 274 }}
          />
        </div>
      </SceneBeat>
    </Stage>
  );
};
