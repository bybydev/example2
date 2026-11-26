import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { TOKENS, TONE_STYLES } from "../theme/tokens";
import type { SemanticTone } from "../theme/tokens";
import type { SceneWindowState } from "./motion";

export const SceneBeat: React.FC<{
  window: SceneWindowState;
  children: React.ReactNode;
  align?: "stretch" | "center";
  style?: React.CSSProperties;
}> = ({ window, children, align = "stretch", style }) => {
  if (!window.visible) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        opacity: window.opacity,
        transform: `translateY(${window.translateY}px)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: align,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const Pill: React.FC<{
  children: React.ReactNode;
  tone?: SemanticTone;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}> = ({ children, tone = "cyan", size = "md", style }) => {
  const t = TONE_STYLES[tone];
  const pad =
    size === "sm" ? "5px 12px" : size === "lg" ? "10px 22px" : "7px 16px";
  const fontSize = size === "sm" ? 16 : size === "lg" ? 24 : 19;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: pad,
        borderRadius: 999,
        backgroundColor: t.bg,
        border: `1px solid ${t.border}`,
        color: t.main,
        fontFamily: TOKENS.fonts.mono,
        fontSize,
        fontWeight: 700,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  tone?: SemanticTone;
  glow?: boolean;
  padding?: number;
  style?: React.CSSProperties;
}> = ({ children, tone = "neutral", glow = false, padding = 32, style }) => {
  const t = TONE_STYLES[tone];
  return (
    <div
      style={{
        backgroundColor: TOKENS.colors.surface,
        border: `1.5px solid ${tone === "neutral" ? TOKENS.colors.border : t.border}`,
        borderRadius: 24,
        padding,
        boxShadow: glow
          ? `0 0 42px ${t.glow}, 0 20px 44px rgba(0, 0, 0, 0.35)`
          : "0 18px 40px rgba(0, 0, 0, 0.3)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const SectionTitle: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: SemanticTone;
  align?: "left" | "center";
  style?: React.CSSProperties;
}> = ({ eyebrow, title, subtitle, tone = "cyan", align = "left", style }) => {
  const t = TONE_STYLES[tone];
  return (
    <div
      style={{
        textAlign: align,
        marginBottom: 28,
        ...style,
      }}
    >
      {eyebrow ? (
        <div
          style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: t.main,
            marginBottom: 10,
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <h2
        style={{
          margin: 0,
          fontFamily: TOKENS.fonts.display,
          fontSize: 54,
          fontWeight: 700,
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          color: TOKENS.colors.textPrimary,
        }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 26,
            lineHeight: 1.4,
            color: TOKENS.colors.textSecondary,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};

export const DataChip: React.FC<{
  label: string;
  sublabel?: string;
  tone?: SemanticTone;
  dim?: boolean;
  style?: React.CSSProperties;
}> = ({ label, sublabel, tone = "cyan", dim = false, style }) => {
  const t = TONE_STYLES[tone];
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 18px",
        borderRadius: 14,
        backgroundColor: dim ? "rgba(255,255,255,0.03)" : t.bg,
        border: `1.5px solid ${dim ? "rgba(255,255,255,0.08)" : t.border}`,
        color: dim ? TOKENS.colors.textMuted : t.main,
        fontFamily: TOKENS.fonts.mono,
        fontSize: 22,
        fontWeight: 700,
        opacity: dim ? 0.55 : 1,
        ...style,
      }}
    >
      <span>{label}</span>
      {sublabel ? (
        <span
          style={{
            fontSize: 13,
            color: TOKENS.colors.textSecondary,
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          {sublabel}
        </span>
      ) : null}
    </div>
  );
};

export const MeterBar: React.FC<{
  label: string;
  percent: number;
  tone: SemanticTone;
  valueLabel?: string;
  height?: number;
}> = ({ label, percent, tone, valueLabel, height = 28 }) => {
  const t = TONE_STYLES[tone];
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: TOKENS.colors.textSecondary,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: TOKENS.fonts.mono,
            fontSize: 28,
            fontWeight: 800,
            color: t.main,
          }}
        >
          {valueLabel ?? `${Math.round(clamped)}%`}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height,
          borderRadius: 999,
          backgroundColor: "rgba(255, 255, 255, 0.07)",
          border: `1px solid ${TOKENS.colors.border}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${t.main}, ${t.main})`,
            boxShadow: `0 0 18px ${t.glow}`,
          }}
        />
      </div>
    </div>
  );
};

export const AnimatedNumber: React.FC<{
  to: number;
  from?: number;
  progress?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  tone?: SemanticTone;
  size?: number;
  style?: React.CSSProperties;
}> = ({
  to,
  from = 0,
  progress = 1,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "en-US",
  tone = "cyan",
  size = 56,
  style,
}) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const current = interpolate(clamped, [0, 1], [from, to]);
  const formatted = current.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span
      style={{
        fontFamily: TOKENS.fonts.mono,
        fontVariantNumeric: "tabular-nums",
        fontSize: size,
        fontWeight: 800,
        lineHeight: 1.05,
        letterSpacing: "-0.03em",
        color: TONE_STYLES[tone].main,
        ...style,
      }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export const StatCallout: React.FC<{
  label: string;
  value: React.ReactNode;
  detail?: string;
  tone?: SemanticTone;
  glow?: boolean;
  style?: React.CSSProperties;
}> = ({ label, value, detail, tone = "cyan", glow = false, style }) => {
  const t = TONE_STYLES[tone];
  return (
    <div
      style={{
        backgroundColor: TOKENS.colors.surface,
        border: `1.5px solid ${tone === "neutral" ? TOKENS.colors.border : t.border}`,
        borderRadius: 20,
        padding: "22px 26px",
        boxShadow: glow
          ? `0 0 36px ${t.glow}, 0 18px 36px rgba(0, 0, 0, 0.35)`
          : "0 14px 32px rgba(0, 0, 0, 0.28)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: TOKENS.fonts.mono,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TOKENS.colors.textSecondary,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: TOKENS.fonts.mono,
          fontVariantNumeric: "tabular-nums",
          fontSize: 52,
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: t.main,
        }}
      >
        {value}
      </div>
      {detail ? (
        <div
          style={{
            fontSize: 18,
            lineHeight: 1.35,
            color: TOKENS.colors.textSecondary,
          }}
        >
          {detail}
        </div>
      ) : null}
    </div>
  );
};
