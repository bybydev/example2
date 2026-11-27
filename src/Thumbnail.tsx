import React from "react";
import { AbsoluteFill } from "remotion";
import { timeline } from "./lib/timeline";
import { TOKENS, TONE_STYLES } from "./theme/tokens";

/**
 * Starter 1080x1920 vertical Shorts cover still (`<Still id="Thumbnail" />`).
 * Treat this as a blank starting point — design a bespoke cover visual for each Short
 * while keeping focal elements centered for both 9:16 shelves and square/3:4 feed crops.
 */
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
      {/* Dual-tone vertical radial lighting + subtle technical grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            radial-gradient(circle at 22% 18%, rgba(56, 189, 248, 0.30), transparent 46%),
            radial-gradient(circle at 80% 76%, rgba(245, 158, 11, 0.30), transparent 50%),
            radial-gradient(circle at 75% 28%, rgba(251, 113, 133, 0.18), transparent 42%),
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 54px 54px, 54px 54px",
        }}
      />

      {/* Center-weighted 1080x1920 layout safe for 9:16 shelves and 3:4 / square crops */}
      <AbsoluteFill
        style={{
          padding: "260px 84px 360px 84px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 56,
        }}
      >
        {/* High-contrast 3-5 word headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: TOKENS.fonts.display,
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              textShadow: "0 14px 40px rgba(0, 0, 0, 0.58)",
            }}
          >
            {timeline.title}
          </div>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontFamily: TOKENS.fonts.mono,
              fontSize: 28,
              fontWeight: 700,
              color: TOKENS.colors.textSecondary,
            }}
          >
            <span style={{ color: TOKENS.colors.accent }}>CONCEPT A</span>
            <span>vs.</span>
            <span style={{ color: TOKENS.colors.accentWarm }}>CONCEPT B</span>
          </div>
        </div>

        {/* Stacked focal comparison cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              backgroundColor: TOKENS.colors.surface,
              border: `2.5px solid ${TOKENS.colors.accent}`,
              borderRadius: 28,
              padding: "30px 32px",
              boxShadow: `0 0 40px ${TOKENS.colors.accentGlow}, 0 22px 44px rgba(0, 0, 0, 0.45)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 28,
                  fontWeight: 800,
                  color: TOKENS.colors.accent,
                }}
              >
                METRIC A
              </span>
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 60,
                  fontWeight: 900,
                  color: TOKENS.colors.textPrimary,
                }}
              >
                1×
              </span>
            </div>
            <div
              style={{
                height: 26,
                borderRadius: 999,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "82%",
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: TOKENS.colors.accent,
                  boxShadow: `0 0 20px ${TOKENS.colors.accentGlow}`,
                }}
              />
            </div>
          </div>

          <div
            style={{
              backgroundColor: TOKENS.colors.surface,
              border: `3px solid ${TOKENS.colors.accentRose}`,
              borderRadius: 28,
              padding: "30px 32px",
              boxShadow: `0 0 48px ${TOKENS.colors.accentRoseGlow}, 0 26px 48px rgba(0, 0, 0, 0.5)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 28,
                  fontWeight: 800,
                  color: TOKENS.colors.accentWarm,
                }}
              >
                METRIC B
              </span>
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 64,
                  fontWeight: 900,
                  color: TOKENS.colors.accentWarm,
                }}
              >
                5×
              </span>
            </div>
            <div
              style={{
                height: 26,
                borderRadius: 999,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
                marginBottom: 22,
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
                padding: "12px 18px",
                borderRadius: 14,
                backgroundColor: TONE_STYLES.rose.bg,
                border: `2px solid ${TOKENS.colors.accentRose}`,
                textAlign: "center",
                fontFamily: TOKENS.fonts.mono,
                fontSize: 24,
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
