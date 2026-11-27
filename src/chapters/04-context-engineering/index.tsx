import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
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

const TRUNCATED_SUMMARY: CodeLine[] = [
  { text: "FAIL auth.test.ts (1 failed, 42 passed)", tone: "rose", highlight: true },
  { text: "  ● refreshToken concurrent race", tone: "amber" },
  { text: "    Expected 1 refresh call, received 2", tone: "amber" },
  { text: "... [9,960 lines truncated → /tmp/test.log]", tone: "cyan", highlight: true },
];

const SKILLS = [
  { title: "Auth Guidelines", sub: "Token lock & refresh invariants", active: true },
  { title: "Deploy Rules", sub: "CI/CD release checklists", active: false },
  { title: "DB Migrations", sub: "Zero-downtime SQL rules", active: false },
  { title: "UI Design Kit", sub: "Component & token specs", active: false },
];

export const ContextEngineeringChapter: React.FC<ChapterComponentProps> = ({ chapter, clips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const c14 = clips[0];
  const c15 = clips[1];
  const c16 = clips[2];
  const c17 = clips[3];
  const c18 = clips[4];
  const c19 = clips[5];

  const b14 = clipRange(c14, chapter.startFrame, 0, 880);
  const b15 = clipRange(c15, chapter.startFrame, b14.end, 860);
  const b16 = clipRange(c16, chapter.startFrame, b15.end, 820);
  const b17 = clipRange(c17, chapter.startFrame, b16.end, 860);
  const b18 = clipRange(c18, chapter.startFrame, b17.end, 840);
  const b19 = clipRange(c19, chapter.startFrame, b18.end, 860);

  // Beat 14 cues
  const rotCue = cueFrame(c14, "rot", 540, chapter.startFrame);
  const degradesCue = cueFrame(c14, "degrades", 620, chapter.startFrame);

  // Beat 15 cues
  const cachingCue = cueFrame(c15, "caching", 240, chapter.startFrame);
  const slashesCue = cueFrame(c15, "slashes", 660, chapter.startFrame);

  // Beat 16 cues
  const tsCue = cueFrame(c16, "timestamp", 180, chapter.startFrame);
  const reorderCue = cueFrame(c16, "reordering", 380, chapter.startFrame);

  // Beat 17 cues
  const drownsCue = cueFrame(c17, "drowns", 390, chapter.startFrame);
  const truncCue = cueFrame(c17, "truncates", 500, chapter.startFrame);
  const diskCue = cueFrame(c17, "disk", 680, chapter.startFrame);

  // Beat 18 cues
  const manifestCue = cueFrame(c18, "manifest", 360, chapter.startFrame);
  const lazilyCue = cueFrame(c18, "lazily", 610, chapter.startFrame);

  // Beat 19 cues
  const threshCue = cueFrame(c19, "threshold", 180, chapter.startFrame);
  const compactCue = cueFrame(c19, "compaction", 520, chapter.startFrame);
  const checkCue = cueFrame(c19, "checkpoint", 690, chapter.startFrame);

  const w14 = sceneWindow(frame, b14.start, b14.end);
  const w15 = sceneWindow(frame, b15.start, b15.end);
  const w16 = sceneWindow(frame, b16.start, b16.end);
  const w17 = sceneWindow(frame, b17.start, b17.end);
  const w18 = sceneWindow(frame, b18.start, b18.end);
  const w19 = sceneWindow(frame, b19.start, b19.end, { keepAtEnd: true });

  // Beat 14 animated values
  const rotFill = progressBetween(frame, rotCue - 40, rotCue + 36);
  const signalPct = interpolate(progressBetween(frame, degradesCue, degradesCue + 40), [0, 1], [92, 34]);

  // Beat 15 animated values
  const cacheDrop = progressBetween(frame, slashesCue, slashesCue + 44);
  const inputCost = interpolate(cacheDrop, [0, 1], [3.0, 0.35]);

  // Beat 16 cache miss flash
  const cacheHitPct = frame >= reorderCue ? 0 : frame >= tsCue ? 12 : 91;

  // Beat 19 compaction bar
  const preCompact = interpolate(progressBetween(frame, b19.start + 20, threshCue + 20), [0, 1], [35, 82]);
  const postCompact = interpolate(progressBetween(frame, compactCue, compactCue + 32), [0, 1], [82, 15]);
  const contextGauge = frame >= compactCue ? postCompact : preCompact;

  return (
    <Stage chapterIndex="04" chapterTitle={chapter.title} tone="amber" legend={LEGEND}>
      {/* SFX */}
      <Sfx name="thud-low" from={rotCue} volume={0.28} />
      <Sfx name="scale-down" from={degradesCue} volume={0.28} />

      <Sfx name="magnetic-snap" from={cachingCue} volume={0.3} />
      <Sfx name="cash-chime" from={slashesCue} volume={0.28} />

      <Sfx name="glitch-short" from={tsCue} volume={0.28} />
      <Sfx name="error-buzz" from={reorderCue} volume={0.28} />

      <Sfx name="thud-low" from={drownsCue} volume={0.28} />
      <Sfx name="swish" from={truncCue} volume={0.28} />
      <Sfx name="pop-in" from={diskCue} volume={0.28} />

      <Sfx name="slide" from={manifestCue} volume={0.26} />
      <Sfx name="toggle-on" from={lazilyCue} volume={0.26} />

      <Sfx name="riser-short" from={threshCue} volume={0.2} durationInFrames={55} />
      <Sfx name="whoosh-fast" from={compactCue} volume={0.26} />
      <Sfx name="success-ding" from={checkCue} volume={0.28} />

      {/* BEAT 14: Context Is RAM & Context Rot */}
      <SceneBeat window={w14}>
        <SectionTitle
          eyebrow="PILLAR 02 — CONTEXT & CACHING"
          title="Context Is RAM — and Context Rot Is Real"
          subtitle="Reasoning accuracy drops long before you hit the advertised 200K–1M token ceiling."
          tone="amber"
        />

        <Card tone="neutral" padding={30} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: 18, color: TOKENS.colors.textSecondary }}>
              ACTIVE CONTEXT WINDOW (WORKING MEMORY)
            </span>
            <Pill tone={frame >= rotCue ? "rose" : "amber"} size="sm">
              {frame >= rotCue ? "CONTEXT ROT DETECTED" : "FILLING UP"}
            </Pill>
          </div>

          <div
            style={{
              height: 68,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.05)",
              border: `1.5px solid ${TOKENS.colors.border}`,
              display: "flex",
              overflow: "hidden",
              padding: 4,
              gap: 4,
            }}
          >
            <div style={{ width: "16%", backgroundColor: TOKENS.colors.accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TOKENS.fonts.mono, fontSize: 15, fontWeight: 700, color: TOKENS.colors.background }}>
              System + Tools
            </div>
            <div style={{ width: "18%", backgroundColor: TOKENS.colors.accentEmerald, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TOKENS.fonts.mono, fontSize: 15, fontWeight: 700, color: TOKENS.colors.background }}>
              Relevant Code
            </div>
            <div
              style={{
                width: `${Math.round(54 * rotFill)}%`,
                backgroundColor: TOKENS.colors.accentRose,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: TOKENS.fonts.mono,
                fontSize: 16,
                fontWeight: 700,
                color: TOKENS.colors.background,
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              Giant Stack Traces • Stale Reads • Dead Retries
            </div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 26 }}>
          <Card tone={frame >= degradesCue ? "rose" : "emerald"} glow={frame >= degradesCue} padding={28}>
            <MeterBar
              label="Effective Signal-to-Noise Reasoning Quality"
              percent={signalPct}
              valueLabel={`${Math.round(signalPct)}%`}
              tone={frame >= degradesCue ? "rose" : "emerald"}
              height={26}
            />
          </Card>
          <StatCallout
            label="Advertised vs. Usable"
            value="200K+"
            detail="Noise buries signal well before the wall"
            tone="amber"
          />
        </div>
      </SceneBeat>

      {/* BEAT 15: Prompt Caching & Prefix Stability */}
      <SceneBeat window={w15}>
        <SectionTitle
          eyebrow="PILLAR 02 — CACHE ECONOMICS (MANUS & CLAUDE CODE)"
          title="KV Prompt Caching: The Economic Superpower"
          subtitle="Keep the prefix token-identical and append monotonically to reuse cached attention states."
          tone="emerald"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 30, alignItems: "stretch" }}>
          <Card tone="emerald" glow={frame >= cachingCue} padding={28} style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
            <NodeBox
              tag="IMMUTABLE PREFIX • LOCKED"
              title="System Prompt + Tool Schemas"
              subtitle="Token-identical across all 30 turns → KV Cache HIT"
              tone="emerald"
              glow={frame >= cachingCue}
              compact
            />
            <NodeBox
              tag="APPEND-ONLY HISTORY"
              title="Turns 1 → 29 (Cached Prefix Extension)"
              subtitle="Never mutate or delete earlier messages mid-run"
              tone="cyan"
              compact
            />
            <NodeBox
              tag="FRESH SUFFIX"
              title="Turn 30 (New Observation Only)"
              subtitle="Only the newest tokens pay full uncached compute"
              tone="amber"
              compact
            />
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, justifyContent: "center" }}>
            <StatCallout
              label="Effective Input Cost / 1M"
              value={
                <AnimatedNumber
                  from={3.0}
                  to={inputCost}
                  progress={1}
                  decimals={2}
                  prefix="$"
                  tone={frame >= slashesCue ? "emerald" : "amber"}
                  size={52}
                />
              }
              detail="Up to ~90% cheaper cached reads + faster TTFT"
              tone={frame >= slashesCue ? "emerald" : "amber"}
              glow={frame >= slashesCue}
            />
            <StatCallout
              label="Cache Hit Ratio"
              value="91%"
              detail="Primary production metric highlighted by Manus"
              tone="cyan"
            />
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 16: Cache-Busting Anti-Patterns */}
      <SceneBeat window={w16}>
        <SectionTitle
          eyebrow="PILLAR 02 — CACHE-BUSTING BUGS"
          title="Three Subtle Bugs That Silently Wreck Your Bill"
          tone="rose"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div style={slideUpStyle(frame, fps, tsCue - 10, 16)}>
            <CheckRow
              label="Live Timestamp in System Prompt"
              detail="Changing seconds at index 0 invalidates 100% of the KV prefix every turn"
              status="100% CACHE MISS"
              tone="rose"
              icon="✗"
              active={frame >= tsCue}
            />
          </div>
          <div style={slideUpStyle(frame, fps, reorderCue - 10, 16)}>
            <CheckRow
              label="Dynamic Tool Schema Reordering"
              detail="Shuffling or injecting tools mid-loop breaks exact token prefix matching"
              status="PREFIX BUSTED"
              tone="rose"
              icon="✗"
              active={frame >= reorderCue}
            />
          </div>
          <div style={slideUpStyle(frame, fps, reorderCue + 60, 16)}>
            <CheckRow
              label="Mutating Earlier Messages Mid-Loop"
              detail="Invalidates every cached token downstream of the edited turn"
              status="DOWNSTREAM MISS"
              tone="rose"
              icon="✗"
              active={frame >= reorderCue + 60}
            />
          </div>
        </div>

        <Card tone={cacheHitPct > 50 ? "emerald" : "rose"} glow={frame >= tsCue} padding={24}>
          <MeterBar
            label="Live Prompt Cache Hit Rate"
            percent={cacheHitPct}
            valueLabel={cacheHitPct === 0 ? "0% — FULL RECOMPUTE" : `${cacheHitPct}%`}
            tone={cacheHitPct > 50 ? "emerald" : "rose"}
            height={24}
          />
        </Card>
      </SceneBeat>

      {/* BEAT 17: Tool Output Truncation & Offloading to Disk */}
      <SceneBeat window={w17}>
        <SectionTitle
          eyebrow="PILLAR 02 — TOOL OUTPUT HYGIENE (auth.test.ts)"
          title="Truncate Noisy Logs. Offload the Full File to Disk."
          tone="cyan"
        />

        <div style={{ display: "grid", gridTemplateColumns: "0.9fr 90px 0.7fr 90px 1.2fr", alignItems: "center" }}>
          <div style={slideUpStyle(frame, fps, b17.start + 14, 18)}>
            <Card tone="rose" glow={frame >= drownsCue && frame < truncCue} padding={24} style={{ minHeight: 340, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <Pill tone="rose" size="sm">RAW TEST STDOUT</Pill>
                <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 32, fontWeight: 700, marginTop: 12 }}>
                  10,000 Lines
                </div>
                <p style={{ fontSize: 18, color: TOKENS.colors.textSecondary, marginTop: 8 }}>
                  Giant stack traces from auth.test.ts drown the model in noise.
                </p>
              </div>
              <DataChip label="~140,000 TOKENS" tone="rose" style={{ fontSize: 17 }} />
            </Card>
          </div>

          <svg width={90} height={80} viewBox="0 0 90 80">
            <SvgLink x1={6} y1={40} x2={84} y2={40} progress={progressBetween(frame, truncCue - 12, truncCue + 12)} tone="cyan" arrow />
          </svg>

          <NodeBox
            tag="HARNESS"
            title="Output Truncator"
            subtitle="Head + tail filter + temp file dump"
            tone="cyan"
            glow={frame >= truncCue}
          />

          <svg width={90} height={180} viewBox="0 0 90 180">
            <SvgLink x1={6} y1={90} x2={84} y2={48} progress={progressBetween(frame, truncCue, truncCue + 24)} tone="emerald" arrow />
            <SvgLink x1={6} y1={90} x2={84} y2={140} progress={progressBetween(frame, diskCue, diskCue + 24)} tone="cyan" arrow />
          </svg>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={slideUpStyle(frame, fps, truncCue, 16)}>
              <CodePanel
                title="Returned to Context (40 lines)"
                badge="CLEAN SUMMARY"
                tone="emerald"
                lines={TRUNCATED_SUMMARY}
                fontSize={16}
              />
            </div>
            <div style={slideUpStyle(frame, fps, diskCue, 14)}>
              <NodeBox
                tag="OFFLOADED TO DISK"
                title="/tmp/test.log"
                subtitle="Full trace saved — agent runs grep only if needed"
                tone="cyan"
                glow={frame >= diskCue}
                compact
              />
            </div>
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 18: Progressive Disclosure & Lazy Skills */}
      <SceneBeat window={w18}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <SectionTitle
            eyebrow="PILLAR 02 — PROGRESSIVE DISCLOSURE"
            title="Load Skills Lazily Without Busting the Cache"
            tone="cyan"
            style={{ marginBottom: 0 }}
          />
          <Pill tone="emerald" size="md">STATIC PREFIX LOCKED ✓</Pill>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "0.9fr 140px 1.1fr", alignItems: "center" }}>
          <div style={slideUpStyle(frame, fps, b18.start + 14, 18)}>
            <Card tone="cyan" glow={frame >= manifestCue} padding={26}>
              <Pill tone="cyan" size="sm">TURN 1 • STATIC MANIFEST</Pill>
              <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 30, fontWeight: 700, marginTop: 10 }}>
                ~400 Tokens Up Front
              </div>
              <p style={{ fontSize: 19, color: TOKENS.colors.textSecondary, marginTop: 10, lineHeight: 1.45 }}>
                Short skill names and one-line summaries stay frozen in the prefix. Full docs append to the conversation tail only when triggered.
              </p>
              <div style={{ marginTop: 16 }}>
                <DataChip label="Appended to Tail → Cache Preserved" tone="emerald" style={{ fontSize: 15 }} />
              </div>
            </Card>
          </div>

          <svg width={140} height={360} viewBox="0 0 140 360" style={{ overflow: "visible" }}>
            <SvgLink x1={8} y1={180} x2={132} y2={48} progress={progressBetween(frame, lazilyCue, lazilyCue + 24)} tone="emerald" arrow strokeWidth={3} />
            <SvgLink x1={8} y1={180} x2={132} y2={138} progress={progressBetween(frame, manifestCue, manifestCue + 24)} tone="neutral" dashed opacity={0.35} />
            <SvgLink x1={8} y1={180} x2={132} y2={228} progress={progressBetween(frame, manifestCue, manifestCue + 24)} tone="neutral" dashed opacity={0.35} />
            <SvgLink x1={8} y1={180} x2={132} y2={318} progress={progressBetween(frame, manifestCue, manifestCue + 24)} tone="neutral" dashed opacity={0.35} />
            <SvgPacket x1={8} y1={180} x2={132} y2={48} progress={progressBetween(frame, lazilyCue + 6, lazilyCue + 40)} tone="emerald" label="SKILL.md" />
          </svg>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {SKILLS.map((s) => {
              const active = s.active && frame >= lazilyCue;
              return (
                <NodeBox
                  key={s.title}
                  tag={active ? "LOADED ON DEMAND" : "DORMANT (0 TOKENS)"}
                  title={s.title}
                  subtitle={s.sub}
                  tone={active ? "emerald" : "neutral"}
                  glow={active}
                  dim={!active}
                  compact
                />
              );
            })}
          </div>
        </div>
      </SceneBeat>

      {/* BEAT 19: Structured Compaction vs Naive Trimming */}
      <SceneBeat window={w19}>
        <SectionTitle
          eyebrow="PILLAR 02 — LONG-SESSION HYGIENE"
          title="Structured Compaction Beats Naive FIFO Trimming"
          subtitle="Trigger rarely near 75–85% to pay one clean cache reset instead of breaking tool_call_id pairs."
          tone="cyan"
        />

        <Card tone={contextGauge > 70 ? "amber" : "emerald"} glow padding={24} style={{ marginBottom: 24 }}>
          <MeterBar
            label="Session Context Utilization"
            percent={contextGauge}
            valueLabel={frame >= compactCue ? `${Math.round(contextGauge)}% — COMPACTED` : `${Math.round(contextGauge)}% — THRESHOLD`}
            tone={contextGauge > 70 ? "amber" : "emerald"}
            height={26}
          />
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 28 }}>
          <Card tone="rose" padding={24} style={{ opacity: fadeIn(frame, b19.start + 15, 16) }}>
            <Pill tone="rose" size="sm">✗ NAIVE FRONT-TRIMMING</Pill>
            <div style={{ fontFamily: TOKENS.fonts.display, fontSize: 26, fontWeight: 700, marginTop: 10 }}>
              Slices Off Oldest Messages
            </div>
            <p style={{ fontSize: 19, color: TOKENS.colors.textSecondary, marginTop: 8, lineHeight: 1.45 }}>
              Orphans tool_call_id / tool_result pairs and silently erases the user&apos;s original goal.
            </p>
          </Card>

          <div style={slideUpStyle(frame, fps, compactCue - 8, 18)}>
            <Card tone="emerald" glow={frame >= checkCue} padding={24}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <Pill tone="emerald" size="sm">✓ STRUCTURED COMPACTION CHECKPOINT</Pill>
                <span style={{ fontFamily: TOKENS.fonts.mono, fontSize: 15, color: TOKENS.colors.accentEmerald }}>
                  ONE CLEAN RESET
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <DataChip label="Goal & Constraints" sublabel="Preserved verbatim" tone="cyan" style={{ fontSize: 16 }} />
                <DataChip label="Modified Files" sublabel="auth.ts, auth.test.ts" tone="emerald" style={{ fontSize: 16 }} />
                <DataChip label="Verified Facts" sublabel="Repro race confirmed" tone="emerald" style={{ fontSize: 16 }} />
                <DataChip label="Exact Next Step" sublabel="Add mutex + re-run" tone="amber" style={{ fontSize: 16 }} />
              </div>
            </Card>
          </div>
        </div>
      </SceneBeat>
    </Stage>
  );
};
