import React from "react";
import { AbsoluteFill } from "remotion";
import { TOKENS, TONE_STYLES } from "./theme/tokens";

const HARNESS_MODULES = [
  { label: "LOOP & TOOLS", tone: "cyan" as const },
  { label: "KV CONTEXT", tone: "amber" as const },
  { label: "SANDBOX", tone: "emerald" as const },
  { label: "VERIFIERS", tone: "emerald" as const },
];

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
      {/* Dual-tone radial lighting + technical grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            radial-gradient(circle at 16% 22%, rgba(56, 189, 248, 0.30), transparent 48%),
            radial-gradient(circle at 82% 30%, rgba(245, 158, 11, 0.28), transparent 46%),
            radial-gradient(circle at 72% 72%, rgba(52, 211, 153, 0.20), transparent 44%),
            linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 48px 48px, 48px 48px",
        }}
      />

      {/* Safe-padded 1280x720 layout (bottom-right kept completely clear for YouTube duration badge) */}
      <AbsoluteFill
        style={{
          padding: "50px 58px 56px 58px",
          display: "grid",
          gridTemplateColumns: "1.08fr 0.92fr",
          gap: 44,
          alignItems: "center",
        }}
      >
        {/* Left: Bold 4-word headline readable at mobile thumbnail sizes */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              padding: "10px 22px",
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
            SYSTEMS DEEP DIVE
          </div>

          <div
            style={{
              fontFamily: TOKENS.fonts.display,
              fontSize: 94,
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
              textShadow: "0 14px 40px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div>AI AGENT</div>
            <div style={{ color: TOKENS.colors.accent }}>HARNESSES</div>
            <div>EXPLAINED</div>
          </div>

          <div
            style={{
              marginTop: 30,
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              fontFamily: TOKENS.fonts.mono,
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ color: TOKENS.colors.accentWarm }}>MODEL</span>
            <span style={{ color: TOKENS.colors.textSecondary }}>+</span>
            <span style={{ color: TOKENS.colors.accent }}>HARNESS</span>
            <span style={{ color: TOKENS.colors.textSecondary }}>=</span>
            <span style={{ color: TOKENS.colors.accentEmerald }}>AGENT</span>
          </div>
        </div>

        {/* Right: High-contrast OS-layer diagram (lifted via marginBottom: 72 so bottom-right timestamp is clear) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 16,
            marginBottom: 72,
          }}
        >
          {/* Top Core: LLM = CPU */}
          <div
            style={{
              backgroundColor: TOKENS.colors.surface,
              border: `3px solid ${TOKENS.colors.accentWarm}`,
              borderRadius: 22,
              padding: "20px 26px",
              boxShadow: `0 0 38px ${TOKENS.colors.accentWarmGlow}, 0 18px 36px rgba(0,0,0,0.45)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: TOKENS.colors.accentWarm,
                }}
              >
                STATELESS LLM
              </div>
              <div
                style={{
                  fontFamily: TOKENS.fonts.display,
                  fontSize: 38,
                  fontWeight: 800,
                  marginTop: 2,
                }}
              >
                Model = CPU
              </div>
            </div>
            <div
              style={{
                padding: "10px 18px",
                borderRadius: 14,
                backgroundColor: TONE_STYLES.amber.bg,
                border: `2px solid ${TONE_STYLES.amber.border}`,
                fontFamily: TOKENS.fonts.mono,
                fontSize: 24,
                fontWeight: 900,
                color: TOKENS.colors.accentWarm,
              }}
            >
              SAME
            </div>
          </div>

          {/* Connector arrow */}
          <div style={{ display: "flex", justifyContent: "center", height: 22 }}>
            <svg width={80} height={22} viewBox="0 0 80 22">
              <line x1={40} y1={0} x2={40} y2={15} stroke={TOKENS.colors.accent} strokeWidth={4} strokeLinecap="round" />
              <polygon points="40,22 31,12 49,12" fill={TOKENS.colors.accent} />
            </svg>
          </div>

          {/* Main focal card: The Harness OS */}
          <div
            style={{
              backgroundColor: TOKENS.colors.surface,
              border: `3px solid ${TOKENS.colors.accent}`,
              borderRadius: 26,
              padding: "24px 26px",
              boxShadow: `0 0 48px ${TOKENS.colors.accentGlow}, 0 24px 44px rgba(0,0,0,0.52)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  fontFamily: TOKENS.fonts.display,
                  fontSize: 36,
                  fontWeight: 800,
                  color: TOKENS.colors.textPrimary,
                }}
              >
                THE HARNESS OS
              </span>
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 20,
                  fontWeight: 800,
                  color: TOKENS.colors.accentEmerald,
                  backgroundColor: TONE_STYLES.emerald.bg,
                  border: `2px solid ${TONE_STYLES.emerald.border}`,
                  padding: "6px 14px",
                  borderRadius: 999,
                }}
              >
                PASS ✓
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {HARNESS_MODULES.map((mod) => {
                const st = TONE_STYLES[mod.tone];
                return (
                  <div
                    key={mod.label}
                    style={{
                      padding: "16px 14px",
                      borderRadius: 14,
                      backgroundColor: st.bg,
                      border: `2px solid ${st.border}`,
                      textAlign: "center",
                      fontFamily: TOKENS.fonts.mono,
                      fontSize: 22,
                      fontWeight: 800,
                      color: st.main,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {mod.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
