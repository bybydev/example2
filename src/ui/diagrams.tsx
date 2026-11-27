import React from "react";
import { interpolate } from "remotion";
import { TOKENS, TONE_STYLES } from "../theme/tokens";
import type { SemanticTone } from "../theme/tokens";

export type CodeLine = {
  text: string;
  tone?: SemanticTone;
  highlight?: boolean;
};

export const NodeBox: React.FC<{
  title: string;
  subtitle?: string;
  tag?: string;
  tone?: SemanticTone;
  glow?: boolean;
  dim?: boolean;
  compact?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  title,
  subtitle,
  tag,
  tone = "cyan",
  glow = false,
  dim = false,
  compact = false,
  style,
  children,
}) => {
  const t = TONE_STYLES[tone];
  return (
    <div
      style={{
        backgroundColor: dim ? "rgba(20, 27, 48, 0.55)" : TOKENS.colors.surface,
        border: `1.5px solid ${dim ? "rgba(255, 255, 255, 0.08)" : t.border}`,
        borderRadius: compact ? 16 : 20,
        padding: compact ? "14px 18px" : "20px 24px",
        boxShadow:
          glow && !dim
            ? `0 0 32px ${t.glow}, 0 14px 32px rgba(0, 0, 0, 0.35)`
            : "0 12px 28px rgba(0, 0, 0, 0.28)",
        opacity: dim ? 0.45 : 1,
        ...style,
      }}
    >
      {tag ? (
        <div
          style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: compact ? 12 : 14,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: dim ? TOKENS.colors.textMuted : t.main,
            marginBottom: compact ? 4 : 6,
          }}
        >
          {tag}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: TOKENS.fonts.display,
          fontSize: compact ? 21 : 26,
          fontWeight: 700,
          lineHeight: 1.2,
          color: dim ? TOKENS.colors.textSecondary : TOKENS.colors.textPrimary,
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            marginTop: compact ? 4 : 6,
            fontSize: compact ? 15 : 18,
            lineHeight: 1.35,
            color: TOKENS.colors.textSecondary,
          }}
        >
          {subtitle}
        </div>
      ) : null}
      {children}
    </div>
  );
};

