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
  /** Header is hidden by default for Shorts — opt in only when a scene genuinely needs a label. */
  showHeader?: boolean;
  /** Reserves space above YouTube Shorts' bottom overlay for burned-in CaptionsOverlay. */
  reserveCaptions?: boolean;
  /** Uses symmetric horizontal margins instead of reserving the right-hand YouTube Shorts action rail. */
  fullWidth?: boolean;
  legend?: StageLegendItem[];
  headerRight?: React.ReactNode;
}> = ({
  children,
  chapterIndex,
  chapterTitle,
  tone = "cyan",
  showHeader = false,
  reserveCaptions = true,
  fullWidth = false,
  legend,
  headerRight,
}) => {
  const toneStyle = TONE_STYLES[tone];
  const hasHeader =
    showHeader &&
    Boolean(chapterIndex || chapterTitle || legend?.length || headerRight);

  const paddingTop = TOKENS.layout.safeTop;
  const paddingBottom =
    TOKENS.layout.safeBottom +
    (reserveCaptions ? TOKENS.layout.captionReserve : 0);
  const paddingLeft = TOKENS.layout.safeLeft;
  const paddingRight = fullWidth
    ? TOKENS.layout.safeLeft
    : TOKENS.layout.safeRight;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.colors.background,
        color: TOKENS.colors.textPrimary,
        fontFamily: TOKENS.fonts.sans,
        overflow: "hidden",
      }}
    >
      {/* Subtle vertical dual-tone glow + engineering grid backdrop */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            radial-gradient(circle at 24% 16%, ${toneStyle.glow}, transparent 44%),
            radial-gradient(circle at 78% 76%, rgba(245, 158, 11, 0.09), transparent 46%),
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 64px 64px, 64px 64px",
        }}
      />

      {/* Shorts safe-zone content container */}
      <AbsoluteFill
        style={{
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
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
              gap: 12,
              marginBottom: 20,
              minHeight: 38,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {chapterIndex ? (
                <span
                  style={{
                    fontFamily: TOKENS.fonts.mono,
                    fontSize: 18,
                    fontWeight: 700,
                    color: toneStyle.main,
                    backgroundColor: toneStyle.bg,
                    border: `1px solid ${toneStyle.border}`,
                    padding: "5px 13px",
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
                    fontFamily: TOKENS.fonts.display,
                    fontSize: 21,
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
                  flexWrap: "wrap",
                  gap: 12,
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 14,
                  color: TOKENS.colors.textMuted,
                }}
              >
                {legend.map((item) => (
                  <span
                    key={`${item.tone}-${item.label}`}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
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
