import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import { CheckRow } from "../../ui/diagrams";
import {
  clipRange,
  cueFrame,
  fadeIn,
  progressBetween,
  sceneWindow,
  slideUpStyle,
} from "../../ui/motion";
import { Card, DataChip, MeterBar, Pill, SceneBeat, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

const BLOAT_TOOLS = [
  "slack.list", "slack.post", "slack.react", "notion.get", "notion.edit", "notion.query",
  "drive.find", "drive.share", "github.pr", "github.diff", "linear.sync", "jira.move",
  "sql.read", "sql.schema", "cal.create", "cal.delete", "mail.send", "crm.update",
];

const GUARDRAILS = [
  {
    label: "1. Trusted Sources Only",
    detail: "Treat MCP servers like browser extensions — verify publishers before installing.",
    status: "VERIFY FIRST",
  },
  {
    label: "2. Least-Privilege Scopes",
    detail: "Grant read-only access or specific folders/channels instead of full admin keys.",
    status: "MINIMAL ACCESS",
  },
  {
    label: "3. Human Approval on Writes",
    detail: "Keep explicit confirmation turned on before creating, editing, or deleting data.",
    status: "IN-THE-LOOP",
  },
];

export const PitfallsAndOutroChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c26 = clips[0];
  const c27 = clips[1];
  const c28 = clips[2];
  const c29 = clips[3];
  const c30 = clips[4];

  const r26 = clipRange(c26, chapter.startFrame, 0, 600);
  const r27 = clipRange(c27, chapter.startFrame, r26.end, 640);
  const r28 = clipRange(c28, chapter.startFrame, r27.end, 610);
  const r29 = clipRange(c29, chapter.startFrame, r28.end, 650);
  const r30 = clipRange(c30, chapter.startFrame, r29.end, 350);

  // Beat A cues (P26 context bloat)
  const tokensCue = cueFrame(c26, "tokens", 240, chapter.startFrame);
  const focusedCue = cueFrame(c26, "focused", 420, chapter.startFrame);

  // Beat B cues (P27 security)
  const poisoningCue = cueFrame(c27, "poisoning", 220, chapter.startFrame);
  const extensionsCue = cueFrame(c27, "extensions", 310, chapter.startFrame);

  // Beat C cues (P28 when NOT to use MCP)
  const simpleCue = cueFrame(c28, "simple", 250, chapter.startFrame);
  const shinesCue = cueFrame(c28, "shines", 360, chapter.startFrame);

  // Beat D cues (P29-P30 synthesis + clean right-side YouTube End Screen)
  const isolatedCue = cueFrame(c29, "isolated", 110, chapter.startFrame);
  const interoperableCue = cueFrame(c29, "interoperable", 180, chapter.startFrame);
  const commentCue = cueFrame(c30, "comment", 40, chapter.startFrame);

  const beatA = sceneWindow(frame, r26.start, r27.start, { fadeInFrames: 12, fadeOutFrames: 10 });
  const beatB = sceneWindow(frame, r27.start, r28.start, { fadeInFrames: 12, fadeOutFrames: 10 });
  const beatC = sceneWindow(frame, r28.start, r29.start, { fadeInFrames: 12, fadeOutFrames: 10 });
  const beatD = sceneWindow(frame, r29.start, r30.end, { fadeInFrames: 14, keepAtEnd: true });

  // Beat A context meter animation: spikes up to 78% on "tokens", then drops to 14% on "focused"
  const surge = progressBetween(frame, r26.start + 60, tokensCue + 30);
  const trim = progressBetween(frame, focusedCue, focusedCue + 38);
  const bloatPercent = interpolate(trim, [0, 1], [18 + 60 * surge, 14]);
  const isTrimmed = trim > 0.35;

  const inOutro = frame >= r29.start;
  const stageTone = inOutro ? "emerald" : frame >= r28.start ? "amber" : "rose";

  return (
    <Stage
      chapterIndex="08"
      chapterTitle={chapter.title}
      tone={stageTone}
      legend={
        inOutro
          ? [{ label: "KEY TAKEAWAY", tone: "emerald" }]
          : [
              { label: "RISK / COST", tone: "rose" },
              { label: "GUARDRAIL / WIN", tone: "emerald" },
            ]
      }
    >
      {/* SceneBeat A: Pitfall 1 — Context Window Bloat (P26) */}
      <SceneBeat window={beatA} align="stretch">
        <div style={slideUpStyle(frame, fps, r26.start, 20)}>
          <SectionTitle
            eyebrow="TRADE-OFF #1 · CONTEXT BUDGET"
            title="Too Many Connected Tools = Context Window Bloat"
            subtitle="Every tool definition consumes prompt tokens before you even ask your first question."
            tone={isTrimmed ? "emerald" : "rose"}
            style={{ marginBottom: 28 }}
          />
        </div>

        <Card tone={isTrimmed ? "emerald" : "rose"} glow padding={32}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 22,
            }}
          >
            <Pill tone={isTrimmed ? "emerald" : "rose"} size="md">
              {isTrimmed ? "FOCUSED SERVERS / DYNAMIC SEARCH" : "10 SERVERS · 100+ TOOL SCHEMAS"}
            </Pill>
            <Pill tone={isTrimmed ? "emerald" : "amber"} size="md">
              {isTrimmed ? "FAST · ACCURATE · LOW COST" : "HIGHER COST · WRONG TOOL PICKS"}
            </Pill>
          </div>

          <MeterBar
            label="Prompt Context Consumed by Tool Descriptions"
            percent={bloatPercent}
            tone={isTrimmed ? "emerald" : "rose"}
            valueLabel={isTrimmed ? "~2.5k tokens (14%)" : `~${Math.round(4 + 21 * surge)}k tokens (${Math.round(bloatPercent)}%)`}
            height={32}
          />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 28,
            }}
          >
            {BLOAT_TOOLS.map((tool, idx) => {
              const keep = idx < 3;
              const chipDim = isTrimmed && !keep;
              return (
                <DataChip
                  key={tool}
                  label={tool}
                  tone={isTrimmed && keep ? "emerald" : "rose"}
                  dim={chipDim}
                  style={{
                    padding: "8px 14px",
                    fontSize: 16,
                    opacity: chipDim ? 0.16 : fadeIn(frame, r26.start + 30 + idx * 4, 10),
                  }}
                />
              );
            })}
          </div>
        </Card>
      </SceneBeat>

      {/* SceneBeat B: Pitfall 2 — Security, Prompt Injection & Tool Poisoning (P27) */}
      <SceneBeat window={beatB} align="stretch">
        <div style={slideUpStyle(frame, fps, r27.start, 20)}>
          <SectionTitle
            eyebrow="TRADE-OFF #2 · SECURITY & TRUST BOUNDARIES"
            title="Treat MCP Servers Like Browser Extensions"
            subtitle="Real-world tool access introduces real risks — apply three clear guardrails."
            tone="rose"
            style={{ marginBottom: 28 }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 28 }}>
          {/* Left: Threat Vectors */}
          <div style={slideUpStyle(frame, fps, r27.start + 8, 22)}>
            <Card
              tone="rose"
              glow={frame >= poisoningCue}
              padding={28}
              style={{ height: 470, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                <Pill tone="rose" size="md" style={{ marginBottom: 18 }}>
                  THREAT VECTORS
                </Pill>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div
                    style={{
                      padding: 20,
                      borderRadius: 16,
                      backgroundColor: TONE_STYLES.rose.bg,
                      border: `1.5px solid ${TONE_STYLES.rose.border}`,
                    }}
                  >
                    <div style={{ fontSize: 25, fontWeight: 800, color: TOKENS.colors.textPrimary, marginBottom: 6 }}>
                      Prompt Injection
                    </div>
                    <div style={{ fontSize: 18, lineHeight: 1.4, color: TOKENS.colors.textSecondary }}>
                      Untrusted text fetched from emails, docs, or chats tries to hijack what the AI does next.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 20,
                      borderRadius: 16,
                      backgroundColor:
                        frame >= poisoningCue ? TONE_STYLES.rose.bg : "rgba(255,255,255,0.03)",
                      border: `1.5px solid ${
                        frame >= poisoningCue ? TOKENS.colors.accentRose : TOKENS.colors.border
                      }`,
                    }}
                  >
                    <div style={{ fontSize: 25, fontWeight: 800, color: TOKENS.colors.accentRose, marginBottom: 6 }}>
                      Tool Poisoning
                    </div>
                    <div style={{ fontSize: 18, lineHeight: 1.4, color: TOKENS.colors.textSecondary }}>
                      Malicious servers smuggle hidden instructions inside tool descriptions to exfiltrate data.
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: TOKENS.colors.accentRose,
                  textAlign: "center",
                }}
              >
                NEVER BLINDLY INSTALL RANDOM SERVERS
              </div>
            </Card>
          </div>

          {/* Right: 3 Golden Guardrails */}
          <div style={slideUpStyle(frame, fps, extensionsCue - 20, 22)}>
            <Card
              tone="emerald"
              glow={frame >= extensionsCue}
              padding={28}
              style={{ height: 470, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
            >
              <div>
                <Pill tone="emerald" size="md" style={{ marginBottom: 18 }}>
                  3 GOLDEN GUARDRAILS
                </Pill>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {GUARDRAILS.map((item, idx) => {
                    const active = frame >= extensionsCue + idx * 24;
                    return (
                      <CheckRow
                        key={item.label}
                        label={item.label}
                        detail={item.detail}
                        status={item.status}
                        tone="emerald"
                        active={active}
                        icon="✓"
                      />
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 15,
                  fontWeight: 700,
                  color: TOKENS.colors.accentEmerald,
                  textAlign: "center",
                }}
              >
                TRUST · LEAST PRIVILEGE · HUMAN APPROVAL
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* SceneBeat C: When NOT to Use MCP (P28) */}
      <SceneBeat window={beatC} align="stretch">
        <div style={slideUpStyle(frame, fps, r28.start, 20)}>
          <SectionTitle
            eyebrow="TRADE-OFF #3 · PRAGMATISM"
            title="Know When NOT to Use MCP"
            subtitle="MCP is a universal standard — not a magic hammer for every task."
            tone="amber"
            style={{ marginBottom: 32 }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
          <div style={slideUpStyle(frame, fps, Math.min(r28.start + 10, simpleCue), 22)}>
            <Card tone="amber" glow={frame >= simpleCue} padding={32} style={{ height: 420 }}>
              <Pill tone="amber" size="md" style={{ marginBottom: 20 }}>
                KEEP IT SIMPLE — SKIP MCP WHEN
              </Pill>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <CheckRow
                  label="One-off file paste"
                  detail="You only need to analyze a single static doc once."
                  status="PASTE IT"
                  tone="amber"
                  icon="–"
                />
                <CheckRow
                  label="Fixed deterministic script"
                  detail="Steps never change and no AI judgment is needed."
                  status="USE CODE"
                  tone="amber"
                  icon="–"
                />
                <CheckRow
                  label="Simple single-step task"
                  detail="No multi-app orchestration or live data lookup."
                  status="DIRECT"
                  tone="amber"
                  icon="–"
                />
              </div>
            </Card>
          </div>

          <div style={slideUpStyle(frame, fps, shinesCue - 20, 22)}>
            <Card tone="emerald" glow={frame >= shinesCue} padding={32} style={{ height: 420 }}>
              <Pill tone="emerald" size="md" style={{ marginBottom: 20 }}>
                MCP TRULY SHINES WHEN
              </Pill>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <CheckRow
                  label="Live, constantly changing data"
                  detail="Messages, tickets, calendars, docs, or live databases."
                  status="LIVE SYNC"
                  tone="emerald"
                  icon="✓"
                />
                <CheckRow
                  label="Multi-app AI workflows"
                  detail="AI reads from one tool, reasons, and acts in another."
                  status="ORCHESTRATE"
                  tone="emerald"
                  icon="✓"
                />
                <CheckRow
                  label="Reusable across many AI hosts"
                  detail="Build or connect once — use in Claude, Cursor, ChatGPT & more."
                  status="PORTABLE"
                  tone="emerald"
                  icon="✓"
                />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>

      {/* SceneBeat D: Synthesis & Clean Right-Side YouTube End-Screen Safe Zone (P29-P30) */}
      <SceneBeat window={beatD} align="stretch">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.46fr 0.54fr",
            height: "100%",
            alignItems: "center",
          }}
        >
          {/* Left ~46% Column: Synthesis Hero + Discussion Prompt (Right ~54% stays completely clear for YouTube End-Screen Cards) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={slideUpStyle(frame, fps, r29.start, 22)}>
              <Card tone="emerald" glow padding={34}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <Pill tone="emerald" size="sm">
                    THE BIG PICTURE
                  </Pill>
                  {frame >= isolatedCue ? (
                    <Pill tone="cyan" size="sm">
                      ISOLATED → CONNECTED
                    </Pill>
                  ) : null}
                </div>

                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 900,
                    lineHeight: 1.1,
                    letterSpacing: "-0.025em",
                    marginBottom: 16,
                  }}
                >
                  AI Meets You Where Your Work Already Lives
                </div>

                <div
                  style={{
                    fontSize: 21,
                    lineHeight: 1.45,
                    color: TOKENS.colors.textSecondary,
                    marginBottom: 24,
                  }}
                >
                  One open standard collapsing bespoke glue into interoperable tools, context, and workflows.
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    opacity: fadeIn(frame, interoperableCue - 15, 16),
                  }}
                >
                  <Pill tone="cyan" size="md">
                    M × N  →  M + N  Open Standard
                  </Pill>
                  <Pill tone="emerald" size="md">
                    Host · Client · Server (1:1 Isolation)
                  </Pill>
                  <Pill tone="amber" size="md">
                    Tools · Resources · Prompts
                  </Pill>
                </div>
              </Card>
            </div>

            {/* Subtle Left-Side Discussion Prompt in P30 */}
            {frame >= r30.start ? (
              <div style={slideUpStyle(frame, fps, commentCue - 10, 16)}>
                <Card tone="cyan" padding={24}>
                  <div
                    style={{
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 15,
                      fontWeight: 800,
                      color: TOKENS.colors.accent,
                      letterSpacing: "0.08em",
                      marginBottom: 8,
                    }}
                  >
                    DROP A COMMENT BELOW
                  </div>
                  <div style={{ fontSize: 25, fontWeight: 800, lineHeight: 1.28 }}>
                    Which MCP server will you connect first — or build next?
                  </div>
                </Card>
              </div>
            ) : null}
          </div>

          {/* Right ~54%: Intentionally left open & clean for YouTube End-Screen video & subscribe elements */}
          <div />
        </div>
      </SceneBeat>
    </Stage>
  );
};
