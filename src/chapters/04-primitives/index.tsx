import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TOKENS, TONE_STYLES } from "../../theme/tokens";
import type { SemanticTone } from "../../theme/tokens";
import {
  clipRange,
  cueFrame,
  fadeIn,
  sceneWindow,
  slideUpStyle,
  springAt,
} from "../../ui/motion";
import { Card, DataChip, Pill, SceneBeat, SectionTitle } from "../../ui/primitives";
import { Stage } from "../../ui/Stage";
import type { ChapterComponentProps } from "../index";

type PrimitivePillar = {
  key: string;
  title: string;
  controlLabel: string;
  metaphor: string;
  description: string;
  tone: SemanticTone;
  chips: Array<{ label: string; sublabel: string }>;
  footerBadge: string;
};

const PILLARS: PrimitivePillar[] = [
  {
    key: "tools",
    title: "Tools",
    controlLabel: "MODEL-CONTROLLED",
    metaphor: "Verbs — Do Things",
    description: "Executable actions with typed inputs. The AI reads descriptions and decides when to call them.",
    tone: "cyan",
    chips: [
      { label: "search_drive()", sublabel: "Everyday" },
      { label: "create_event()", sublabel: "Calendar" },
      { label: "query_sql()", sublabel: "Developer" },
    ],
    footerBadge: "JSON SCHEMA + APPROVAL",
  },
  {
    key: "resources",
    title: "Resources",
    controlLabel: "APP-CONTROLLED",
    metaphor: "Nouns — Read Context",
    description: "Structured, read-only data identified by clean URIs—like safe GET endpoints with zero side effects.",
    tone: "emerald",
    chips: [
      { label: "drive://Q4-plan.pdf", sublabel: "Docs" },
      { label: "notes://standup", sublabel: "Notes" },
      { label: "db://schema", sublabel: "Developer" },
    ],
    footerBadge: "READ-ONLY · NO SIDE EFFECTS",
  },
  {
    key: "prompts",
    title: "Prompts",
    controlLabel: "USER-CONTROLLED",
    metaphor: "Workflows — Templates",
    description: "Reusable prompt templates packaged inside a server so you launch proven workflows with one click.",
    tone: "amber",
    chips: [
      { label: "/prep-meeting", sublabel: "Workspace" },
      { label: "/weekly-brief", sublabel: "Summary" },
      { label: "/review-pr", sublabel: "Developer" },
    ],
    footerBadge: "SLASH COMMAND MENU",
  },
];

const TWO_WAY_ITEMS: Array<{
  title: string;
  subtitle: string;
  tone: SemanticTone;
}> = [
  { title: "Roots", subtitle: "Folder & workspace boundaries", tone: "cyan" },
  { title: "Elicitation", subtitle: "Ask user clarifying questions", tone: "amber" },
  { title: "Sampling", subtitle: "Server borrows host AI safely", tone: "emerald" },
];

