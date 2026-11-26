import React from "react";
import { AbsoluteFill } from "remotion";
import { timeline } from "./lib/timeline";
import { TOKENS, TONE_STYLES } from "./theme/tokens";

export const Thumbnail: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.colors.background,
        color: TOKENS.colors.textPrimary,
        fontFamily: TOKENS.fonts.sans,
        overflow: "hidden",
      }}
    >
      {/* Dual-tone radial lighting + subtle technical grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            radial-gradient(circle at 14% 20%, rgba(56, 189, 248, 0.28), transparent 46%),
            radial-gradient(circle at 86% 74%, rgba(245, 158, 11, 0.30), transparent 50%),
            radial-gradient(circle at 74% 22%, rgba(251, 113, 133, 0.18), transparent 42%),
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 48px 48px, 48px 48px",
        }}
      />

      {/* Safe-padded 1280x720 layout (keeps bottom-right clear for YouTube duration badge) */}
      <AbsoluteFill
        style={{
          padding: "54px 62px 62px 62px",
          display: "grid",
          gridTemplateColumns: "1.12fr 0.88fr",
          gap: 44,
          alignItems: "center",
        }}
      >
        {/* Left: High-contrast headline (keep to 3–5 large words for mobile readability) */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 10,
              padding: "9px 20px",
              borderRadius: 999,
              backgroundColor: TONE_STYLES.cyan.bg,
              border: `2px solid ${TONE_STYLES.cyan.border}`,
              color: TOKENS.colors.accent,
              fontFamily: TOKENS.fonts.mono,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.08em",
              marginBottom: 24,
            }}
          >
            DEEP DIVE
          </div>

          <div
            style={{
              fontFamily: TOKENS.fonts.display,
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              textShadow: "0 12px 36px rgba(0, 0, 0, 0.55)",
            }}
          >
            {timeline.title}
          </div>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: TOKENS.fonts.mono,
              fontSize: 24,
              fontWeight: 700,
              color: TOKENS.colors.textSecondary,
            }}
          >
            <span style={{ color: TOKENS.colors.accent }}>CONCEPT A</span>
            <span>vs.</span>
            <span style={{ color: TOKENS.colors.accentWarm }}>CONCEPT B</span>
          </div>
        </div>

        {/* Right: Focal comparison cards (marginBottom reserves YouTube's bottom-right timestamp zone) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              backgroundColor: TOKENS.colors.surface,
              border: `2.5px solid ${TOKENS.colors.accent}`,
              borderRadius: 24,
              padding: "26px 28px",
              boxShadow: `0 0 36px ${TOKENS.colors.accentGlow}, 0 20px 40px rgba(0,0,0,0.45)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 24,
                  fontWeight: 800,
                  color: TOKENS.colors.accent,
                }}
              >
                METRIC A
              </span>
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 48,
                  fontWeight: 900,
                  color: TOKENS.colors.textPrimary,
                }}
              >
                1×
              </span>
            </div>
            <div
              style={{
                height: 22,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "82%",
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: TOKENS.colors.accent,
                  boxShadow: `0 0 18px ${TOKENS.colors.accentGlow}`,
                }}
              />
            </div>
          </div>

          <div
            style={{
              backgroundColor: TOKENS.colors.surface,
              border: `3px solid ${TOKENS.colors.accentRose}`,
              borderRadius: 24,
              padding: "26px 28px",
              boxShadow: `0 0 44px ${TOKENS.colors.accentRoseGlow}, 0 24px 44px rgba(0,0,0,0.5)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 24,
                  fontWeight: 800,
                  color: TOKENS.colors.accentWarm,
                }}
              >
                METRIC B
              </span>
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 52,
                  fontWeight: 900,
                  color: TOKENS.colors.accentWarm,
                }}
              >
                5×
              </span>
            </div>
            <div
              style={{
                height: 22,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.08)",
                overflow: "hidden",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: "18%",
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: TOKENS.colors.accentWarm,
                }}
              />
            </div>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                backgroundColor: TONE_STYLES.rose.bg,
                border: `2px solid ${TOKENS.colors.accentRose}`,
                textAlign: "center",
                fontFamily: TOKENS.fonts.mono,
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: "0.06em",
                color: TOKENS.colors.accentRose,
              }}
            >
              KEY BOTTLENECK
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
