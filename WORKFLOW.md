# Video Production Workflow

Follow Steps 1 → 8 in order. Both human and AI can check off items (`- [x]`) as each pass condition is met.

---

## Progress Checklist

- [ ] **Step 1:** Plan & write storyboard (`content/storyboard.md`) — *Both (AI must wait for human approval before Step 2)*
- [ ] **Step 2:** Configure video (`video.config.json`) & write narration script (`content/voiceover.md`) — *Both*
- [ ] **Step 3:** Sync voiceover, Whisper timings, timeline & SRT (`mycli remotion sync`) — *Both (AI must ask permission first)*
- [ ] **Step 4:** Implement chapter visuals, diagrams & SFX (`src/chapters/`) — *AI (Human review)*
- [ ] **Step 5:** Design YouTube thumbnail (`src/Thumbnail.tsx`) — *Both*
- [ ] **Step 6:** Finalize YouTube publishing metadata (`content/youtube-metadata.md`) — *Both*
- [ ] **Step 7:** Run preflight health check (`mycli remotion doctor`) — *Both*
- [ ] **Step 8:** Commit, push, render in GitHub Actions, QA & publish — *Human*

---

## Step-by-Step Guide

### Step 1 — Plan & Write Storyboard
- **Owner:** Both (AI + Human) — **AI must wait for explicit human permission before moving to Step 2 (`content/voiceover.md`)**
- **Instruction:**
  - Draft and refine `content/storyboard.md` collaboratively across as many rounds as needed until satisfied.
  - Define the video's target length, audience, chapter breakdown, visual layout per beat, semantic color coding (`cyan`, `amber`, `emerald`, `rose`), planned spoken cue words for `cueFrame()`, and intended SFX from `public/sfx/README.md`.
- **Input:** Video topic, research notes, target audience, and desired pacing.
- **Output:** Approved `content/storyboard.md`.
- **Pass condition:**
  - [ ] Every chapter has clear goals, visual beats, and cue/SFX notes.
  - [ ] Human explicitly approves `content/storyboard.md` to proceed to Step 2.

### Step 2 — Configure Video & Write Narration Script
- **Owner:** Both (AI + Human)
- **Instruction:**
  - Update `video.config.json` with your video's `slug`, `title`, and `chapters` list (`id`, `title`, and 1-based `paragraphs` mapping matching the approved storyboard).
  - Write the full spoken script in `content/voiceover.md` with **one paragraph separated by a blank line** (each paragraph becomes one audio clip and one Whisper timing sidecar).
  - Optionally add custom chapter images/SVGs under `public/assets/<chapter-id>/` or swap the background music track in `public/music/bg-ambient.mp3` (see `public/music/README.md`).
- **Input:** Approved `content/storyboard.md` and optional custom media assets.
- **Output:** Updated `video.config.json` and completed `content/voiceover.md` (plus optional files in `public/assets/` or `public/music/`).
- **Pass condition:**
  - [ ] Every chapter in `video.config.json` has a unique kebab-case `id` and contiguous 1-based `paragraphs` with no gaps or overlaps.
  - [ ] Paragraph count in `content/voiceover.md` exactly matches the total paragraphs referenced in `video.config.json`.

### Step 3 — Sync Voiceover, Whisper Timings, Timeline & SRT
- **Owner:** Both (AI + Human) — **AI must ask the human for permission before running** *(uses a Colab GPU session)*
- **Instruction:**
  - Run the end-to-end audio + alignment pipeline in a single Colab GPU session (uses the default voice configured in `~/.mycli/.env`):
    ```bash
    mycli remotion sync
    ```
  - *(Pass `--voice /path/to/voice.wav` only if overriding the configured voice, or run partial stages with `--only normalize,timeline`, `--from timings`, or `mycli remotion timeline`.)*
- **Input:** `video.config.json`, `content/voiceover.md`, and configured voice in `~/.mycli/.env`.
- **Output:**
  - Normalized `-14 LUFS` MP3 clips in `public/voiceover/*.mp3`
  - Whisper word-timing sidecars in `content/timings/*.json` + `content/timings/alignment_report.txt`
  - Generated timeline in `src/generated/timeline.json` *(never edit by hand)*
  - Publishing tracks `content/subtitles.srt` and `content/youtube-chapters.txt`
- **Pass condition:**
  - [ ] Every paragraph in `content/voiceover.md` has a non-empty MP3 and JSON sidecar.
  - [ ] `content/timings/alignment_report.txt` reports clean alignment and `src/generated/timeline.json` has `timingSource: "whisper"` for all clips with non-zero `totalFrames`.
  - [ ] `content/subtitles.srt` and `content/youtube-chapters.txt` are populated.

