# Storyboard — AI Agent Harnesses Explained

- **Target length:** **~18–19 minutes** (hard floor: `≥ 10:00`, no upper cap — prioritizing crystal-clear explanations and readable visual pacing over squeezing concepts together; **~3,115 words** across 9 chapters / 37 paragraphs, calibrated against the configured voice's `180 WPM` placeholder baseline in `src/generated/timeline.json`, expecting `~168–178 WPM` for technical narration + `30.7s` lead/tail/chapter padding from `video.config.json`)
- **Audience:** Software engineers, AI builders, and technical developers who use LLM APIs or coding agents (**Claude Code**, **Codex**, **Gemini CLI**, **Cursor**, **Windsurf**, **OpenCode**, **Aider**, **Cline**, **Devin**, **OpenHands**, or custom SDK agents) and want a deep, practical systems mental model for how production agent harnesses actually work.
- **Real-world harnesses & domains woven into concepts:** Rather than a standalone product listicle, famous harnesses appear where they popularized or exemplify a specific engineering pattern (**SWE-agent** → ACI tool design, **Aider** → diff edits, **Manus** → KV-cache stability & filesystem memory, **Claude Code** → thin Unix loop, hooks & subagents, **Cursor / Windsurf** → IDE LSP verification, **Codex / Devin / OpenHands / GitHub Copilot Agent** → sandboxed cloud execution, **Claude Agent SDK / OpenAI Agents SDK / LangChain Deep Agents (on LangGraph)** → builder runtimes & harnesses). Chapter 02 (`P8`) also zooms out to show how the exact same harness engine powers **Browser / Computer-Use**, **Deep Research**, and **Support / SRE / Ops** agents before using coding agents as our concrete lab.
- **Recurring concrete thread:** A realistic repo bug — **fixing a token-refresh race condition in `auth.ts`** — threads selectively across concrete execution beats (`P1`, `P10`, `P12`, `P17`, `P21–P22`, `P24`, `P31`) to ground abstractions without forcing it into macro/suite-level beats (`P30`, `P33`).
- **Canvas & visual system (`src/theme/tokens.ts`, `src/ui/Stage.tsx`):** 1920×1080, 30 fps, safe margins `120px` X / `80px` Y (~`1680×850px` usable stage below `Stage` header)
  - Background: `#0B1020` | Surface cards: `#141B30` | Subtle border: `rgba(255,255,255,0.12)`
  - **Semantic color coding (keep consistent across every chapter):**
    - **Cyan (`#38BDF8`)** — The **Harness** layer: orchestration loop, tools, filesystem/state, subagents, observability
    - **Amber (`#F59E0B`)** — The **Model** & resource pressure: LLM inference, token budgets, context window, latency/cost trade-offs
    - **Emerald (`#34D399`)** — **Reliability & wins**: verification loops, prompt caching, deterministic hooks, sandboxing, passing tests
    - **Rose (`#FB7185`)** — **Failure modes**: context rot, runaway loops, tool bloat, unsafe execution, brittle scaffolding
  - Typography (`public/fonts/`, `src/theme/fonts.ts`): `Space Grotesk` (`display`) for titles & thumbnails, `Inter` (`sans`) for body & captions, `JetBrains Mono` (`mono`) for code, badges, and counters, `Caveat` (`handwritten`) for callout annotations.
  - Audio (`src/lib/audio.tsx`): `VoiceoverTrack` (`public/voiceover/*.mp3`), global `<BackgroundMusic />` mounted once in `src/Video.tsx` (`public/music/bg-ambient.mp3`, `volume={0.08}`, `fadeOutFrames={36}`), and typed `<Sfx />` cues (`public/sfx/*.mp3`).
- **Animation & layout rules:**
  - Anchor all key transitions and SFX cues to spoken words via `cueFrame()` / `wordFrame()` (`src/ui/motion.ts`, `src/lib/timeline.ts`) rather than hardcoded frame offsets.
  - Pass `{ keepAtEnd: true }` to `sceneWindow()` on the **last paragraph of every chapter** (`P3`, `P8`, `P13`, `P19`, `P22`, `P27`, `P30`, `P34`, `P37`) so visuals stay calmly on screen across the `0.6s` `chapterGapSeconds` gap.
  - Because `SvgLink` draws straight `<line>` segments (`src/ui/diagrams.tsx`), lay out closed-loop diagrams (`P5`, `P9`, `P23`) as 4-node rectangle/diamond polygons so forward and return arrows never overlap.
  - Trim or lower volume on long SFX (`typing-loop`, `clock-tick`, `tape-stop`, `riser-short`, `bass-drop`, `power-up`, `power-down`) so they never overpower narration.

---

## Pacing & Chapter Budget Overview

| # | Chapter ID | Title | Track / Pillar | Paragraphs | Target Words | Est. Duration (`168–178 WPM` + pad) |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | `01-hook` | The Harness Paradox | Intro | 1–3 (3) | ~255 | ~1:28–1:34 |
| 02 | `02-model-vs-harness` | Model vs. Harness vs. Framework | Framing | 4–8 (5) | ~420 | ~2:25–2:34 |
| 03 | `03-the-core-loop` | The Agent Loop & Tool Calling | Pillar 01 | 9–13 (5) | ~430 | ~2:28–2:37 |
| 04 | `04-context-engineering` | Context Management & Cache Economics | Pillar 02 | 14–19 (6) | ~500 | ~2:53–3:03 |
| 05 | `05-memory-and-state` | Memory & Durable State Across Sessions | Pillar 03 | 20–22 (3) | ~255 | ~1:28–1:34 |
| 06 | `06-verification-and-guardrails` | Verification, Permissions & Sandboxes | Pillar 04 | 23–27 (5) | ~425 | ~2:27–2:36 |
| 07 | `07-next-level-subagents` | Next Level: Sub-agents, Delegation & Scale | Pillar 05 (Next Level) | 28–30 (3) | ~260 | ~1:30–1:36 |
| 08 | `08-evals-and-evolution` | Observability, Evals & Build-to-Delete | Pillar 06 | 31–34 (4) | ~335 | ~1:56–2:03 |
| 09 | `09-synthesis-and-outro` | The OS Mental Model & Outro | Synthesis | 35–37 (3) | ~235 | ~1:22–1:27 |
| **Total** | **9 chapters** | | **6 Pillars (1:1)** | **37** | **~3,115** | **~18:00–19:00** |

*(Includes `30.7s` total non-speech padding from `video.config.json`: `37 × 0.7s` lead/tail + `8 × 0.6s` chapter gaps. `P37` targets `~55–60` words for an `~18–21s` YouTube end-screen safe zone.)*

---

## Chapter 01 — The Harness Paradox (`01-hook`, paragraphs: 1–3)

**Goal:** Open with a concrete paradox — the exact same LLM tackling the `auth.ts` race-condition task with wildly different outcomes depending on its harness — establish `Agent = Model + Harness`, and preview the 6 pillars matching Chapters 03–08 1:1.

- **Paragraph 1 — Identical Model, Wildly Different Results (~90 words):**
  - **Beat:** Put two coding agents powered by the **identical** frontier LLM on the exact same repo task (fixing a token-refresh race condition in `auth.ts`) — the classic **SWE-bench / Terminal-Bench** harness gap seen across tools like **Claude Code**, **Codex**, **Cursor**, **Gemini CLI**, **OpenCode**, **Devin**, and **OpenHands**: Agent A stalls in a broken retry loop while Agent B isolates the bug and passes tests cleanly.
  - **Visuals:** Split comparison `Card`s (Rose `Agent A: Failed` vs. Emerald `Agent B: Tests Passing`) linked to a shared top Amber `NodeBox` (`Identical Frontier Model`) via `SvgLink`, with an `auth.ts` task `Pill`, subtle bottom `DataChip` strip of real-world harness names, and animated `MeterBar`s showing diverging solve rates.
  - **Motion & `cueFrame` cues:** On `"identical"` → `pop-in` SFX + center Amber model node; on `"fails"` → `error-buzz` SFX + Rose failure card; on `"passes"` → `chime-positive` SFX + Emerald win card + `MeterBar` climbs.

- **Paragraph 2 — The Core Thesis (`Agent = Model + Harness`, ~85 words):**
  - **Beat:** Reveal the missing variable: the **harness**. Frame the OS analogy — a raw LLM is like a CPU without an operating system; it can reason, but it cannot safely touch disk, manage memory, or verify its own work.
  - **Visuals:** Centered thesis equation card (`Model` [Amber] + `Harness` [Cyan] = `Reliable Agent` [Emerald]) with `Caveat` handwritten annotation `"CPU + OS"` underneath.
  - **Motion & `cueFrame` cues:** On `"harness"` → `bass-drop` SFX (`volume={0.22}`, `durationInFrames={90}`) + glowing Cyan equation banner; on `"operating"` → `marker-draw` SFX + handwritten annotation reveal.

- **Paragraph 3 — The 6-Pillar Architecture Map (~80 words, `keepAtEnd: true`):**
  - **Beat:** Preview the 6 chapters of a complete harness (after first separating model, harness, and framework): four single-agent foundations (`01` Loop & Tools, `02` Context & Caching, `03` Memory & State, `04` Verification & Sandboxes), followed by two next-level layers (`05` Sub-agents & Scale, `06` Evals & Evolution).
  - **Visuals:** 3×2 grid of `NodeBox` pillar cards (`01`–`04` Cyan single-agent core; `05`–`06` Emerald `NEXT LEVEL` / `PRODUCTION` badges) matching Chapters 03–08 1:1.
  - **Motion & `cueFrame` cues:** On each single-token pillar keyword (`"loop"`, `"context"`, `"memory"`, `"verification"`, `"delegation"`, `"evals"`) → `click-subtle` / `pop-in` SFX + staggered card glow.

---

## Chapter 02 — Model vs. Harness vs. Framework (`02-model-vs-harness`, paragraphs: 4–8)

**Goal:** Give viewers a sharp architectural boundary between the model, the harness, and heavyweight agent frameworks, explain why thin harnesses win, and show that the exact same harness architecture powers coding, browser, research, and ops agents alike.

- **Paragraph 4 — The Three-Layer Stack (~85 words):**
  - **Beat:** Separate **Model** (stateless token prediction — Claude, GPT, Gemini), **Harness** (runtime loop, tools, context, state, permissions — what **Claude Code**, **Codex CLI**, **Gemini CLI**, **Cursor**, and **Windsurf Cascade** actually are under the hood), and **Application / UX** (terminal, IDE panel, or PR workflow).
  - **Visuals:** Three stacked horizontal layer `Card`s with recognizable example `DataChip`s per layer, connected by vertical `SvgLink` + `SvgPacket` flows (`Tokens` Amber, `Actions & State` Cyan, `User Intent` Neutral).
  - **Motion & `cueFrame` cues:** On `"model"` → `slide` SFX + bottom Amber layer; on `"harness"` → `magnetic-snap` SFX + glowing middle Cyan layer; on `"application"` → `pop-in` SFX + top layer.

- **Paragraph 5 — Stateless API Call vs. Stateful Harness Loop (~85 words):**
  - **Beat:** Contrast a single chat completion (`Prompt → Response`, stateless and blind) against a harness that turns the LLM into an iterative controller interacting with a live environment.
  - **Visuals:** Left `Card` (`Raw LLM API`, Amber single arrow) vs. Right `Card` (`Agent Harness`, 4-node Cyan/Amber rectangle loop: `Model → Action → Environment → Feedback → Model` with non-overlapping straight `SvgLink`s and circulating `SvgPacket`).
  - **Motion & `cueFrame` cues:** On `"stateless"` → `whoosh-soft` SFX + left single-shot diagram; on `"environment"` → `power-up` SFX (`volume={0.22}`, `durationInFrames={65}`) + right 4-node loop lights up.

- **Paragraph 6 — Why Rigid Frameworks Break ("The Bitter Lesson", ~85 words):**
  - **Beat:** Contrast a **static rigid framework** (hardcoded prompt chains, fixed multi-agent DAGs, brittle regex parsers that break whenever models change) against a **thin Unix-style harness** (minimal general primitives + environment feedback, as popularized by **Claude Code**, **OpenCode**, and **Aider**).
  - **Visuals:** Left Rose tangle of brittle `NodeBox`es (`Fixed Chain`, `Router`, `Parser`, `Retry Wrapper`) cracking/dimming vs. Right clean Cyan minimal primitives (`Shell`, `Files`, `Search`, `Verify`) tagged with `Claude Code / OpenCode / Aider` `Pill`.
  - **Motion & `cueFrame` cues:** On `"rigid"` → `thud-low` SFX + complex Rose DAG appears; on `"breaks"` → `glitch-short` SFX + Rose nodes dim/strike; on `"minimal"` → `chime-positive` SFX + clean Cyan primitives glow.

- **Paragraph 7 — What Good Harnesses Actually Own (~80 words):**
  - **Beat:** Clarify the division of labor: the **model** owns reasoning and planning; the **harness** surrounds it with deterministic execution, context hygiene, safety boundaries, and ground-truth feedback.
  - **Visuals:** Centered **Core + Perimeter** radial/orbital layout (breaking up the split-column rhythm): glowing Amber center `NodeBox` (`Model Core: Reasoning & Planning`) connected via `SvgLink`s to 4 surrounding Cyan perimeter `Card`s (`Deterministic Exec`, `Context Hygiene`, `Safety Perimeter`, `Ground-Truth Feedback`).
  - **Motion & `cueFrame` cues:** On `"reasoning"` → `pop-in` SFX + center Amber core; on `"deterministic"` → `magnetic-snap` SFX + 4 Cyan boundary cards lock into place around the core.

- **Paragraph 8 — One Harness Architecture, Many Agent Domains (~85 words, `keepAtEnd: true`):**
  - **Beat:** Zoom out briefly before diving deep: this exact same harness architecture doesn't only power coding agents — it powers **browser and computer-use agents** (like **ChatGPT Agent / CUA**, **Claude Computer Use**, **Browser Use**, and **Manus**, using `click`, `type`, and `screenshot`), **deep research agents** (`search`, `fetch`, citation checks), and **support, SRE, and operations agents** (reading logs/tickets while gating refunds or prod changes behind human approval). Explain why we use coding agents as our concrete laboratory for the rest of this video: compilers and unit tests give crystal-clear ground truth, and every principle transfers directly.
  - **Visuals:** 2×2 grid of domain `Card`s beneath a shared `Same Harness Engine` Cyan `Pill`: `Coding Agents` (Emerald/Cyan, tagged `"Our Lab"` — `Tools: Shell, Edit, Grep` / `Verify: Tests + Types`), `Browser & Computer-Use` (`Tools: Click, Type, DOM` / `Verify: Visual State + Approvals`), `Deep Research` (`Tools: Search, Fetch, DB` / `Verify: Citation Grounding`), and `Support & Ops` (`Tools: Logs, Tickets, APIs` / `Verify: Policy + Human Gate`).
  - **Motion & `cueFrame` cues:** On `"browser"` → `pop-in` SFX + Browser card; on `"research"` → `click-subtle` SFX + Research card; on `"operations"` → `click-subtle` SFX + Ops card; on `"laboratory"` → `chime-positive` SFX + Coding card glows as our running lens.

---

## Chapter 03 — The Agent Loop & Tool Calling (`03-the-core-loop`, paragraphs: 9–13)

**Eyebrow:** `PILLAR 01 — LOOP & TOOLS`
**Goal:** Give viewers a crystal-clear, unhurried walkthrough of the `Think → Act → Observe → Repeat` loop, show step by step how the model calls tools via JSON schemas without executing code itself, and explain why tool ergonomics directly determine agent intelligence.

- **Paragraph 9 — The 15-Line Core Loop (`Think → Act → Observe → Repeat`, ~85 words):**
  - **Beat:** Open the hood on the shockingly simple `while` loop at the heart of every agent harness: **Think** (model reasons over the message history), **Act** (request an operation in the world), **Observe** (receive real environment output), and **Repeat** until the task is solved or a stop condition triggers.
  - **Visuals:** Left `CodePanel` (`harness-loop.ts`, ~10 lines of clean TypeScript `while (true)` loop) paired with Right 4-node rectangle loop clearly labeled **`1. Think` → `2. Act` → `3. Observe` → `4. Repeat`** using straight `SvgLink` + circulating `SvgPacket`.
  - **Motion & `cueFrame` cues:** On `"think"` → `typing-loop` (`volume={0.14}`, `durationInFrames={65}`) + code lines & Think node light up; on `"act"` → `pop-in` SFX + Act node; on `"observe"` → `data-blip` SFX + Observe node; on `"repeat"` → `swish` SFX + loop closes.

- **Paragraph 10 — How the Model Actually Calls a Tool (`auth.ts`, ~90 words):**
  - **Beat:** Demystify the exact tool-calling handoff so there's zero magic: the LLM **never runs code or touches your disk itself**. Instead, the harness passes tool JSON schemas in the API request; the model outputs a structured JSON tool call with a `tool_call_id` (`read_file({ path: "auth.ts" })`); the **harness** parses it, runs the real function on the machine, and appends the file contents back into the conversation as a paired `tool_result` message matching that ID.
  - **Visuals:** 3-column horizontal sequence (`Model` [Amber] → `Harness Runtime` [Cyan] → `Local Machine / Repo` [Emerald]) with two compact `CodePanel` snippets below (`JSON Tool Call + call_id` vs. paired `tool_result` payload) and animated `SvgPacket`s crossing back and forth.
  - **Motion & `cueFrame` cues:** On `"never"` → `click-subtle` SFX + Model boundary highlights; on `"JSON"` → `pop-in` SFX + `read_file("auth.ts")` JSON packet flies to Harness; on `"executes"` → `data-blip` SFX + Harness reads repo; on `"result"` → `chime-positive` SFX + `tool_result` packet returns to Model.

- **Paragraph 11 — Tool Sprawl, MCP Bloat & Orthogonal Primitives (~85 words):**
  - **Beat:** Explain why dumping 60 overlapping tools — or connecting five MCP servers that inject 70 verbose JSON schemas before turn 1 — bloats prompt tokens and degrades tool choice, whereas 6–10 sharp, composable primitives (read, edit, search, shell, web) consistently outperform.
  - **Visuals:** Left cluttered Rose grid of MCP/tool `DataChip`s + Amber `MeterBar` (`Pre-Turn Schema Overhead: ~25K tokens`) vs. Right 6 crisp Cyan `DataChip`s + Emerald `MeterBar` (`Selection Accuracy: High`).
  - **Motion & `cueFrame` cues:** On `"schemas"` → `thud-low` SFX + cluttered Rose MCP/tool chips flood left; on `"composable"` → `magnetic-snap` SFX + clean Cyan primitives snap into alignment.

- **Paragraph 12 — Tool Ergonomics & Actionable Errors (`SWE-agent` ACI + `auth.ts`, ~85 words):**
  - **Beat:** Show **SWE-agent**'s breakthrough **Agent-Computer Interface (ACI)** insight: tools are a **UI for the LLM**. When our agent tries to patch `auth.ts`, contrast a cryptic error (`Error: exit code 1`) against a harness-crafted error (`Match not found in auth.ts; lines 40–48 shown; narrow your target`).
  - **Visuals:** Compact vertical before→after transform inside the center stage (avoiding consecutive split-column streaks): Top compact 3-line Rose `CodePanel` (`Opaque Error`, `fontSize={17}`) → vertical Cyan `SvgLink` upgrade arrow → Bottom compact 4-line Emerald `CodePanel` (`Actionable Error + Recovery Hint`, `fontSize={17}`) + `Caveat` annotation `"ACI: Tools are UI for the model"` anchored cleanly beside the arrow.
  - **Motion & `cueFrame` cues:** On `"cryptic"` → `error-buzz` SFX + top Rose panel; on `"actionable"` → `chime-positive` SFX + vertical upgrade arrow draws + bottom Emerald panel reveals + `marker-draw` annotation.

- **Paragraph 13 — Targeted Diffs vs. Full-File Rewrites (~85 words, `keepAtEnd: true`):**
  - **Beat:** Concrete coding-agent example: why harnesses like **Aider**, **Claude Code**, and **Cursor** rely on targeted search-and-replace or diff-merge edits (and line-numbered reads) instead of asking models to regenerate 800-line files — slashing output tokens, cutting latency, and preventing accidental deletions.
  - **Visuals:** Two-column `StatCallout` + compact `CodePanel` diff view comparing `Full Rewrite` (Amber/Rose: high output tokens, slow) vs. `Targeted Patch` (Emerald: 10× fewer output tokens, instant verification, `Aider / Claude Code / Cursor` badge).
  - **Motion & `cueFrame` cues:** On `"rewrite"` → `clock-tick` (`volume={0.18}`, `durationInFrames={55}`) + Amber counter climbs; on `"targeted"` → `scale-down` SFX + Emerald token savings callout pops in.

---

## Chapter 04 — Context Management & Cache Economics (`04-context-engineering`, paragraphs: 14–19)

**Eyebrow:** `PILLAR 02 — CONTEXT & CACHING`
**Goal:** Show clearly how the harness manages the LLM's finite working memory — what enters the window, fighting context rot, exploiting prompt caching, trimming noisy tool outputs, loading skills progressively, and summarizing/compacting long sessions cleanly.

- **Paragraph 14 — Context Is RAM (and Context Rot Is Real, ~85 words):**
  - **Beat:** Even with 200K–1M context windows, reasoning accuracy degrades long before the limit as irrelevant logs, stale files, and failed attempts pile up ("context rot"). Deciding what enters and stays in the window is a core harness responsibility.
  - **Visuals:** Horizontal token-window bar filling with color-coded segments (Cyan system/tools, Emerald relevant code, Rose giant stack traces & stale diffs) + declining `Signal-to-Noise` `MeterBar`.
  - **Motion & `cueFrame` cues:** On `"rot"` → `thud-low` SFX + Rose noise segments flood the bar; on `"degrades"` → `scale-down` SFX + signal meter drops.

- **Paragraph 15 — Prompt Caching & Prefix Stability (`Manus` & `Claude Code`, ~85 words):**
  - **Beat:** Explain the economic engine publicized by teams like **Manus** and **Claude Code**: **KV / prompt caching**. Keeping the system prompt and tool schemas token-identical at the prefix and appending turns monotonically lets the provider reuse cached attention states — slashing input cost and time-to-first-token across 30-turn runs.
  - **Visuals:** Layered prefix diagram (`Static Prefix: System + Tools [CACHED]` Emerald lock badge → `Append-Only History` Cyan → `New Turn` Amber) + `StatCallout` (`Cached Input Savings`, `AnimatedNumber`).
  - **Motion & `cueFrame` cues:** On `"caching"` → `magnetic-snap` SFX + Emerald cached prefix locks; on `"slashes"` → `cash-chime` SFX + cost `AnimatedNumber` drops.

- **Paragraph 16 — Cache-Busting Anti-Patterns (~80 words):**
  - **Beat:** Call out subtle harness bugs that silently invalidate prompt caches downstream of the edit: injecting live timestamps into the system prompt (busting 100% of the prefix), dynamically reordering tool schemas, or mutating earlier messages mid-loop.
  - **Visuals:** 3 `CheckRow`s marked with Rose `✗` (`Timestamp in System Prompt`, `Dynamic Tool Order`, `Mid-History Edits`) above a live cache-hit bar flashing Emerald → Rose (`CACHE MISS`).
  - **Motion & `cueFrame` cues:** On `"timestamp"` → `glitch-short` SFX + first row triggers miss; on `"reordering"` → `error-buzz` SFX + cache bar resets to `0%`.

- **Paragraph 17 — Tool Output Truncation & Offloading to Disk (`auth.test.ts`, ~85 words):**
  - **Beat:** Give tool-output hygiene its own focused beat: when `auth.test.ts` fails and dumps a 10,000-line stack trace, dumping it raw into context instantly drowns the model. Instead, the harness truncates stdout to a crisp head/tail summary and writes the full output to a temp file (`/tmp/test.log`) so the agent can `grep` specific lines only if needed.
  - **Visuals:** Clean horizontal pipeline: `10,000-line auth.test.ts log` (Rose tall block) → `Harness Truncator` (Cyan filter box) → top `40-line Head/Tail Summary` (Emerald `CodePanel`) + bottom `Saved: /tmp/test.log (grep on demand)` `DataChip`.
  - **Motion & `cueFrame` cues:** On `"drowns"` → `thud-low` SFX + tall Rose log block slams in; on `"truncates"` → `swish` SFX + filter collapses it into a tight Emerald summary; on `"disk"` → `pop-in` SFX + `/tmp/test.log` pointer chip appears.

- **Paragraph 18 — Progressive Disclosure & Lazy Skills Without Busting Cache (~80 words):**
  - **Beat:** Dedicate a clear beat to **progressive disclosure**: instead of stuffing 20,000 tokens of repo guides, workflow docs, and dormant tool instructions into Turn 1, modern harnesses expose a tiny static manifest and load full skill files **lazily into the appended message history** (or invoke CLI tools via shell) rather than mutating the static prefix — keeping both context lean and prompt caches intact.
  - **Visuals:** Left compact `Index Card` (`Skill Manifest: ~400 tokens`, Cyan) connected via dashed `SvgLink`s to 4 dormant skill/doc `NodeBox`es (`Auth Guidelines`, `Deploy Rules`, `DB Migrations`, `UI Kit`); only `Auth Guidelines` toggles active (`Emerald`) and appends cleanly to the tail while the static prefix lock stays green.
  - **Motion & `cueFrame` cues:** On `"manifest"` → `slide` SFX + tiny index card appears; on `"lazily"` → `toggle-on` SFX + `Auth Guidelines` card lights up Emerald and appends without breaking the prefix lock.

- **Paragraph 19 — Structured Compaction vs. Naive Trimming (~85 words, `keepAtEnd: true`):**
  - **Beat:** When a long session nears its context threshold, a strong harness runs **structured compaction / summarization** — distilling completed work, modified files, verified facts, and next steps into a clean handoff block (triggered rarely at ~75–85% so you pay the one-time cache reset only when needed) — rather than naively dropping early turns (which breaks `tool_call_id`/`tool_result` pairs and erases the original goal).
  - **Visuals:** Context gauge hitting 80% Amber threshold → `Compactor` Cyan lens → clean compact Emerald checkpoint card (`Goal`, `Changed Files`, `Verified`, `Next Step`) resetting context bar cleanly to ~15%.
  - **Motion & `cueFrame` cues:** On `"threshold"` → `riser-short` (`volume={0.2}`, `durationInFrames={55}`) + bar hits 80%; on `"compaction"` → `whoosh-fast` SFX + bar compresses; on `"checkpoint"` → `success-ding` SFX + Emerald summary card locks in.

---

## Chapter 05 — Memory & Durable State Across Sessions (`05-memory-and-state`, paragraphs: 20–22)

**Eyebrow:** `PILLAR 03 — MEMORY & DURABLE STATE`
**Goal:** Explain how harnesses preserve memory and state across steps and across fresh context windows so single-agent runs don't stall on multi-hour engineering tasks.

- **Paragraph 20 — Why Single-Window Agents Stall on Long Tasks (~85 words):**
  - **Beat:** On multi-hour engineering tasks, single-window agents fail in two predictable ways: trying to one-shot too much until context fills mid-change, or losing sight of remaining edge cases across steps and declaring victory prematurely.
  - **Visuals:** Horizontal progress timeline showing an Amber trajectory peaking early then flatlining with Rose callouts (`Context Exhausted`, `Premature "Done!"`, `Forgotten Edge Cases`).
  - **Motion & `cueFrame` cues:** On `"prematurely"` → `error-buzz` SFX + false `"Done!"` badge shakes; on `"lose"` → `power-down` SFX (`volume={0.25}`, `durationInFrames={60}`) + timeline dims.

- **Paragraph 21 — The Filesystem as Durable Memory (`Manus` & `auth.ts`, ~85 words):**
  - **Beat:** Show how harnesses like **Manus** (`todo.md` recitation + workspace files) and coding agents treat the repo itself as durable external memory: structured JSON checklists (`feature-list.json`, preferred over freeform Markdown because models are less likely to corrupt structured schemas), progress logs, and clean `git` commits for each milestone of the `auth.ts` fix so a fresh context window can orient itself in seconds.
  - **Visuals:** Central `NodeBox` (`Workspace Disk`, Cyan) holding 3 `DataChip` artifacts (`todo.md`, `feature-list.json`, `git log`) feeding Session 1 → Session 2 → Session 3 `NodeBox`es via `SvgLink` + `SvgPacket`.
  - **Motion & `cueFrame` cues:** On `"disk"` → `slide` SFX + workspace artifacts appear; on `"commits"` → `pop-in` SFX + git checkpoint badges snap in; on `"orient"` → `data-blip` SFX + packet feeds fresh session.

- **Paragraph 22 — The Initializer + Coding Agent Session Pattern (`auth.ts`, ~85 words, `keepAtEnd: true`):**
  - **Beat:** Break down **Anthropic's** two-phase long-running harness pattern: an **Initializer Agent** runs once to scaffold `init.sh`, a structured `feature-list.json`, a progress log (`claude-progress.txt`), and a clean baseline commit; each subsequent **Coding Agent** session boots fresh, reads state, finishes one scoped item (reproduce race → add mutex → verify concurrency tests), commits, and updates the log.
  - **Visuals:** Two-stage horizontal pipeline: Stage 1 `Initializer Agent` (Cyan) → State Handoff (`feature-list.json` + `progress.txt`) → Stage 2 repeating `Coding Agent` loop (Emerald checkmarks ticking off items 1, 2, 3).
  - **Motion & `cueFrame` cues:** On `"initializer"` → `power-up` SFX (`volume={0.22}`, `durationInFrames={65}`) + Stage 1 card lights up; on `"coding"` → `tick-digital` SFX ×3 as checklist rows flip Emerald.

---

## Chapter 06 — Verification, Permissions & Sandboxes (`06-verification-and-guardrails`, paragraphs: 23–27)

**Eyebrow:** `PILLAR 04 — VERIFICATION & SANDBOXES`
**Goal:** Show clearly how production harnesses turn probabilistic models into trustworthy systems: closed-loop verification (tests, linters, self-checks), deterministic hooks, hard sandboxing boundaries, tiered human permissions, and loop breakers.

- **Paragraph 23 — Closed-Loop Verification: Tests, Linters & Self-Checks (~90 words):**
  - **Beat:** Contrast an open-loop agent (writes code and hopes) against a closed-loop harness wired to deterministic verifiers — unit tests, typecheckers, IDE LSP/linter auto-feedback loops like **Cursor** and **Windsurf**, plus an explicit self-check pass where the agent audits its own diff against requirements before declaring done.
  - **Visuals:** Left `Card` (`Open-Loop`, Amber → Rose `"Guess & Hope"`) vs. Right `Card` (`Closed-Loop Harness`, 4-node rectangle loop: `Edit` → `LSP / Tests / Self-Check` → `Error Feedback` → `Fix` → Emerald `Pass`), with `AnimatedNumber` reliability jump.
  - **Motion & `cueFrame` cues:** On `"hopes"` → `slide` SFX + left card; on `"verification"` → `magnetic-snap` SFX + 4-node closed loop draws; on `"audits"` → `scale-up` + `success-ding` SFX. *(Avoids hyphenated cues like `"open-loop"` / `"self-check"` that Whisper can split across two tokens.)*

- **Paragraph 24 — Deterministic Hooks Over Prompt Begging (`Claude Code` + `auth.ts`, ~85 words):**
  - **Beat:** Stop begging the model in ALL CAPS (`"NEVER TOUCH .env AND ALWAYS RUN TYPECHECK"`). Harnesses like **Claude Code** enforce safety and quality invariants in code via **pre-tool** and **post-tool hooks** (`PreToolUse` / `PostToolUse`) — blocking secret reads before execution and auto-running `tsc` + targeted tests right after `auth.ts` is edited.
  - **Visuals:** Left Rose `CodePanel` (`Prompt Begging`: `"NEVER DO X!!!"`) dimming out vs. Right Cyan/Emerald hook pipeline (`PreToolUse [Policy]` → `Edit auth.ts` → `PostToolUse [tsc + test]`) with active `CheckRow`s.
  - **Motion & `cueFrame` cues:** On `"begging"` → `error-buzz` SFX + ALL-CAPS prompt dims; on `"hooks"` → `toggle-on` SFX + deterministic pre/post hook gates light up.

- **Paragraph 25 — Sandboxing & Hard Isolation Boundaries (~85 words):**
  - **Beat:** Give environment isolation its own dedicated beat: handing an LLM a bash tool means handing it arbitrary code execution. Walk through real OS/compute containment used by **Codex**, **Devin**, **OpenHands**, and **GitHub Copilot Coding Agent** — ephemeral Docker containers, microVMs, or OS-level sandboxes (Seatbelt / bubblewrap) enforcing strict writable-directory scopes and restricted network egress so a hallucinated shell command can never wreck a host machine or exfiltrate secrets. *(Git worktrees isolate branches for parallel agents in `P29`, not OS security.)*
  - **Visuals:** Concentric nested perimeter diagram (`Host Machine` [dim outer] → `Container / MicroVM / OS Sandbox` [Emerald] → `Scoped Repo FS + Network Policy` [Cyan] → `Agent Shell` [Amber] with blocked Rose arrows bouncing off the perimeter walls).
  - **Motion & `cueFrame` cues:** On `"arbitrary"` → `thud-low` SFX + Rose shell warning fires; on `"container"` → `magnetic-snap` SFX + Emerald container boundary locks; on `"egress"` → `error-buzz` SFX + blocked external arrow bounces cleanly.

- **Paragraph 26 — Tiered Permissions & Human Approval Gates (~80 words):**
  - **Beat:** Give the permission UX its own focused beat: hard sandboxes protect the machine, while **tiered permissions** balance speed with human trust. Show the 3-tier policy model — **Tier 1 (Read-Only):** auto-allowed silently (`grep`, `read`, `git status`); **Tier 2 (Scoped Workspace Writes & Local Tests):** allowed inside the sandbox; **Tier 3 (Destructive, External, or Prod Actions):** paused for explicit **human approval** (`git push`, database writes, API calls, deleting files).
  - **Visuals:** Three crisp horizontal `CheckRow` / tier cards stacked vertically (`Tier 1: Read-Only → Auto` [Emerald], `Tier 2: Scoped Edit & Test → Policy` [Cyan], `Tier 3: Push / Delete / External → Ask Human` [Amber/Rose]) with a compact interactive `Approve / Deny` modal badge lighting up on Tier 3.
  - **Motion & `cueFrame` cues:** On `"silently"` → `pop-in` SFX + Tier 1 row activates; on `"scoped"` → `click-subtle` SFX + Tier 2 row activates; on `"approval"` → `mouse-click` SFX + Tier 3 human gate highlights.

- **Paragraph 27 — Loop Breakers, Budgets & Graceful Escalation (~85 words, `keepAtEnd: true`):**
  - **Beat:** Even verified, sandboxed agents can fall into "doom loops" — retrying the same broken patch 12 times while burning tokens. Production harnesses enforce hard turn and dollar budgets, detect repeated identical failures, and escalate cleanly to a human with a structured diagnosis.
  - **Visuals:** Live telemetry `Card` (`Turns: 12/25`, `Spend: $1.84`, `Repeat Error: 3/3`) tripping a Cyan/Amber `Circuit Breaker` `NodeBox` → transitioning to a calm Emerald `Human Handoff` diagnosis card.
  - **Motion & `cueFrame` cues:** On `"doom"` → `glitch-short` SFX + repeat-error meter turns Rose; on `"breaker"` → `toggle-off` SFX + loop halts cleanly; on `"escalate"` → `chime-positive` SFX + handoff summary appears.

---

## Chapter 07 — Next Level: Sub-agents, Delegation & Scale (`07-next-level-subagents`, paragraphs: 28–30)

**Eyebrow:** `PILLAR 05 — NEXT LEVEL: SUB-AGENTS & SCALE`
**Goal:** Now that viewers understand the complete single-agent harness, level up to multi-agent delegation — showing why sub-agents are primarily for context isolation and parallelism, when *not* to delegate, and how harnesses scale from local CLIs to cloud fleets.

- **Paragraph 28 — Sub-agents for Context Isolation (~90 words):**
  - **Beat:** Once you master a single-agent harness, the next level is **sub-agents and delegation** — and the real reason harnesses like **Claude Code**, **OpenCode**, and **Cline / Roo Code** spawn sub-agents isn't sci-fi role-play personas, it's **context hygiene**: delegating a 40-file search to an isolated child keeps 50K tokens of noisy grep output out of the parent's window, returning only a crisp 300-token summary.
  - **Visuals:** Top Parent `Orchestrator` (Cyan) fanning out to 3 isolated `Subagent` `NodeBox`es (`Codebase Search`, `Docs Lookup`, `Test Runner`) via `SvgLink`; messy Amber/Rose exploration stays sealed inside child boxes while tiny crisp Emerald `Summary` `SvgPacket`s flow back up.
  - **Motion & `cueFrame` cues:** On `"delegation"` → `whoosh-fast` SFX + 3 child nodes fan out; on `"isolated"` → `ping-radar` SFX + subagents scan; on `"summary"` → `chime-positive` SFX + compact Emerald packets return to parent.

- **Paragraph 29 — Parallel Delegation & When Not to Delegate (~85 words):**
  - **Beat:** Show how harnesses scale throughput by delegating independent subtasks in parallel across isolated **git worktrees** (e.g., specialist workers for backend tests, UI updates, and docs converging on a single verification gate) — and flag the classic trap: delegating tightly coupled sequential work creates merge conflicts and coordination overhead worse than a single clean loop.
  - **Visuals:** Horizontal fan-out → fan-in diagram (`Orchestrator` → 3 parallel `Worktree Worker` `NodeBox`es → Emerald `Merge + Verify Gate`), paired with a compact Rose warning `Pill` (`Avoid for tightly coupled steps`).
  - **Motion & `cueFrame` cues:** On `"parallel"` → `power-up` SFX (`volume={0.22}`, `durationInFrames={60}`) + 3 worktree lanes light up simultaneously; on `"converge"` → `magnetic-snap` SFX + Emerald verify gate locks; on `"coupled"` → `thud-low` SFX + Rose caution callout appears.

- **Paragraph 30 — Local Interactive vs. Cloud Background Harnesses (~85 words, `keepAtEnd: true`):**
  - **Beat:** Map the ecosystem into the two production topologies teams deploy today: **Interactive Local Harnesses** (**Claude Code**, **Codex CLI**, **Gemini CLI**, **Cursor**, **Windsurf**, **OpenCode**, **Aider**, **Cline** — human-in-the-loop, low latency, local git worktree) vs. **Headless Cloud Harnesses** (**Devin**, **Codex Cloud**, **GitHub Copilot Coding Agent**, **Cursor Background Agents**, **OpenHands** — task queue, ephemeral container, async PR + CI verification), both running the exact same core harness engine.
  - **Visuals:** Split architecture diagram comparing Left (`Local CLI / IDE`, Cyan, with `DataChip` badges for `Claude Code`, `Codex CLI`, `Gemini CLI`, `Cursor`, `OpenCode`, `Aider`, `Cline`) and Right (`Cloud Async Runner`, Emerald, with `DataChip` badges for `Devin`, `Codex Cloud`, `Copilot Agent`, `Cursor Cloud`, `OpenHands`) sharing a glowing central `Core Harness Engine` `NodeBox` (`+ Agent SDKs`).
  - **Motion & `cueFrame` cues:** On `"interactive"` → `slide` SFX + left local stack; on `"background"` → `power-up` SFX (`volume={0.22}`, `durationInFrames={65}`) + right cloud container stack connects via `SvgLink`.

---

## Chapter 08 — Observability, Evals & Build-to-Delete (`08-evals-and-evolution`, paragraphs: 31–34)

**Eyebrow:** `PILLAR 06 — EVALS & EVOLUTION`
**Goal:** Teach engineers how to observe, benchmark, and evolve harnesses over time without accumulating dead scaffolding.

- **Paragraph 31 — Trajectory Observability (`auth.ts` Trace, ~85 words):**
  - **Beat:** You cannot debug an agent harness from its final output alone. Production harnesses log full structured **trajectories** — every prompt snapshot, tool call, latency, cache hit rate, token count, and exit code — so you can inspect and replay the exact 5-turn trace that solved `auth.ts`.
  - **Visuals:** Compact custom trace waterfall (5 horizontal turn bars at `~54px` height each to fit comfortably inside `850px`: `Turn 1: Read auth.ts`, `Turn 2: Grep`, `Turn 3: Edit`, `Turn 4: Test [FAIL]`, `Turn 5: Fix + Test [PASS]`) + top `DataChip` strip (`TTFT`, `Cache 88%`, `Cost $0.14`).
  - **Motion & `cueFrame` cues:** On `"trajectories"` → `whoosh-soft` SFX + waterfall bars expand sequentially; on `"replay"` → `camera-shutter` SFX + Turn 4 highlights cleanly for inspection.

- **Paragraph 32 — Measuring Harnesses with Evals (`pass@k` vs. `pass^k`, ~85 words):**
  - **Beat:** Benchmark harness changes like real systems engineering: run a fixed suite of realistic repo tasks and separate capability ceiling (`pass@k` — succeeding at least once in `k` tries) from production **consistency** (`pass^k` — succeeding all `k` times, where an 80% single-run agent drops to `51%` at `pass^3`), alongside **cost-per-solved-task** and **median turns**.
  - **Visuals:** 3-column `StatCallout` dashboard (`Reliability pass^3`, `Cost / Solved Task`, `Median Turns`) comparing `Harness v1` (Amber) vs. `Harness v2` (Emerald) via `MeterBar`s.
  - **Motion & `cueFrame` cues:** On `"consistency"` → `scale-up` SFX + `pass^3` meter climbs; on `"cost"` → `cash-chime` SFX + cost-per-solve drops.

- **Paragraph 33 — Isolating Model Gains vs. Harness Gains (~80 words):**
  - **Beat:** Run a 2×2 evaluation matrix (`Old/New Model × Old/New Harness`) across your task suite. Frequently, a clever scaffold that rescued last year's model actually *throttles* this year's frontier model by over-constraining its reasoning.
  - **Visuals:** Clean 2×2 comparison matrix `Card` (`Model A / Model B` × `Heavy Harness v1 / Thin Harness v2`) highlighting the surprising cell where stripping constraints unlocks a big score jump on `Model B`.
  - **Motion & `cueFrame` cues:** On `"matrix"` → `slide` SFX + 2×2 grid builds; on `"throttles"` → `thud-low` SFX + Amber/Rose cell pulses; on `"stripping"` → `chime-positive` SFX + Emerald cell wins.

- **Paragraph 34 — The "Build to Delete" Principle (~85 words, `keepAtEnd: true`):**
  - **Beat:** Because frontier models improve every few months, separate **permanent harness infrastructure** (sandbox, deterministic verifiers, prompt caching, trace logs — the exact primitives exposed by builder SDKs and harnesses like **Claude Agent SDK**, **OpenAI Agents SDK**, and **LangChain Deep Agents** on **LangGraph**) from **temporary model workarounds** (elaborate CoT nudges, brittle output repair), and delete workarounds as soon as evals prove the next generation no longer needs them.
  - **Visuals:** Horizontal **generational timeline** (`Model Gen 1 → Gen 2 → Gen 3`): Top track shows temporary Amber/Rose workaround `DataChip`s (`JSON Repair Shim`, `Rigid Router`, `CoT Nudge`) lifting/fading away across generations, while the bottom Cyan/Emerald foundation bar (`Sandbox • Verifiers • Cache • Traces`) stays solid and locked across all three generations.
  - **Motion & `cueFrame` cues:** On `"permanent"` → `magnetic-snap` SFX + bottom foundation bar locks; on `"delete"` → `pop-out` SFX + top temporary chips lift away from Gen 1 → Gen 3.

---

## Chapter 09 — The OS Mental Model & Outro (`09-synthesis-and-outro`, paragraphs: 35–37)

**Goal:** Crystallize the entire deep dive into one unforgettable systems diagram that transfers across every agent domain, give builders a concrete 4-step audit checklist, and leave clean breathing room for YouTube end-screen cards.

- **Paragraph 35 — One Mental Model to Remember (~90 words):**
  - **Beat:** Bring back the opening OS analogy as a complete 5-part systems mapping that transfers whether you're building a coding, browser, research, or ops agent: **Model = CPU**, **Context Window = RAM**, **Filesystem & Git = Disk**, **Tools, Hooks & Sandbox = Kernel & I/O**, **Tests & Evals = Debugger**.
  - **Visuals:** Single hero synthesis `Card` with 5 crisp horizontal mapping rows (`Pill` on left → `SvgLink` arrow → `NodeBox`/label on right) using consistent semantic tones, plus a subtle bottom domain `Pill` strip (`Coding • Browser • Research • Ops`).
  - **Motion & `cueFrame` cues:** On each mapping (`"CPU"`, `"RAM"`, `"disk"`, `"kernel"`, `"debugger"`) → `pop-in` / `magnetic-snap` SFX as rows illuminate in sequence. *(In Step 3, verify Whisper emits single tokens for `"CPU"` and `"RAM"`, or pair with safe fallback offsets.)*

- **Paragraph 36 — Practical Takeaway for Builders (~85 words):**
  - **Beat:** Close the thesis loop: before swapping models or rewriting system prompts for the tenth time, audit your harness — sharpen tool errors, protect your cache prefix, wire in deterministic verification, and enforce a scoped sandbox.
  - **Visuals:** 4-item Emerald `CheckRow` action checklist (`Clean Tool Ergonomics`, `Stable Cache Prefix`, `Closed-Loop Verification`, `Scoped Sandbox`) activating one by one.
  - **Motion & `cueFrame` cues:** On `"tools"` → `success-ding` SFX + Row 1; on `"prefix"` → `click-subtle` SFX + Row 2; on `"verification"` → `click-subtle` SFX + Row 3; on `"sandbox"` → `chime-positive` SFX + Row 4.

- **Paragraph 37 — Outro & End-Screen Safe Zone (~60 words → ~20s, `keepAtEnd: true`):**
  - **Beat:** Calm closing sign-off inviting viewers to comment which harness bottleneck hit their team hardest (context rot, tool sprawl, or sandboxing), while keeping the right and lower-right canvas open for YouTube end-screen cards.
  - **Visuals:** Compact left-aligned closing `Card` (`Agent = Model + Harness` + OS mini-recap) with clean dark atmospheric space reserved on the right/bottom for YouTube end-screen elements. *(Global `<BackgroundMusic />` in `src/Video.tsx` handles the 36-frame fade-out automatically — do **not** mount a second `<BackgroundMusic />` inside this chapter.)*
  - **Motion & `cueFrame` cues:** On `"bottleneck"` → `whoosh-soft` SFX + left summary card settles gently into end-screen framing.