export const CodePanel: React.FC<{
  title: string;
  badge?: string;
  tone?: SemanticTone;
  lines: CodeLine[];
  revealProgress?: number;
  fontSize?: number;
  style?: React.CSSProperties;
}> = ({
  title,
  badge,
  tone = "cyan",
  lines,
  revealProgress = 1,
  fontSize = 21,
  style,
}) => {
  const t = TONE_STYLES[tone];
  const clamped = Math.max(0, Math.min(1, revealProgress));
  const visibleCount = Math.ceil(clamped * lines.length);

  return (
    <div
      style={{
        backgroundColor: TOKENS.colors.surfaceMuted,
        border: `1.5px solid ${t.border}`,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: `0 0 28px ${t.glow}, 0 16px 36px rgba(0, 0, 0, 0.4)`,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          borderBottom: `1px solid ${TOKENS.colors.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "flex", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: TOKENS.colors.accentRose,
                opacity: 0.75,
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: TOKENS.colors.accentWarm,
                opacity: 0.75,
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: TOKENS.colors.accentEmerald,
                opacity: 0.75,
              }}
            />
          </span>
          <span
            style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: 15,
              fontWeight: 700,
              color: TOKENS.colors.textSecondary,
              letterSpacing: "0.04em",
            }}
          >
            {title}
          </span>
        </div>
        {badge ? (
          <span
            style={{
              fontFamily: TOKENS.fonts.mono,
              fontSize: 13,
              fontWeight: 700,
              color: t.main,
              backgroundColor: t.bg,
              border: `1px solid ${t.border}`,
              padding: "3px 10px",
              borderRadius: 999,
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <div
        style={{
          padding: "16px 20px",
          fontFamily: TOKENS.fonts.mono,
          fontSize,
          lineHeight: 1.55,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {lines.map((line, index) => {
          const shown = index < visibleCount;
          const lineTone = line.tone ? TONE_STYLES[line.tone] : null;
          return (
            <div
              key={`${index}-${line.text}`}
              style={{
                opacity: shown ? 1 : 0.12,
                padding: line.highlight ? "2px 10px" : "2px 4px",
                marginLeft: line.highlight ? -6 : 0,
                borderRadius: 8,
                backgroundColor:
                  line.highlight && lineTone ? lineTone.bg : "transparent",
                borderLeft:
                  line.highlight && lineTone
                    ? `3px solid ${lineTone.main}`
                    : "3px solid transparent",
                color: lineTone ? lineTone.main : TOKENS.colors.textPrimary,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CheckRow: React.FC<{
  label: string;
  detail?: string;
  status: string;
  tone?: SemanticTone;
  active?: boolean;
  icon?: string;
  style?: React.CSSProperties;
}> = ({
  label,
  detail,
  status,
  tone = "emerald",
  active = true,
  icon = "✓",
  style,
}) => {
  const t = TONE_STYLES[tone];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 18px",
        borderRadius: 14,
        backgroundColor: active ? t.bg : "rgba(255, 255, 255, 0.03)",
        border: `1.5px solid ${active ? t.border : TOKENS.colors.border}`,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: TOKENS.fonts.mono,
            fontSize: 17,
            fontWeight: 800,
            backgroundColor: active ? t.main : "rgba(255, 255, 255, 0.08)",
            color: active ? TOKENS.colors.background : TOKENS.colors.textMuted,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.25,
              color: TOKENS.colors.textPrimary,
            }}
          >
            {label}
          </div>
          {detail ? (
            <div
              style={{
                fontSize: 15,
                color: TOKENS.colors.textSecondary,
                marginTop: 2,
              }}
            >
              {detail}
            </div>
          ) : null}
        </div>
      </div>

      <span
        style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: 14,
          fontWeight: 700,
          padding: "5px 12px",
          borderRadius: 999,
          backgroundColor: active ? "rgba(11, 16, 32, 0.65)" : "transparent",
          border: `1px solid ${active ? t.border : TOKENS.colors.border}`,
          color: active ? t.main : TOKENS.colors.textMuted,
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </span>
    </div>
  );
};

export const SvgLink: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress?: number;
  tone?: SemanticTone;
  strokeWidth?: number;
  dashed?: boolean;
  arrow?: boolean;
  opacity?: number;
}> = ({
  x1,
  y1,
  x2,
  y2,
  progress = 1,
  tone = "cyan",
  strokeWidth = 2.5,
  dashed = false,
  arrow = false,
  opacity = 1,
}) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);

  if (clamped <= 0 || len < 1) {
    return null;
  }

  const t = TONE_STYLES[tone];
  const tx = x1 + dx * clamped;
  const ty = y1 + dy * clamped;
  const ux = dx / len;
  const uy = dy / len;
  const drawnLen = len * clamped;
  const headLen = 12;
  const headHalfW = 5.5;
  const showArrow = arrow && drawnLen > headLen;
  const lineEndX = showArrow ? tx - ux * (headLen - 2) : tx;
  const lineEndY = showArrow ? ty - uy * (headLen - 2) : ty;
  const px = -uy;
  const py = ux;

  const arrowPoints = showArrow
    ? [
        `${tx},${ty}`,
        `${tx - ux * headLen + px * headHalfW},${ty - uy * headLen + py * headHalfW}`,
        `${tx - ux * headLen - px * headHalfW},${ty - uy * headLen - py * headHalfW}`,
      ].join(" ")
    : "";

  return (
    <g opacity={opacity}>
      <line
        x1={x1}
        y1={y1}
        x2={lineEndX}
        y2={lineEndY}
        stroke={t.main}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashed ? "8 7" : undefined}
      />
      {showArrow ? <polygon points={arrowPoints} fill={t.main} /> : null}
    </g>
  );
};

export const SvgPacket: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  tone?: SemanticTone;
  radius?: number;
  label?: string;
}> = ({ x1, y1, x2, y2, progress, tone = "cyan", radius = 9, label }) => {
  if (progress <= 0 || progress >= 1) {
    return null;
  }
  const t = TONE_STYLES[tone];
  const cx = interpolate(progress, [0, 1], [x1, x2]);
  const cy = interpolate(progress, [0, 1], [y1, y2]);

  return (
    <g>
      <circle cx={cx} cy={cy} r={radius * 2.1} fill={t.glow} />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={t.main}
        stroke={TOKENS.colors.textPrimary}
        strokeWidth={2}
      />
      {label ? (
        <text
          x={cx}
          y={cy - radius - 10}
          textAnchor="middle"
          fill={t.main}
          fontFamily={TOKENS.fonts.mono}
          fontSize={14}
          fontWeight={700}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

export type VerticalFlowBranch = {
  /** Target x coordinate (in viewBox coordinates, default width 800). */
  toX: number;
  tone?: SemanticTone;
  linkProgress?: number;
  packetProgress?: number;
  packetLabel?: string;
  dashed?: boolean;
};

/** Top-to-bottom animated SVG connector for vertical 9:16 flow diagrams. */
export const VerticalFlowConnector: React.FC<{
  height?: number;
  width?: number;
  fromX?: number;
  branches: VerticalFlowBranch[];
}> = ({ height = 104, width = 860, fromX = width / 2, branches }) => {
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "visible" }}
    >
      {branches.map((branch, index) => (
        <React.Fragment key={`${branch.toX}-${index}`}>
          <SvgLink
            x1={fromX}
            y1={6}
            x2={branch.toX}
            y2={height - 6}
            progress={branch.linkProgress ?? 1}
            tone={branch.tone ?? "cyan"}
            dashed={branch.dashed}
            arrow
          />
          {branch.packetProgress !== undefined ? (
            <SvgPacket
              x1={fromX}
              y1={6}
              x2={branch.toX}
              y2={height - 6}
              progress={branch.packetProgress}
              tone={branch.tone ?? "cyan"}
              label={branch.packetLabel}
            />
          ) : null}
        </React.Fragment>
      ))}
    </svg>
  );
};