### Step 4 — Implement Chapter Visuals, Diagrams & SFX
- **Owner:** AI (reviewed by Human)
- **Instruction:**
  - Implement one folder per chapter under `src/chapters/<id>/index.tsx` and register every chapter ID in `src/chapters/index.ts`.
  - Follow `content/storyboard.md` and reuse shared building blocks:
    - Tokens & bundled fonts: `src/theme/tokens.ts` (`TOKENS.fonts.sans/mono/display/handwritten`) and `public/fonts/README.md`
    - Layout & UI: `src/ui/Stage.tsx`, `src/ui/primitives.tsx` (`SceneBeat`, `Card`, `Pill`, `SectionTitle`, `DataChip`, `MeterBar`, `AnimatedNumber`, `StatCallout`)
    - Diagrams: `src/ui/diagrams.tsx` (`NodeBox`, `CodePanel`, `CheckRow`, `SvgLink`, `SvgPacket`)
    - Timing & motion: `src/ui/motion.ts` (`clipRange`, `cueFrame`, `sceneWindow`, `fadeIn`, `progressBetween`, `springAt`, `slideUpStyle`)
    - Audio & SFX: `src/lib/audio.tsx` (`<Sfx name="..." from={cueFrame(...)} />`, `<BackgroundMusic />`) and `public/sfx/README.md`
  - Keep `src/Video.tsx` wired with `<BackgroundMusic />`, `<VoiceoverTrack />`, and `<CaptionsOverlay />` (captions stay off by default in favor of `content/subtitles.srt`).
- **Input:** `content/storyboard.md`, `src/generated/timeline.json`, `public/sfx/README.md`, `public/fonts/README.md`.
- **Output:** Implemented `src/chapters/<id>/index.tsx` files and updated `src/chapters/index.ts` (plus `src/Video.tsx` / `src/Root.tsx` if adjusting `musicVolume` or `showCaptions`).
- **Pass condition:**
  - [ ] Every chapter in `video.config.json` is mapped in `src/chapters/index.ts`.
  - [ ] Key animations and `<Sfx>` triggers are anchored via `cueFrame()`/`wordFrame()` (not arbitrary magic frames).
  - [ ] All referenced SFX/asset paths exist in `public/`, and layouts fit within `1920×1080` safe margins (`120px` X / `80px` Y).

### Step 5 — Design YouTube Thumbnail
- **Owner:** Both (AI + Human)
- **Instruction:**
  - Customize `src/Thumbnail.tsx` (`1280×720` `<Still id="Thumbnail" />`) with a bold 3–5 word headline (`TOKENS.fonts.display`) and a high-contrast focal visual.
  - Keep the bottom-right corner clear so YouTube's duration badge does not cover key text or visuals.
- **Input:** Video title, visual hook concept, `src/theme/tokens.ts`.
- **Output:** Updated `src/Thumbnail.tsx`.
- **Pass condition:**
  - [ ] Headline is readable at small mobile sizes and matches the video's semantic palette.
  - [ ] Bottom-right timestamp zone is unobstructed.

### Step 6 — Finalize YouTube Publishing Metadata
- **Owner:** Both (AI + Human)
- **Instruction:**
  - Complete `content/youtube-metadata.md` with the primary title, A/B title ideas, copy-paste description, exact chapter timestamps copied from `content/youtube-chapters.txt`, tags (under 500 characters), and pinned comment idea.
- **Input:** `content/voiceover.md`, `content/youtube-chapters.txt`, `src/generated/timeline.json`.
- **Output:** Publish-ready `content/youtube-metadata.md`.
- **Pass condition:**
  - [ ] No `<placeholder>` text remains.
  - [ ] Chapter timestamps match `content/youtube-chapters.txt` starting at `00:00`, and tags stay under 500 characters.

### Step 7 — Preflight Health Check (`doctor`)
- **Owner:** Both (AI + Human)
- **Instruction:**
  - Validate that all scripts, voiceovers, timings, and timeline files are consistent:
    ```bash
    mycli remotion doctor
    ```
  - Fix any reported alignment, missing-file, or config issues before moving to Step 8.
- **Input:** Completed workspace files (`video.config.json`, `content/`, `public/`, `src/`).
- **Output:** Clean `mycli remotion doctor` health report.
- **Pass condition:**
  - [ ] `mycli remotion doctor` exits with 0 errors and no unresolved warnings.

### Step 8 — Commit, Push, Render in GitHub Actions, QA & Publish
- **Owner:** Human
- **Instruction:**
  - Commit all source code and generated assets (`public/voiceover/*.mp3`, `content/timings/*.json`, `content/subtitles.srt`, `content/youtube-chapters.txt`, `src/generated/timeline.json`) and push to GitHub.
  - Trigger the **Render Remotion Video** workflow (`.github/workflows/render.yml`) via GitHub Actions `workflow_dispatch`:
    - *Fast preview:* pass a single chapter composition (e.g., `Chapter01Hook`) or a `frames` range (e.g., `0-300`).
    - *Final render:* leave defaults (`composition: Main`, `frames: ""`) to render `main.mp4`, `thumbnail.png`, and attach `content/subtitles.srt` to a GitHub pre-release.
  - Review and download the rendered release artifacts locally:
    ```bash
    mycli remotion play
    mycli remotion download
    ```
  - If visual pacing, layout, or audio balance needs tweaks, loop back to Step 4 or Step 5 and re-dispatch.
  - Upload the final MP4, `thumbnail.png`, `content/subtitles.srt`, and metadata from `content/youtube-metadata.md` to YouTube Studio.
- **Input:** Verified workspace from Step 7 and `.github/workflows/render.yml`.
- **Output:** Pushed git commit, GitHub pre-release containing `.mp4`, `-thumbnail.png`, and `.srt`, followed by the published YouTube video.
- **Pass condition:**
  - [ ] All required assets are committed and pushed.
  - [ ] CI steps (`Typecheck` → `Render video` → `Render thumbnail` → `Verify release assets`) all pass.
  - [ ] Manual playback confirms bundled fonts render properly, narration/SFX/music levels are balanced, transitions stay synced to speech, and captions align cleanly.
