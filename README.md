# Remotion YouTube Template

Long-form YouTube video project built with Remotion, Google Colab voiceover + Whisper timings (`mycli`), AI-assisted chapter implementation, and GitHub Actions rendering.

## Workflow

1. **Write the narration script** in `content/voiceover.md` (one paragraph per blank line) and visual notes in `content/storyboard.md`.
2. **Sync voiceover, MP3 loudnorm (-14 LUFS), Whisper timings, and timeline in one command** (shares a single Colab GPU session):
   ```bash
   mycli remotion sync --voice /path/to/voice.wav
   ```
   *(Or run individual stages with `--only normalize,timeline`, `--from timings`, or `mycli remotion timeline`.)*
3. **Build chapter visuals** under `src/chapters/` using `src/lib/timeline.ts` (`chapterClips`, `wordFrame`).
4. **Check project health before pushing**:
   ```bash
   mycli remotion doctor
   ```
5. **Render on GitHub Actions** (push to `main`/`master` or dispatch `Render Remotion Video`), then pull and watch:
   ```bash
   mycli remotion play
   mycli remotion download
   ```
