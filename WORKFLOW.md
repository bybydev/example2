# YouTube Shorts Production Workflow

Follow Steps 1 → 8 in order. Both human and AI can check off items (`- [x]`) as each pass condition is met.

---

## Progress Checklist

- [ ] **Step 1:** Plan visual style & write storyboard (`content/storyboard.md`) — *Both (AI must wait for human approval before Step 2)*
- [ ] **Step 2:** Configure Short (`video.config.json`) & write narration script (`content/voiceover.md`) — *Both*
- [ ] **Step 3:** Sync voiceover, Whisper timings, timeline & SRT (`mycli remotion sync`) — *Both (AI must ask permission first)*
- [ ] **Step 4:** Implement bespoke chapter visuals, motion & SFX (`src/chapters/`) — *AI (Human review)*
- [ ] **Step 5:** Design vertical Shorts cover (`src/Thumbnail.tsx`) & check frame-0 hook — *Both*
- [ ] **Step 6:** Finalize YouTube Shorts metadata (`content/youtube-metadata.md`) — *Both*
- [ ] **Step 7:** Run preflight health check (`mycli remotion doctor`) — *Both*
- [ ] **Step 8:** Commit, push, render in GitHub Actions, QA & publish — *Human*

---

## Step-by-Step Guide

### Step 1 — Plan Visual Style & Write Storyboard
- **Owner:** Both (AI + Human) — **AI must wait for explicit human permission before moving to Step 2 (`content/voiceover.md`)**
- **Instruction:**
  - Draft and refine `content/storyboard.md` collaboratively across as many rounds as needed until satisfied.
  - Target **30–60 seconds** (~75–150 words; hard YouTube Shorts limit is 180 seconds) structured into tight 3–5 second visual beats (e.g., Frame-0 Hook → Tension/Setup → Visual Proof/Reveal → Payoff & optional Related Video CTA).
  - **Define a bespoke visual direction for this specific Short** — do not copy the starter demo's card-stack layout blindly. Plan custom diagrams, motion metaphors, semantic color accents (`cyan`, `amber`, `emerald`, `rose`), cue words for `cueFrame()`, and SFX from `public/sfx/README.md`.
  - Avoid repeating headers, titles, or eyebrows on every beat; let visuals and burned-in captions carry the flow.
- **Input:** Topic, hook angle, target viewer, and related long-form video (if any).
- **Output:** Approved `content/storyboard.md`.
- **Pass condition:**
  - [ ] Every beat has a distinct visual idea, cue/SFX notes, and bespoke art direction (not generic repeated title/card slides).
  - [ ] Frame 0 has an immediate, bold visual hook (no fade-from-black).
  - [ ] Human explicitly approves `content/storyboard.md` to proceed to Step 2.

### Step 2 — Configure Short & Write Narration Script
- **Owner:** Both (AI + Human)
- **Instruction:**
  - Update `video.config.json` with your Short's `slug`, `title`, and `chapters` list (`id`, `title`, and 1-based `paragraphs` mapping matching the approved storyboard). Keep `width: 1080`, `height: 1920`, `fps: 30` and tight Shorts `timing` defaults.
  - Write the full spoken script in `content/voiceover.md` with **one short paragraph (1–2 punchy sentences) per blank line** so pacing cuts briskly and each paragraph maps cleanly to one audio clip + Whisper timing sidecar.
  - Optionally add custom assets under `public/assets/<chapter-id>/` or swap `public/music/bg-ambient.mp3` (see `public/music/README.md`).
- **Input:** Approved `content/storyboard.md` and optional custom media assets.
- **Output:** Updated `video.config.json` and completed `content/voiceover.md`.
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
  - *(Pass `--voice /path/to/voice.wav` only if overriding the configured voice, or run `mycli remotion timeline` locally when only `video.config.json` timing/config changed.)*
- **Input:** `video.config.json`, `content/voiceover.md`, and configured voice in `~/.mycli/.env`.
- **Output:**
  - Normalized `-14 LUFS` MP3 clips in `public/voiceover/*.mp3`
  - Whisper word-timing sidecars in `content/timings/*.json` + `content/timings/alignment_report.txt`
  - Generated timeline in `src/generated/timeline.json` *(never edit by hand)*
  - Publishing track `content/subtitles.srt` (and `content/youtube-chapters.txt`)
- **Pass condition:**
  - [ ] Every paragraph in `content/voiceover.md` has a non-empty MP3 and JSON sidecar.
  - [ ] `content/timings/alignment_report.txt` reports clean alignment and `src/generated/timeline.json` has `timingSource: "whisper"` for all clips with `width: 1080`, `height: 1920`, and `totalSeconds <= 180` (ideally `<= 60`).
  - [ ] `content/subtitles.srt` is populated.

