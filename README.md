# MCP Explained

Long-form YouTube video project built with Remotion, Google Colab voiceover + Whisper timings (`mycli`), AI-assisted chapter implementation, thumbnail still rendering, and GitHub Actions rendering.

## Workflow

1. **Write the narration script & visual plan** in `content/voiceover.md` (one paragraph per blank line) and `content/storyboard.md`.
2. **Sync voiceover, MP3 loudnorm (-14 LUFS), Whisper timings, and timeline in one command** (shares a single Colab GPU session):
   ```bash
   mycli remotion sync --voice /path/to/voice.wav
   ```
   *(Or run individual stages with `--only normalize,timeline`, `--from timings`, or `mycli remotion timeline`.)*
3. **Build chapter visuals & thumbnail**:
   - Implement chapters under `src/chapters/` using `src/theme/tokens.ts`, `src/ui/Stage.tsx`, `src/ui/primitives.tsx`, and `src/ui/motion.ts` (`clipRange`, `cueFrame`, `sceneWindow`, `slideUpStyle`).
   - Customize `src/Thumbnail.tsx` (1280×720 `<Still id="Thumbnail" />`, keeping the bottom-right corner clear for YouTube's timestamp badge).
4. **Prepare YouTube publishing assets**:
   - Generate `content/subtitles.srt` using `mycli` (in-video `CaptionsOverlay` is off by default in favor of a native YouTube caption track).
   - Fill out `content/youtube-metadata.md` with title ideas, description + `content/youtube-chapters.txt` timestamps, tags, and checklist.
5. **Check project health before pushing**:
   ```bash
   mycli remotion doctor
   ```
6. **Render on GitHub Actions** (manually dispatch `Render Remotion Video`), which renders the MP4 + `thumbnail.png` (and attaches `content/subtitles.srt` when present) as a GitHub pre-release, then pull and watch:
   ```bash
   mycli remotion play
   mycli remotion download
   ```
