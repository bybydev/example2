# Remotion YouTube Shorts Template

Vertical `9:16` (`1080×1920`, `30 fps`) YouTube Shorts template built with Remotion, Google Colab voiceover + Whisper timings (`mycli`), burned-in kinetic captions, bundled fonts/SFX/music, vertical cover rendering, and GitHub Actions CI.

Shares the core visual palette, typography, audio tooling, and `mycli` pipeline with `remotion-youtube-template` while adapting layout, pacing, safe zones, and captions specifically for YouTube Shorts.

## Quick Start

Follow the step-by-step production SOP and live checklist in **[WORKFLOW.md](WORKFLOW.md)**:

1. Plan bespoke visual style & approve `content/storyboard.md` *(gate before writing narration)*
2. Update `video.config.json` & write punchy narration in `content/voiceover.md`
3. Sync audio, Whisper timings, timeline & SRT (`mycli remotion sync`)
4. Implement chapters in `src/chapters/` + vertical cover in `src/Thumbnail.tsx`
5. Finalize `content/youtube-metadata.md` & run `mycli remotion doctor`
6. Commit, push, and dispatch `.github/workflows/render.yml` in GitHub Actions

## Shorts Specs & Defaults

- **Canvas:** `1080×1920` (`9:16`), `30 fps` (target **30–60s**, hard YouTube Shorts cap **180s**)
- **Safe zones (`src/theme/tokens.ts`):** `safeTop: 220px`, `safeBottom: 440px`, `safeLeft: 72px`, `safeRight: 148px`, `captionReserve: 200px` (toggle `showSafeZoneGuide: true` in Remotion Studio to preview YouTube Shorts UI overlays)
- **Captions:** Burned-in 2–4 word kinetic highlight captions (`src/lib/captions.tsx`) enabled by default (`showCaptions: true`), plus `content/subtitles.srt` for YouTube CC
- **Vertical cover:** `<Still id="Thumbnail" />` renders `1080×1920` to `out/thumbnail.png`

## Bundled Assets & Reference Docs

- **Production SOP & Checklist:** [WORKFLOW.md](WORKFLOW.md)
- **Fonts (`public/fonts/`):** `Inter`, `JetBrains Mono`, `Space Grotesk`, `Caveat` — see [public/fonts/README.md](public/fonts/README.md)
- **Sound Effects (`public/sfx/`):** 33 royalty-free SFX mapped to typed `<Sfx />` names — see [public/sfx/README.md](public/sfx/README.md)
- **Background Music (`public/music/`):** Looping ambient bed wired to `<BackgroundMusic />` — see [public/music/README.md](public/music/README.md)
- **Agent Guidelines:** Creative rules & architecture conventions — see [AGENTS.md](AGENTS.md)