### Step 4 — Implement Chapter Visuals, Motion & SFX
- **Owner:** AI (reviewed by Human)
- **Instruction:**
  - Implement one folder per chapter under `src/chapters/<id>/index.tsx` and register every chapter ID in `src/chapters/index.ts`.
  - Follow `content/storyboard.md` and treat shared modules as a **flexible toolkit** — build bespoke SVGs, animations, and compositions for each video rather than cloning the starter demo layout:
    - Tokens & bundled fonts: `src/theme/tokens.ts` (`TOKENS`, `TONE_STYLES`, `TOKENS.fonts.*`) and `public/fonts/README.md`
    - Stage & optional primitives: `src/ui/Stage.tsx` (`showHeader={false}` by default), `src/ui/primitives.tsx` (`SceneBeat`, `Card`, `Pill`, `SectionTitle`, `DataChip`, `MeterBar`, `AnimatedNumber`, `StatCallout`, `RelatedVideoCTA`)
    - Optional diagrams: `src/ui/diagrams.tsx` (`NodeBox`, `CodePanel`, `CheckRow`, `SvgLink`, `SvgPacket`, `VerticalFlowConnector`)
    - Timing & motion: `src/ui/motion.ts` (`clipRange`, `cueFrame`, `sceneWindow`, `fadeIn`, `progressBetween`, `springAt`, `slideUpStyle`, `popScaleStyle`)
    - Audio & SFX: `src/lib/audio.tsx` (`<Sfx name="..." from={cueFrame(...)} />`, `<BackgroundMusic />`) and `public/sfx/README.md`
  - Keep `src/Video.tsx` wired with `<BackgroundMusic />`, `<VoiceoverTrack />`, and `<CaptionsOverlay />` (`showCaptions: true` by default).
- **Input:** `content/storyboard.md`, `src/generated/timeline.json`, `public/sfx/README.md`, `public/fonts/README.md`.
- **Output:** Implemented `src/chapters/<id>/index.tsx` files and updated `src/chapters/index.ts`.
- **Pass condition:**
  - [ ] Every chapter in `video.config.json` is mapped in `src/chapters/index.ts`.
  - [ ] Key animations and `<Sfx>` triggers are anchored via `cueFrame()`/`wordFrame()` (not arbitrary magic frames).
  - [ ] Frame 0 is immediately bold and legible (no fade-from-black), and scenes do not repeat headers/titles/eyebrows unnecessarily.
  - [ ] All referenced SFX/asset paths exist in `public/`, and visuals fit cleanly inside `1080×1920` Shorts safe zones (`safeTop: 220`, `safeBottom: 440`, `safeLeft: 72`, `safeRight: 148`, `captionReserve: 200`).

### Step 5 — Design Vertical Cover & Verify Frame-0 Hook
- **Owner:** Both (AI + Human)
- **Instruction:**
  - Customize `src/Thumbnail.tsx` (`1080×1920` `<Still id="Thumbnail" />`) with a bespoke visual hook and bold 3–5 word headline (`TOKENS.fonts.display`) tailored to this Short.
  - Keep focal text and visuals centered safely for both `9:16` Shorts shelves and `3:4`/square channel feed crops.
  - Also verify that Frame 0–15 of `01-hook` reads clearly as a freeze-frame for YouTube's mobile Shorts frame picker.
- **Input:** Short title, visual hook concept, `src/theme/tokens.ts`.
- **Output:** Updated `src/Thumbnail.tsx`.
- **Pass condition:**
  - [ ] Cover headline and focal graphic are readable at small phone grid sizes and match this Short's visual style.
  - [ ] Frame 0 of `Main` works cleanly as a Shorts frame-picker thumbnail.

### Step 6 — Finalize YouTube Shorts Publishing Metadata
- **Owner:** Both (AI + Human)
- **Instruction:**
  - Complete `content/youtube-metadata.md` with a mobile-friendly primary title (≤ 60 chars), A/B title ideas, Related Long-Form Video link (if applicable), concise description + hashtags, tags (under 500 characters), and a pinned comment prompt.
- **Input:** `content/voiceover.md`, `src/generated/timeline.json`, related long-form video URL (if any).
- **Output:** Publish-ready `content/youtube-metadata.md`.
- **Pass condition:**
  - [ ] No `<placeholder>` text remains.
  - [ ] Primary title is concise (≤ 60 characters), tags stay under 500 characters, and Related Video link is noted if linking to a full video.

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
    - *Final render:* leave defaults (`composition: Main`, `frames: ""`) to render `1080×1920` `main.mp4`, `1080×1920` `thumbnail.png`, and attach `content/subtitles.srt` to a GitHub pre-release.
  - Review and download the rendered release artifacts locally:
    ```bash
    mycli remotion play
    mycli remotion download
    ```
  - If visual pacing, safe-zone clearance, caption timing, or audio balance needs tweaks, loop back to Step 4 or Step 5 and re-dispatch.
  - Upload the final `9:16` MP4, pick a crisp cover frame (or use `thumbnail.png` where supported), attach `content/subtitles.srt`, link the Related Video in YouTube Studio, and paste metadata from `content/youtube-metadata.md`.
- **Input:** Verified workspace from Step 7 and `.github/workflows/render.yml`.
- **Output:** Pushed git commit, GitHub pre-release containing `.mp4`, `-thumbnail.png`, and `.srt`, followed by the published YouTube Short.
- **Pass condition:**
  - [ ] All required assets are committed and pushed.
  - [ ] CI steps (`Typecheck` → `Validate Shorts specs` → `Render video` → `Render thumbnail` → `Verify release assets`) all pass.
  - [ ] Manual playback on a vertical viewport confirms bundled fonts render properly, burned-in captions sit cleanly above the bottom Shorts overlay without overlapping visuals or the right rail, narration/SFX/music levels are balanced, and frame 0 hooks immediately.
