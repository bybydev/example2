import { continueRender, delayRender, staticFile } from "remotion";

const FONT_DEFINITIONS = [
  {
    family: "Inter",
    file: "fonts/Inter-Variable.woff2",
    weight: "100 900",
  },
  {
    family: "JetBrains Mono",
    file: "fonts/JetBrainsMono-Variable.woff2",
    weight: "100 800",
  },
  {
    family: "Space Grotesk",
    file: "fonts/SpaceGrotesk-Variable.woff2",
    weight: "300 700",
  },
  {
    family: "Caveat",
    file: "fonts/Caveat-Variable.woff2",
    weight: "400 700",
  },
] as const;

let loaded = false;

/** Loads bundled variable fonts once and blocks Remotion rendering until ready. */
export const loadFonts = (): void => {
  if (loaded || typeof document === "undefined" || typeof FontFace === "undefined") {
    return;
  }
  loaded = true;

  const handle = delayRender("Loading bundled fonts");

  Promise.all(
    FONT_DEFINITIONS.map(async ({ family, file, weight }) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, {
        weight,
        style: "normal",
      });
      await face.load();
      document.fonts.add(face);
    }),
  )
    .then(() => {
      continueRender(handle);
    })
    .catch((err) => {
      console.error("Failed to load bundled fonts:", err);
      continueRender(handle);
    });
};
