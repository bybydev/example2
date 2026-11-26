# AI Agent Harnesses Explained

Long-form YouTube video template built with Remotion, Google Colab voiceover + Whisper timings (`mycli`), bundled fonts/SFX/music, AI-assisted chapter implementation, thumbnail still rendering, and GitHub Actions CI rendering.

## Quick Start

Follow the step-by-step production SOP and live checklist in **[WORKFLOW.md](WORKFLOW.md)**:

1. Draft & approve `content/storyboard.md` *(gate before writing narration)*
2. Update `video.config.json` & write `content/voiceover.md`
3. Sync audio, Whisper timings, timeline & SRT (`mycli remotion sync`)
4. Implement chapters in `src/chapters/` + thumbnail in `src/Thumbnail.tsx`
5. Finalize `content/youtube-metadata.md` & run `mycli remotion doctor`
6. Commit, push, and dispatch `.github/workflows/render.yml` in GitHub Actions

## Bundled Assets & Reference Docs

- **Production SOP & Checklist:** [WORKFLOW.md](WORKFLOW.md)
- **Fonts (`public/fonts/`):** `Inter`, `JetBrains Mono`, `Space Grotesk`, `Caveat` — see [public/fonts/README.md](public/fonts/README.md)
- **Sound Effects (`public/sfx/`):** 33 royalty-free SFX mapped to typed `<Sfx />` names — see [public/sfx/README.md](public/sfx/README.md)
- **Background Music (`public/music/`):** Looping ambient bed wired to `<BackgroundMusic />` — see [public/music/README.md](public/music/README.md)
- **Agent Guidelines:** Architecture rules and conventions — see [AGENTS.md](AGENTS.md)
