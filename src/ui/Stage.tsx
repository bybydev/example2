import React from "react";
import { AbsoluteFill } from "remotion";
import { TOKENS } from "../theme/tokens";

export const Stage: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.colors.background,
        color: TOKENS.colors.textPrimary,
        fontFamily: TOKENS.fonts.sans,
        padding: `${TOKENS.layout.safeMarginY}px ${TOKENS.layout.safeMarginX}px`,
        justifyContent: "center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
