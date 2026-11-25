export const TOKENS = {
  colors: {
    background: "#0B1020",
    surface: "#141B30",
    surfaceElevated: "#1B2541",
    surfaceMuted: "#0F162B",
    border: "rgba(255, 255, 255, 0.12)",
    borderStrong: "rgba(255, 255, 255, 0.22)",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    accent: "#38BDF8",
    accentWarm: "#F59E0B",
    accentEmerald: "#34D399",
    accentRose: "#FB7185",
    accentGlow: "rgba(56, 189, 248, 0.22)",
    accentWarmGlow: "rgba(245, 158, 11, 0.22)",
    accentEmeraldGlow: "rgba(52, 211, 153, 0.22)",
    accentRoseGlow: "rgba(251, 113, 133, 0.24)",
  },
  fonts: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  layout: {
    safeMarginX: 120,
    safeMarginY: 80,
  },
} as const;

export type SemanticTone = "cyan" | "amber" | "emerald" | "rose" | "neutral";

export const TONE_STYLES: Record<
  SemanticTone,
  { main: string; bg: string; border: string; glow: string }
> = {
  cyan: {
    main: TOKENS.colors.accent,
    bg: "rgba(56, 189, 248, 0.12)",
    border: "rgba(56, 189, 248, 0.45)",
    glow: TOKENS.colors.accentGlow,
  },
  amber: {
    main: TOKENS.colors.accentWarm,
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.45)",
    glow: TOKENS.colors.accentWarmGlow,
  },
  emerald: {
    main: TOKENS.colors.accentEmerald,
    bg: "rgba(52, 211, 153, 0.12)",
    border: "rgba(52, 211, 153, 0.45)",
    glow: TOKENS.colors.accentEmeraldGlow,
  },
  rose: {
    main: TOKENS.colors.accentRose,
    bg: "rgba(251, 113, 133, 0.14)",
    border: "rgba(251, 113, 133, 0.5)",
    glow: TOKENS.colors.accentRoseGlow,
  },
  neutral: {
    main: TOKENS.colors.textPrimary,
    bg: TOKENS.colors.surface,
    border: TOKENS.colors.border,
    glow: "rgba(148, 163, 184, 0.14)",
  },
};
