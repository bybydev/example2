# Storyboard — <Short Title>

> **Creative Note:** This template provides a shared visual palette, fonts, SFX, and Shorts safe-zone helpers — **do not blindly copy the starter demo's card/grid layout**. Define a bespoke visual style, motion language, and beat structure tailored to this specific Short's topic, and avoid stamping a chapter header, eyebrow, or title/subtitle onto every frame.

- **Target length:** ~30–60 seconds (~75–150 words; hard YouTube Shorts cap 180s)
- **Audience & Hook Angle:** <Define the viewer and the single surprising premise or takeaway>
- **Related Long-Form Video (optional):** <Link or title of the full video if this Short drives to a deep dive>
- **Canvas & Shorts safe zones (`src/theme/tokens.ts`):** `1080×1920` (`9:16`), `30 fps`
  - Safe zones: `safeTop: 220px` | `safeBottom: 440px` | `safeLeft: 72px` | `safeRight: 148px` | `captionReserve: 200px`
  - Background: `#0B1020` | Surface cards: `#141B30` | Subtle border: `rgba(255,255,255,0.12)`
  - **Semantic color coding (adapt per video, keep consistent within the Short):**
    - **Cyan (`#38BDF8`)** — Primary concept, baseline, efficient path
    - **Amber (`#F59E0B`)** — Contrast, trade-off, tension, cost/latency pressure
    - **Emerald (`#34D399`)** — Payoff, win, optimization, resolution
    - **Rose (`#FB7185`)** — Bottlenecks, failure modes, hard ceilings, warnings
  - Typography (`public/fonts/`, `src/theme/fonts.ts`): `Space Grotesk` (`display`), `Inter` (`sans`), `JetBrains Mono` (`mono`), `Caveat` (`handwritten`).
  - Captions & Audio: Burned-in kinetic `CaptionsOverlay` is **ON by default** in the lower-middle caption band; `VoiceoverTrack` (`public/voiceover/*.mp3`), `<BackgroundMusic />` (`volume={0.08}`), and `<Sfx />` cues (`public/sfx/*.mp3`).
- **Visual & Pacing Rules:**
  - **Frame 0 must hook immediately** (no fade-from-black; readable as a Shorts frame-picker freeze-frame).
  - **Headerless by default (`showHeader={false}`):** skip repetitive eyebrows/titles on every beat — let visuals, custom SVGs, diagrams, and kinetic captions carry the story.
  - Anchor all key transitions and `<Sfx>` cues to spoken words via `cueFrame()` / `wordFrame()`.

---

## Starter Demo Breakdown *(replace completely for each new Short)*

### Chapter 01 — Hook (`01-hook`, paragraphs: 1)

**Goal:** Deliver an immediate visual hook on frame 0 without wasting vertical space on repetitive headers.

- **Paragraph 1 — Opening Hook:**
  - **Visuals:** Instant frame-0 hero headline + glowing thesis callout with `Caveat` annotation + 2-column vertical stats above the caption band.
  - **Motion & `cueFrame` cues:** On `"Replace"` → pop in thesis card; on `"hook"` → `pop-in` SFX + 2-column stats; on `"narration"` → `chime-positive` SFX + synced duration card.

---

### Chapter 02 — Main Point (`02-main-point`, paragraphs: 2)

**Goal:** Demonstrate a purely visual beat (no title or eyebrow header) using a top-to-bottom vertical pipeline diagram.

- **Paragraph 2 — Sync Pipeline:**
  - **Visuals:** `CodePanel` (`content/voiceover.md`) → `VerticalFlowConnector` (`MP3` & `JSON` packets) → 2-column `NodeBox` outputs (`voiceover/*.mp3`, `timings/*.json`) → compact `CheckRow`.
  - **Motion & `cueFrame` cues:** On `"Split"` → `slide` SFX + reveal code; on `"maps"` → `magnetic-snap` SFX + draw vertical connectors; on `"voiceover"` → `data-blip` SFX + `MP3` packet; on `"Whisper"` → `success-ding` SFX + `JSON` packet + `MeterBar` to 100%.

---

## Closing Beat / Loop Notes (when adding your final chapter)

- End on a single visual payoff or seamless loop back to the opening hook — avoid long fade-outs.
- If linking to a full-length video, optionally show a brief `RelatedVideoCTA` card pointing down toward YouTube Shorts' native Related Video link button at the bottom of the screen.