export const PrimitivesChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c12 = clips[0];
  const c13 = clips[1];
  const c14 = clips[2];
  const c15 = clips[3];

  const r12 = clipRange(c12, chapter.startFrame, 0, 640);
  const r13 = clipRange(c13, chapter.startFrame, r12.end, 630);
  const r14 = clipRange(c14, chapter.startFrame, r13.end, 630);
  const r15 = clipRange(c15, chapter.startFrame, r14.end, 630);

  const toolsCue = cueFrame(c12, "tools", 120, chapter.startFrame);
  const decidesCue = cueFrame(c12, "decides", 260, chapter.startFrame);
  const resourcesCue = cueFrame(c13, "resources", 20, chapter.startFrame);
  const endpointsCue = cueFrame(c13, "endpoints", 190, chapter.startFrame);
  const promptsCue = cueFrame(c14, "prompts", 20, chapter.startFrame);
  const slashCue = cueFrame(c14, "slash", 170, chapter.startFrame);
  const biCue = cueFrame(c15, "bidirectional", 45, chapter.startFrame);
  const boundariesCue = cueFrame(c15, "boundaries", 130, chapter.startFrame);
  const clarifyingCue = cueFrame(c15, "clarifying", 240, chapter.startFrame);

  const window = sceneWindow(frame, r12.start, r15.end, {
    fadeInFrames: 12,
    keepAtEnd: true,
  });

  const drawerSpring = springAt(frame, fps, biCue, { damping: 18, stiffness: 130 });
  const pillarActivateCues = [toolsCue, resourcesCue, promptsCue];
  const pillarHighlightCues = [decidesCue, endpointsCue, slashCue];
  const twoWayCues = [boundariesCue, clarifyingCue, clarifyingCue + 55];

  return (
    <Stage
      chapterIndex="04"
      chapterTitle={chapter.title}
      tone="emerald"
      legend={[
        { label: "TOOLS (MODEL)", tone: "cyan" },
        { label: "RESOURCES (APP)", tone: "emerald" },
        { label: "PROMPTS (USER)", tone: "amber" },
      ]}
    >
      <SceneBeat window={window} align="stretch">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <div style={slideUpStyle(frame, fps, r12.start, 20)}>
            <SectionTitle
              eyebrow="THE 3 CORE BUILDING BLOCKS"
              title="Tools, Resources & Prompts — Organized by Who Controls Them"
              subtitle="One clean mental model covers every capability an MCP server can expose."
              tone="emerald"
              style={{ marginBottom: 18 }}
            />
          </div>

          {/* 3-Column Core Pillar Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 26,
              flex: 1,
              alignItems: "stretch",
            }}
          >
            {PILLARS.map((pillar, idx) => {
              const active = frame >= pillarActivateCues[idx];
              const emphasized = frame >= pillarHighlightCues[idx];
              const pop = springAt(frame, fps, pillarActivateCues[idx], {
                damping: 16,
                stiffness: 130,
              });
              const t = TONE_STYLES[pillar.tone];

              return (
                <div
                  key={pillar.key}
                  style={{
                    opacity: active ? 1 : 0.28,
                    transform: `translateY(${interpolate(pop, [0, 1], [14, 0])}px)`,
                    display: "flex",
                  }}
                >
                  <Card
                    tone={active ? pillar.tone : "neutral"}
                    glow={active}
                    padding={26}
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 14,
                        }}
                      >
                        <Pill tone={pillar.tone} size="sm">
                          {pillar.controlLabel}
                        </Pill>
                        <span
                          style={{
                            fontFamily: TOKENS.fonts.mono,
                            fontSize: 15,
                            fontWeight: 700,
                            color: TOKENS.colors.textMuted,
                          }}
                        >
                          0{idx + 1}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 40,
                          fontWeight: 900,
                          color: TOKENS.colors.textPrimary,
                          lineHeight: 1.08,
                        }}
                      >
                        {pillar.title}
                      </div>
                      <div
                        style={{
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 18,
                          fontWeight: 700,
                          color: t.main,
                          marginTop: 6,
                          marginBottom: 12,
                        }}
                      >
                        {pillar.metaphor}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          lineHeight: 1.4,
                          color: TOKENS.colors.textSecondary,
                          marginBottom: 18,
                        }}
                      >
                        {pillar.description}
                      </div>

                      {/* Mixed everyday + developer examples */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {pillar.chips.map((chip) => (
                          <DataChip
                            key={chip.label}
                            label={chip.label}
                            sublabel={chip.sublabel}
                            tone={pillar.tone}
                            dim={!active}
                            style={{ padding: "8px 13px", fontSize: 16 }}
                          />
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 18,
                        padding: "10px 14px",
                        borderRadius: 12,
                        backgroundColor: emphasized ? t.bg : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${emphasized ? t.border : TOKENS.colors.border}`,
                        fontFamily: TOKENS.fonts.mono,
                        fontSize: 14,
                        fontWeight: 800,
                        color: emphasized ? t.main : TOKENS.colors.textMuted,
                        textAlign: "center",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {pillar.footerBadge}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Compact Bidirectional Capabilities Drawer (P15) */}
          <div
            style={{
              marginTop: 20,
              opacity: drawerSpring,
              transform: `translateY(${interpolate(drawerSpring, [0, 1], [24, 0])}px)`,
            }}
          >
            <Card
              tone="neutral"
              padding={18}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <Pill tone="cyan" size="sm">
                  TWO-WAY CAPABILITIES
                </Pill>
                <div
                  style={{
                    fontSize: 16,
                    color: TOKENS.colors.textSecondary,
                    marginTop: 6,
                  }}
                >
                  Guardrails & collaboration in both directions
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, flex: 1 }}>
                {TWO_WAY_ITEMS.map((item, idx) => {
                  const lit = frame >= twoWayCues[idx];
                  const t = TONE_STYLES[item.tone];
                  return (
                    <div
                      key={item.title}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 14,
                        backgroundColor: lit ? t.bg : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${lit ? t.border : TOKENS.colors.border}`,
                        opacity: fadeIn(frame, biCue + idx * 6, 12),
                      }}
                    >
                      <div
                        style={{
                          fontFamily: TOKENS.fonts.mono,
                          fontSize: 18,
                          fontWeight: 800,
                          color: lit ? t.main : TOKENS.colors.textPrimary,
                        }}
                      >
                        {item.title}
                      </div>
                      <div style={{ fontSize: 14, color: TOKENS.colors.textSecondary, marginTop: 2 }}>
                        {item.subtitle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
