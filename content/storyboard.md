# Storyboard — <Video Title>

- **Target length:** ~6–8 minutes (~1,000–1,300 words across chapters)
- **Audience:** <Define your target viewer and depth>
- **Canvas & visual system (`src/theme/tokens.ts`):** 1920×1080, 30 fps, safe margins `120px` X / `80px` Y
  - Background: `#0B1020` | Surface cards: `#141B30` | Subtle border: `rgba(255,255,255,0.12)`
  - **Semantic color coding (keep consistent across every chapter):**
    - **Cyan (`#38BDF8`)** — Primary concept, baseline, parallel/efficient path
    - **Amber (`#F59E0B`)** — Contrasting concept, trade-off, cost/latency pressure
    - **Emerald (`#34D399`)** — Optimizations, wins, takeaways, positive outcomes
    - **Rose (`#FB7185`)** — Bottlenecks, failure modes, hard ceilings, warnings
  - Typography (`public/fonts/`, `src/theme/fonts.ts`): `Space Grotesk` (`display`) for titles & thumbnails, `Inter` (`sans`) for body & captions, `JetBrains Mono` (`mono`) for code, badges, and counters, `Caveat` (`handwritten`) for callout annotations.
  - Audio (`src/lib/audio.tsx`): `VoiceoverTrack` (`public/voiceover/*.mp3`), `<BackgroundMusic />` (`public/music/bg-ambient.mp3`, `volume={0.08}`), and typed `<Sfx />` cues (`public/sfx/*.mp3`).
- **Animation rule:** Anchor all key transitions and SFX cues to spoken words via `cueFrame()` / `wordFrame()` (`src/ui/motion.ts`, `src/lib/timeline.ts`) rather than hardcoded frame offsets.

---

## Chapter 01 — Hook (`01-hook`, paragraphs: 1)

**Goal:** Open with a concrete hook or paradox, frame the core question, and establish the video's thesis.

- **Paragraph 1 — Opening Hook:**
  - **Beat:** State the hook and showcase bundled fonts, SFX, music, and synced Whisper timing.
  - **Visuals:** `SectionTitle` + glowing thesis `Card` with handwritten `Caveat` note + 3-column `StatCallout` & `AnimatedNumber` strip.
  - **Motion & `cueFrame` cues:** On `"Replace"` → slide in thesis banner; on `"hook"` → `pop-in` SFX + stat cards; on `"narration"` → `chime-positive` SFX + handwritten annotation.

---

## Chapter 02 — Main Point (`02-main-point`, paragraphs: 2)

**Goal:** Illustrate the script-to-timeline sync pipeline visually using diagrams and SFX.

- **Paragraph 2 — Sync Pipeline:**
  - **Beat:** Show `content/voiceover.md` splitting into `public/voiceover/*.mp3` and `content/timings/*.json` (+ `content/subtitles.srt`).
  - **Visuals:** 3-column diagram (`CodePanel` → `SvgLink` + `SvgPacket` → stacked `NodeBox`es with `DataChip` & `MeterBar`) + bottom `CheckRow` for `content/subtitles.srt`.
  - **Motion & `cueFrame` cues:** On `"Split"` → `slide` SFX + reveal `CodePanel`; on `"maps"` → `magnetic-snap` SFX + draw `SvgLink` connectors; on `"voiceover"` → `data-blip` SFX + `MP3` packet; on `"Whisper"` → `success-ding` SFX + `JSON` packet + `MeterBar` to 100% + `CheckRow` active.

---

## Outro & End-Screen Notes (when adding your final chapter)

- Mirror the opening contrast in one clean synthesis card so viewers leave with a single mental model.
- Reserve clean visual space in the final ~15–20 seconds for YouTube end-screen cards.
