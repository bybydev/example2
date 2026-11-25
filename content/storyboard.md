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
  - Typography: `Inter` for headlines & labels, `JetBrains Mono` for numbers, metrics, dimensions, and code/IDs.
- **Animation rule:** Anchor all key transitions to spoken cues via `cueFrame()` / `wordFrame()` (`src/ui/motion.ts`, `src/lib/timeline.ts`) rather than hardcoded frame offsets.

---

## Chapter 01 — Hook (`01-hook`, paragraphs: 1)

**Goal:** Open with a concrete hook or paradox, frame the core question, and establish the video's thesis.

- **Paragraph 1 — Opening Hook:**
  - **Beat:** State the hook and immediately show why it matters.
  - **Visuals:** Clean hero title (`SectionTitle`) + glowing thesis `Card` with key metric `Pill`s.
  - **Motion & `cueFrame` cues:** On `"hook"` → highlight thesis banner with `slideUpStyle()`.

---

## Chapter 02 — Main Point (`02-main-point`, paragraphs: 2)

**Goal:** Introduce the primary contrast or mental model visually.

- **Paragraph 2 — Core Comparison:**
  - **Beat:** Contrast Approach A vs. Approach B so the viewer sees the trade-off immediately.
  - **Visuals:** Two-column `Card` comparison with `DataChip`s and animated `MeterBar`s, plus a matching `Stage` `legend`.
  - **Motion & `cueFrame` cues:** On `"paragraph"` → slide in contrasting card and animate `MeterBar` via `progressBetween()`.

---

## Outro & End-Screen Notes (when adding your final chapter)

- Mirror the opening contrast in one clean synthesis card so viewers leave with a single mental model.
- Reserve clean visual space in the final ~15–20 seconds for YouTube end-screen cards.
