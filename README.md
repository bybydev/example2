# Remotion YouTube Template

Long-form YouTube video project built with Remotion, Google Colab voiceover + Whisper timings (`mycli`), AI-assisted chapter implementation, and GitHub Actions rendering.

## Workflow

1. **Write the narration script** in `content/voiceover.md` (one paragraph per blank line) and visual notes in `content/storyboard.md`.
2. **Generate voiceover on Colab**:
   ```bash
   mycli voiceover generate content/voiceover.md -v /path/to/voice.wav -o work/voiceover-raw -s tts --keep-session
   ```
3. **Normalize & convert WAVs to MP3 (-14 LUFS for YouTube)**:
   ```bash
   sh scripts/normalize-voiceover.sh
   ```
4. **Generate Whisper word timings on Colab**:
   ```bash
   mycli voiceover timings public/voiceover -S content/voiceover.md -o content/timings -s tts
   colab stop -s tts
   ```
5. **Compile timeline & YouTube chapters**:
   ```bash
   mycli remotion timeline
   ```
6. **Build chapter visuals** under `src/chapters/` using `timeline.ts` (`chapterClips`, `wordFrame`).
7. **Check project health before pushing**:
   ```bash
   mycli remotion doctor
   ```
8. **Render on GitHub Actions** (push to `main`/`master` or dispatch `Render Remotion Video`), then pull and watch:
   ```bash
   mycli remotion play
   mycli remotion download
   ```
