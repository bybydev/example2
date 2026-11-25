import React from "react";
import { AbsoluteFill } from "remotion";
import { TOKENS, TONE_STYLES } from "../theme/tokens";
import type { SemanticTone } from "../theme/tokens";

export type StageLegendItem = {
  label: string;
  tone: SemanticTone;
};

export const Stage: React.FC<{
  children: React.ReactNode;
  chapterIndex?: string;
  chapterTitle?: string;
  tone?: SemanticTone;
  showHeader?: boolean;
  legend?: StageLegendItem[];
  headerRight?: React.ReactNode;
}> = ({
  children,
  chapterIndex,
  chapterTitle,
  tone = "cyan",
  showHeader = true,
  legend,
  headerRight,
}) => {
  const toneStyle = TONE_STYLES[tone];
  const hasHeader = showHeader && Boolean(chapterIndex || chapterTitle || legend?.length || headerRight);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.colors.background,
        color: TOKENS.colors.textPrimary,
        fontFamily: TOKENS.fonts.sans,
        overflow: "hidden",
      }}
    >
      {/* Subtle engineering dot/grid backdrop */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            radial-gradient(circle at 18% 15%, ${toneStyle.glow}, transparent 42%),
            radial-gradient(circle at 84% 82%, rgba(245, 158, 11, 0.08), transparent 44%),
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 64px 64px, 64px 64px",
        }}
      />

      {/* Safe-margin content container */}
      <AbsoluteFill
        style={{
          padding: `${TOKENS.layout.safeMarginY}px ${TOKENS.layout.safeMarginX}px`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {hasHeader ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
              minHeight: 42,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {chapterIndex ? (
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 18,
                    fontWeight: 700,
                    color: toneStyle.main,
                    backgroundColor: toneStyle.bg,
                    border: `1px solid ${toneStyle.border}`,
                    padding: "6px 14px",
                    borderRadius: 999,
                    letterSpacing: "0.08em",
                  }}
                >
                  {chapterIndex}
                </span>
              ) : null}
              {chapterTitle ? (
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: TOKENS.colors.textSecondary,
                  }}
                >
                  {chapterTitle}
                </span>
              ) : null}
            </div>

            {headerRight ? (
              headerRight
            ) : legend && legend.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 15,
                  color: TOKENS.colors.textMuted,
                }}
              >
                {legend.map((item) => (
                  <span
                    key={`${item.tone}-${item.label}`}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: TONE_STYLES[item.tone].main,
                      }}
                    />
                    {item.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
