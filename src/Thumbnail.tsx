import React from "react";
import { AbsoluteFill } from "remotion";
import { TOKENS, TONE_STYLES } from "./theme/tokens";

const BEFORE_LEFT_Y = [22, 52, 82];
const BEFORE_RIGHT_Y = [14, 40, 66, 92];
const AFTER_TOOLS = ["Files", "Slack", "Notion", "DB"];

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
      {/* Dual-tone radial lighting + subtle engineering grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            radial-gradient(circle at 16% 24%, rgba(56, 189, 248, 0.30), transparent 46%),
            radial-gradient(circle at 84% 26%, rgba(251, 113, 133, 0.22), transparent 42%),
            radial-gradient(circle at 76% 74%, rgba(52, 211, 153, 0.24), transparent 48%),
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 48px 48px, 48px 48px",
        }}
      />

      {/* Safe-padded 1280x720 layout (keeps bottom-right clear for YouTube duration badge) */}
      <AbsoluteFill
        style={{
          padding: "48px 56px 52px 62px",
          display: "grid",
          gridTemplateColumns: "1.04fr 0.96fr",
          gap: 42,
          alignItems: "center",
        }}
      >
        {/* Left: High-contrast mobile-readable headline */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              padding: "9px 20px",
              borderRadius: 999,
              backgroundColor: TONE_STYLES.cyan.bg,
              border: `2px solid ${TONE_STYLES.cyan.border}`,
              color: TOKENS.colors.accent,
              fontFamily: TOKENS.fonts.mono,
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: "0.08em",
              marginBottom: 22,
            }}
          >
            MODEL CONTEXT PROTOCOL
          </div>

          <div
            style={{
              fontSize: 126,
              fontWeight: 900,
              lineHeight: 0.94,
              letterSpacing: "-0.045em",
              color: TOKENS.colors.textPrimary,
              textShadow: "0 14px 40px rgba(0, 0, 0, 0.6)",
            }}
          >
            MCP
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: TOKENS.colors.accent,
              textShadow: `0 0 36px ${TOKENS.colors.accentGlow}, 0 12px 32px rgba(0, 0, 0, 0.55)`,
            }}
          >
            EXPLAINED
          </div>

          {/* High-contrast M x N -> M + N hook bar */}
          <div
            style={{
              marginTop: 30,
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 16,
              padding: "12px 22px",
              borderRadius: 16,
              backgroundColor: "rgba(20, 27, 48, 0.9)",
              border: `1.5px solid ${TOKENS.colors.borderStrong}`,
              fontFamily: TOKENS.fonts.mono,
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            <span style={{ color: TOKENS.colors.accentRose }}>M × N</span>
            <span style={{ color: TOKENS.colors.textMuted }}>→</span>
            <span style={{ color: TOKENS.colors.accentEmerald }}>M + N</span>
            <span
              style={{
                marginLeft: 6,
                paddingLeft: 16,
                borderLeft: `1.5px solid ${TOKENS.colors.border}`,
                fontSize: 20,
                color: TOKENS.colors.accentWarm,
              }}
            >
              USB-C FOR AI
            </span>
          </div>
        </div>

        {/* Right: Focal Before vs. With MCP cards (marginBottom clears YouTube's bottom-right timestamp badge) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            marginBottom: 46,
          }}
        >
          {/* BEFORE Card: Tangled M x N Glue */}
          <div
            style={{
              backgroundColor: TOKENS.colors.surface,
              border: `2.5px solid ${TOKENS.colors.accentRose}`,
              borderRadius: 24,
              padding: "20px 24px 18px",
              boxShadow: `0 0 36px ${TOKENS.colors.accentRoseGlow}, 0 20px 40px rgba(0,0,0,0.48)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 22,
                  fontWeight: 900,
                  color: TOKENS.colors.accentRose,
                  letterSpacing: "0.05em",
                }}
              >
                BEFORE MCP
              </span>
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 18,
                  fontWeight: 800,
                  color: TOKENS.colors.textSecondary,
                }}
              >
                50+ Custom Glue Links
              </span>
            </div>

            <svg width={470} height={106} viewBox="0 0 470 106" style={{ display: "block", width: "100%" }}>
              {BEFORE_LEFT_Y.map((y1, i) =>
                BEFORE_RIGHT_Y.map((y2, j) => (
                  <path
                    key={`tangle-${i}-${j}`}
                    d={`M 96 ${y1} C 200 ${y1}, 270 ${y2}, 374 ${y2}`}
                    fill="none"
                    stroke={TOKENS.colors.accentRose}
                    strokeWidth={2.2}
                    opacity={0.72}
                  />
                ))
              )}
              {BEFORE_LEFT_Y.map((y, i) => (
                <g key={`bl-${i}`}>
                  <rect
                    x={4}
                    y={y - 12}
                    width={92}
                    height={24}
                    rx={8}
                    fill={TOKENS.colors.surfaceElevated}
                    stroke={TOKENS.colors.borderStrong}
                    strokeWidth={1.5}
                  />
                  <text
                    x={50}
                    y={y + 5}
                    textAnchor="middle"
                    fill={TOKENS.colors.textPrimary}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={13}
                    fontWeight={800}
                  >
                    AI #{i + 1}
                  </text>
                </g>
              ))}
              {BEFORE_RIGHT_Y.map((y, j) => (
                <g key={`br-${j}`}>
                  <rect
                    x={374}
                    y={y - 10}
                    width={92}
                    height={20}
                    rx={7}
                    fill={TOKENS.colors.surfaceElevated}
                    stroke={TOKENS.colors.borderStrong}
                    strokeWidth={1.5}
                  />
                  <text
                    x={420}
                    y={y + 4}
                    textAnchor="middle"
                    fill={TOKENS.colors.textSecondary}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={12}
                    fontWeight={700}
                  >
                    {AFTER_TOOLS[j]}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* WITH MCP Card: Clean Universal Hub */}
          <div
            style={{
              backgroundColor: TOKENS.colors.surface,
              border: `3px solid ${TOKENS.colors.accent}`,
              borderRadius: 24,
              padding: "20px 24px 20px",
              boxShadow: `0 0 48px ${TOKENS.colors.accentGlow}, 0 24px 46px rgba(0,0,0,0.52)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 22,
                  fontWeight: 900,
                  color: TOKENS.colors.accentEmerald,
                  letterSpacing: "0.05em",
                }}
              >
                WITH MCP
              </span>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  backgroundColor: TONE_STYLES.emerald.bg,
                  border: `1.5px solid ${TONE_STYLES.emerald.border}`,
                  fontFamily: TOKENS.fonts.mono,
                  fontSize: 16,
                  fontWeight: 800,
                  color: TOKENS.colors.accentEmerald,
                }}
              >
                1 UNIVERSAL PORT
              </span>
            </div>

            <svg width={470} height={124} viewBox="0 0 470 124" style={{ display: "block", width: "100%" }}>
              {/* Clean AI -> MCP Hub lines */}
              {[24, 62, 100].map((y, i) => (
                <g key={`al-${i}`}>
                  <path
                    d={`M 96 ${y} C 145 ${y}, 155 62, 190 62`}
                    fill="none"
                    stroke={TOKENS.colors.accent}
                    strokeWidth={3.5}
                  />
                  <rect
                    x={4}
                    y={y - 13}
                    width={92}
                    height={26}
                    rx={8}
                    fill={TOKENS.colors.surfaceElevated}
                    stroke={TONE_STYLES.cyan.border}
                    strokeWidth={1.8}
                  />
                  <text
                    x={50}
                    y={y + 5}
                    textAnchor="middle"
                    fill={TOKENS.colors.textPrimary}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={13}
                    fontWeight={800}
                  >
                    AI #{i + 1}
                  </text>
                </g>
              ))}

              {/* Clean MCP Hub -> Tools lines */}
              {[18, 47, 77, 106].map((y, j) => (
                <g key={`ar-${j}`}>
                  <path
                    d={`M 282 62 C 320 62, 330 ${y}, 374 ${y}`}
                    fill="none"
                    stroke={TOKENS.colors.accentEmerald}
                    strokeWidth={3.5}
                  />
                  <rect
                    x={374}
                    y={y - 11}
                    width={92}
                    height={22}
                    rx={8}
                    fill={TOKENS.colors.surfaceElevated}
                    stroke={TONE_STYLES.emerald.border}
                    strokeWidth={1.8}
                  />
                  <text
                    x={420}
                    y={y + 4}
                    textAnchor="middle"
                    fill={TOKENS.colors.accentEmerald}
                    fontFamily={TOKENS.fonts.mono}
                    fontSize={13}
                    fontWeight={800}
                  >
                    {AFTER_TOOLS[j]}
                  </text>
                </g>
              ))}

              {/* Center Glowing MCP Hub */}
              <rect
                x={186}
                y={22}
                width={98}
                height={80}
                rx={18}
                fill={TOKENS.colors.surfaceElevated}
                stroke={TOKENS.colors.accent}
                strokeWidth={3}
              />
              <text
                x={235}
                y={60}
                textAnchor="middle"
                fill={TOKENS.colors.textPrimary}
                fontFamily={TOKENS.fonts.mono}
                fontSize={28}
                fontWeight={900}
              >
                MCP
              </text>
              <text
                x={235}
                y={82}
                textAnchor="middle"
                fill={TOKENS.colors.accent}
                fontFamily={TOKENS.fonts.mono}
                fontSize={12}
                fontWeight={800}
              >
                STANDARD
              </text>
            </svg>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
