# Sound Effects (`public/sfx/`)

Quick reference for when to use each sound effect in Remotion scenes (`staticFile('sfx/<name>.mp3')`).

All files are royalty-free from Mixkit (Mixkit Sound Effects Free License).

---

## Transitions

| File | Duration | When to use |
| --- | --- | --- |
| `whoosh-soft.mp3` | `2.32s` | Smooth chapter changes, gentle camera pans, or slow background reveals. |
| `whoosh-fast.mp3` | `1.76s` | Snappy scene cuts, fast motion-graphic entrances, or energetic topic shifts. |
| `swish.mp3` | `0.78s` | Quick card flips, arrow/pointer movements, or tight micro-transitions. |

## UI & Diagrams

| File | Duration | When to use |
| --- | --- | --- |
| `pop-in.mp3` | `0.38s` | Appearing badges, `Card` / `Pill` / `DataChip` callouts, or diagram nodes popping onto screen. |
| `pop-out.mp3` | `2.16s` | Dismissing overlays, collapsing panels, or removing elements from a diagram. |
| `click-subtle.mp3` | `1.10s` | Subtle interface selections, step-by-step highlights, or toggling states. |
| `slide.mp3` | `1.65s` | Sliding drawers, horizontal/vertical panel reveals, or moving diagram blocks into place. |

## Connections & Tech Diagrams

| File | Duration | When to use |
| --- | --- | --- |
| `magnetic-snap.mp3` | `1.13s` | Two nodes, blocks, or MCP/API integrations snapping or plugging together. |
| `toggle-on.mp3` | `2.35s` | Flipping a setting, feature flag, or comparison state on. |
| `toggle-off.mp3` | `1.33s` | Flipping a setting, feature flag, or comparison state off. |
| `ping-radar.mp3` | `2.21s` | Searching a database, scanning documents (RAG), or locating a result. |
| `data-blip.mp3` | `1.29s` | Short sci-fi telemetry chirps when packets or signals move along a connection line. |
| `power-up.mp3` | `5.02s` | Turning a system, server, or pipeline on. |
| `power-down.mp3` | `3.19s` | Showing a process shutting down, disconnecting, or failing. |

## Data, Charts, Numbers & Money

| File | Duration | When to use |
| --- | --- | --- |
| `tick-digital.mp3` | `0.20s` | Individual counter increments, meter ticks, or step-by-step timeline markers. |
| `typing-loop.mp3` | `19.63s` | Code blocks, terminal commands, or typewriter text animations (trim/fade or loop as needed). |
| `cash-chime.mp3` | `2.50s` | Highlighting costs, savings, pricing breakdowns, or subscription/token math. |
| `scale-up.mp3` | `1.95s` | Ascending tones for bar charts growing or metrics improving. |
| `scale-down.mp3` | `1.99s` | Descending tones for latency dropping or costs shrinking. |
| `clock-tick.mp3` | `16.85s` | Waiting on a slow response, reasoning delay, or time passing (trim/fade to fit window). |

## Emphasis, Plot Twists & Warnings

| File | Duration | When to use |
| --- | --- | --- |
| `chime-positive.mp3` | `2.80s` | "Aha" moments, key takeaways, or positive metric reveals. |
| `thud-low.mp3` | `1.10s` | Warnings, bottlenecks, high-cost numbers, or heavy problem statements. |
| `riser-short.mp3` | `6.54s` | Building tension right before a major reveal, benchmark result, or punchline. |
| `bass-drop.mp3` | `7.93s` | Big chapter title cards or major statistics. |
| `tape-stop.mp3` | `9.48s` | Interrupting a misconception ("Wait—that's not actually how it works"). |
| `glitch-short.mp3` | `1.02s` | Highlighting a bug, hallucination, or broken system. |
| `error-buzz.mp3` | `1.25s` | Soft, muted error tone for an X mark, rejected request, or bad practice. |
| `success-ding.mp3` | `1.62s` | Checkmark, passing test, or completed task. |

## Text, Paper & Interface Actions

| File | Duration | When to use |
| --- | --- | --- |
| `mouse-click.mp3` | `0.40s` | Cursor clicking a button in a UI mockup. |
| `camera-shutter.mp3` | `1.51s` | Showing a screenshot, quote card, or freezing a frame. |
| `page-turn.mp3` | `0.45s` | Switching between documents, prompts, or examples. |
| `marker-draw.mp3` | `1.24s` | Highlighting text or drawing an arrow/circle around a key term. |
| `bubble-pop.mp3` | `1.06s` | Chat messages appearing in an AI conversation mockup. |

---

## Remotion Usage Notes

- Keep SFX subtle relative to voiceover (typically `volume={0.25}` to `0.45`, lower for loops like `typing-loop.mp3` and `clock-tick.mp3`).
- Anchor `<Sequence from={...}>` to `cueFrame(...)` / `wordFrame(...)` from `src/ui/motion.ts` or `src/lib/timeline.ts` so audio cues stay synced to narration.
