# Fonts (`public/fonts/`)

Bundled variable `.woff2` fonts for offline-safe, deterministic rendering in Remotion Studio and GitHub Actions (`ubuntu-latest`).

---

## Available Fonts

| Token | Font Family | File | Weights | When to use |
| --- | --- | --- | --- | --- |
| `TOKENS.fonts.sans` | `Inter` | `Inter-Variable.woff2` | `100 900` | Body copy, UI labels, cards, and captions. |
| `TOKENS.fonts.mono` | `JetBrains Mono` | `JetBrainsMono-Variable.woff2` | `100 800` | Code blocks, terminal output, badges, and numeric counters (`fontVariantNumeric: "tabular-nums"`). |
| `TOKENS.fonts.display` | `Space Grotesk` | `SpaceGrotesk-Variable.woff2` | `300 700` | Chapter title cards, hero headlines, big stats, and YouTube thumbnails. |
| `TOKENS.fonts.handwritten` | `Caveat` | `Caveat-Variable.woff2` | `400 700` | Whiteboard-style margin notes, callouts, and arrow labels. |

---

## How Loading Works

- `src/theme/fonts.ts` registers all bundled `.woff2` files via the browser `FontFace` API + Remotion's `staticFile('fonts/...')` and uses `delayRender()` / `continueRender()` so frames wait until fonts are ready.
- `src/Root.tsx` calls `loadFonts()` once at module load for `Main`, `Thumbnail`, and all chapter compositions.
- Use `TOKENS.fonts.*` from `src/theme/tokens.ts` in components instead of hardcoding font family strings.
