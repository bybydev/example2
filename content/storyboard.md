# Storyboard — MCP Explained

- **Target length:** 8–12 minutes (~10.5 min target; **30 paragraphs**, strict **55–60 words/paragraph**, **~1,650–1,720 words total** → ~9:50 at 175 wpm to ~11:45 at 150 wpm including leads/tails & chapter gaps)
- **Audience:** Anyone who cares about MCP, uses AI tools, wants to understand how MCP works, or wants to start using it (everyday AI users + builders/developers — pairing relatable workspace examples with accurate technical depth).
- **Canvas & visual system (`src/theme/tokens.ts`):** 1920×1080, 30 fps, safe margins `120px` X / `80px` Y (**`1680 × 850` usable stage area** below the 70px `Stage` header)
  - Background: `#0B1020` | Surface cards: `#141B30` | Elevated: `#1B2541` | Code/muted: `#0F162B` | Subtle border: `rgba(255,255,255,0.12)`
  - **Semantic color coding (consistent across every chapter):**
    - **Cyan (`#38BDF8`)** — MCP open standard, active protocol flow, Tools, local `stdio`, primary mental model
    - **Amber (`#F59E0B`)** — Contrasting approaches, Prompts, remote `Streamable HTTP`, human approval gates, trade-offs
    - **Emerald (`#34D399`)** — Resources, efficiency wins, adoption steps, security defenses, final takeaways
    - **Rose (`#FB7185`)** — Isolated AI bottleneck, M × N glue explosion, context bloat, prompt injection / tool poisoning warnings
  - Typography: `Inter` for headlines & labels, `JetBrains Mono` for metrics, JSON-RPC payloads, URIs, config keys, and protocol terms.
- **Animation & `cueFrame()` rule:** Anchor all key transitions to spoken cues via `cueFrame()` / `wordFrame()` (`src/ui/motion.ts`, `src/lib/timeline.ts`) with safe fallback offsets. **Every `cueFrame()` anchor must be a single, unhyphenated, non-numeric, distinctive English word** (avoiding multi-word phrases, numbers, hyphenated terms, or split-prone acronyms like `USB-C`, `JSON-RPC`, `stdio`, `OAuth`, `SDK` as Whisper match targets).

---

## Chapter Overview

| # | Chapter ID | Title | Paragraphs | Word Budget | Est. Time | Stage Tone |
|---|---|---|---:|---:|---:|---|
| 01 | `01-hook` | The Isolated AI Problem | 1–3 | ~165 | ~1:00 | `cyan` |
| 02 | `02-mn-problem` | Why MCP Exists: M × N vs. M + N | 4–7 | ~225 | ~1:25 | `amber` |
| 03 | `03-architecture` | Architecture: Host, Client & Server | 8–11 | ~225 | ~1:25 | `cyan` |
| 04 | `04-primitives` | Tools, Resources & Prompts | 12–15 | ~230 | ~1:30 | `emerald` |
| 05 | `05-walkthrough` | Live Trace: Inside an MCP Request | 16–19 | ~230 | ~1:30 | `cyan` |
| 06 | `06-transports` | Local vs. Remote: stdio & Streamable HTTP | 20–22 | ~175 | ~1:10 | `amber` |
| 07 | `07-how-to-use` | How to Start Using MCP Today | 23–25 | ~185 | ~1:10 | `emerald` |
| 08 | `08-pitfalls-and-outro` | Trade-offs, Security & The Big Picture | 26–30 | ~265 | ~1:45 | `rose` → `emerald` |

---

## Chapter 01 — The Isolated AI Problem (`01-hook`, paragraphs: 1–3)

**Goal:** Open with the universally relatable pain of copy-pasting context into a trapped AI chat box, reveal MCP as the universal "USB-C for AI," and set clear expectations for what viewers will learn.
**Stage header:** `01` · `THE ISOLATED AI PROBLEM` · `tone="cyan"` · `legend: [{ ISOLATED: rose }, { MCP STANDARD: cyan }]`

### `SceneBeat A` (Paragraphs 1–2 — Shared Morphing Hub Diagram)

- **Paragraph 1 — The Trapped AI Box (~55 words):**
  - **Beat:** Describe how smart modern AI models are—yet they sit trapped inside a chat window, forcing humans to act as the manual copy-paste bridge between files, docs, Slack, Notion, calendars, and code.
  - **Visuals:** Central glowing `Card` labeled `AI MODEL` inside a frosted box, surrounded radially by 6 `DataChip` app nodes (`Files`, `Notion`, `Slack`, `Drive`, `Calendar`, `GitHub`) connected only by broken dashed `rose` lines and a pulsing `rose` `Pill` labeled `HUMAN COPY-PASTE BRIDGE`.
  - **Motion & `cueFrame` cues:** On `"trapped"` → lock border glow around AI box; on `"copy"` → flash dashed `rose` connectors sequentially around the 6 external apps.

- **Paragraph 2 — Enter Model Context Protocol (~55 words):**
  - **Beat:** Introduce **Model Context Protocol (MCP)**—an open standard originally created by Anthropic and now adopted across the AI ecosystem (Claude, ChatGPT, Cursor, VS Code, Gemini, and more)—giving AI one universal "USB-C port" to connect to real tools and data.
  - **Visuals:** Seamless morph inside `SceneBeat A`: broken `rose` lines snap into clean solid `cyan` connectors converging through a glowing `MCP` hub badge, while `MCP Explained` title banner and ecosystem host `Pill`s (`Claude`, `ChatGPT`, `Cursor`, `VS Code`, `Custom Agents`) animate in.
  - **Motion & `cueFrame` cues:** On `"protocol"` → morph hub to `cyan` glow via `springAt()`; on `"universal"` → snap all 6 radial links into aligned solid lines via `progressBetween()`.

### `SceneBeat B` (Paragraph 3 — Crossfaded Roadmap Strip)

- **Paragraph 3 — Video Roadmap & Promise (~55 words):**
  - **Beat:** Set the promise for both everyday AI users and builders: in the next 10 minutes you'll learn why MCP exists, how it works under the hood, how to start using it today, and the security pitfalls to watch out for.
  - **Visuals:** `SectionTitle` + horizontal 4-card roadmap strip using `Card` + numbered monospace badges: `01 Why MCP`, `02 How It Works`, `03 How To Use It`, `04 Security & Limits`.
  - **Motion & `cueFrame` cues:** Stagger each roadmap card upward via `slideUpStyle()` anchored to `"exists"`, `"under"`, `"today"`, and `"security"`.

---

## Chapter 02 — Why MCP Exists: M × N vs. M + N (`02-mn-problem`, paragraphs: 4–7)

**Goal:** Explain the integration explosion mathematically and visually, show why USB-C is the right analogy, and clear up both common misconceptions ("MCP vs. REST APIs" and "MCP vs. normal function calling").
**Stage header:** `02` · `M × N VS. M + N` · `tone="amber"` · `legend: [{ CUSTOM GLUE (M×N): rose }, { MCP STANDARD (M+N): cyan }]`

### `SceneBeat A` (Paragraphs 4–6 — Persistent Bipartite Graph Morph)

- **Paragraph 4 — The Custom Glue Trap (~55 words):**
  - **Beat:** Before MCP, every AI app had to build custom integrations for every external tool—and every tool vendor had to rebuild connectors for each AI platform, juggling incompatible function-calling schemas and auth logic.
  - **Visuals:** Animated SVG bipartite graph: left column = 5 AI Apps (`Claude`, `ChatGPT`, `Cursor`, `VS Code`, `Internal Bot`), right column = 6 Tools (`Notion`, `Slack`, `Drive`, `GitHub`, `Calendar`, `Postgres`), connected by a dense tangled mesh of 30 `rose` Bezier curves.
  - **Motion & `cueFrame` cues:** On `"custom"` → animate mesh lines drawing rapidly via `progressBetween()`; on `"schemas"` → pulse `rose` error badges (`Schema Drift`, `Auth Rewrites`).

- **Paragraph 5 — The M × N Scaling Explosion (~55 words):**
  - **Beat:** Show the math: 5 AI apps times 10 tools is 50 custom integrations. Scale to 20 AI apps and 100 tools, and the ecosystem has to maintain 2,000 fragile connections.
  - **Visuals:** Graph dims slightly to backdrop while a monospace formula banner `M × N` in `rose` rises with two escalating metric `Card`s (`5 × 10 = 50` → `20 × 100 = 2,000 integrations`) and an amber/rose `MeterBar` hitting `100%` maintenance overhead.
  - **Motion & `cueFrame` cues:** On `"multiply"` → pop first metric card via `slideUpStyle()`; on `"fragile"` → ramp `MeterBar` to `100%` in `rose` glow.

- **Paragraph 6 — Collapsing M × N into M + N (~55 words):**
  - **Beat:** With MCP as a shared middle layer, each AI app implements MCP once (`M`) and each tool exposes one MCP server (`N`). Suddenly `20 × 100 = 2,000` collapses to `20 + 100 = 120`—just like USB-C replaced a drawer full of proprietary chargers.
  - **Visuals:** The tangled SVG graph snaps into a clean 3-column layout with a glowing vertical `cyan` **MCP Standard Bus** in the center (`M` clean lines left, `N` clean lines right). Side-by-side `MeterBar` comparison: `M × N = 2,000` (`rose`) vs. `M + N = 120` (`emerald`, `-94%`).
  - **Motion & `cueFrame` cues:** On `"standard"` → snap graph lines onto the central `MCP` bus; on `"collapses"` → animate `emerald` `MeterBar` dropping cleanly to `6%` width with `-94%` `Pill`.

### `SceneBeat B` (Paragraph 7 — Crossfaded 3-Layer Stack)

- **Paragraph 7 — MCP Wraps APIs & Standardizes Function Calling (~60 words):**
  - **Beat:** Clear up two common questions in one beat: MCP does not replace REST APIs or databases, and AI models could already call functions—MCP simply sits in between as one universal adapter so any AI host can discover and run those tools without custom glue.
  - **Visuals:** Clean 3-layer horizontal architecture stack (`SectionTitle` + stacked `Card`s):
    - Bottom (`neutral`): `Existing Infrastructure` (`REST APIs` · `Databases` · `Local Files` · `SaaS Apps`)
    - Middle (`cyan`, glow): `MCP Server (Universal AI Adapter)` · `Pill`: `Standardizes Discovery & Function Calls`
    - Top (`emerald`): `Any MCP-Compatible AI Host`
  - **Motion & `cueFrame` cues:** Build stack bottom-up on `"replace"`, `"function"`, and `"adapter"` using `slideUpStyle()`.

---

## Chapter 03 — Architecture: Host, Client & Server (`03-architecture`, paragraphs: 8–11)

**Goal:** Demystify the 3 roles viewers constantly confuse (Host vs. Client vs. Server), introduce JSON-RPC 2.0 capability negotiation, and show why 1:1 session isolation matters.
**Stage header:** `03` · `HOST, CLIENT & SERVER` · `tone="cyan"` · `legend: [{ HOST / CLIENT: cyan }, { MCP SERVER: emerald }, { JSON-RPC 2.0: amber }]`

### `SceneBeat A` (Paragraphs 8–9 — Progressive 3-Tier Architecture Build)

- **Paragraph 8 — Meet the MCP Host (~55 words):**
  - **Beat:** Start with the piece you already see on your screen: the **MCP Host**. That's the AI app you interact with—Claude Desktop, Cursor, VS Code, ChatGPT, or a custom agent—which manages the chat interface, the LLM, and permission prompts.
  - **Visuals:** Large left-hand `Card` (`tone="cyan"`, glow) titled `MCP HOST` containing sub-blocks: `User Interface`, `LLM Reasoning`, and `Permission Gate`, with host example `Pill`s underneath.
  - **Motion & `cueFrame` cues:** On `"host"` → reveal container with `slideUpStyle()`; on `"permission"` → pulse the `Permission Gate` badge in `amber`.

- **Paragraph 9 — Clients Inside the Host, Servers Outside (~55 words):**
  - **Beat:** Inside the Host live **MCP Clients**—lightweight protocol connectors. Each Client maintains a dedicated 1-to-1 connection to a single **MCP Server**, a focused program exposing one tool or data source like Slack, Notion, or your local filesystem.
  - **Visuals:** Diagram expands smoothly into full 3-column flow: inside `MCP HOST`, 3 distinct `CLIENT #1 / #2 / #3` slots appear, each wired by a clean horizontal `cyan` line to its own `emerald` `MCP SERVER` card (`Files Server`, `Slack Server`, `Notion Server`).
  - **Motion & `cueFrame` cues:** On `"client"` → light up the 3 client slots inside the host; on `"server"` → slide in the 3 external server cards and draw 1:1 connector lines.

### `SceneBeat B` (Paragraph 10 — Zoomed Handshake View)

- **Paragraph 10 — Speaking JSON-RPC 2.0 & The Handshake (~55 words):**
  - **Beat:** Clients and Servers exchange lightweight JSON-RPC 2.0 messages. Before doing real work, they perform a quick `initialize` handshake to agree on protocol versions and announce which capabilities each side supports.
  - **Visuals:** Zoomed single `Client ↔ Server` link with two animated packet dots traveling back and forth (`initialize` → `capabilities: { tools, resources, prompts }` → `initialized`) above a crisp `CodePanel` previewing the minimal JSON-RPC payload.
  - **Motion & `cueFrame` cues:** On `"messages"` → reveal `CodePanel`; on `"handshake"` → animate request packet left-to-right and capability response packet right-to-left via `progressBetween()`.

### `SceneBeat C` (Paragraph 11 — Isolation Spotlight)

- **Paragraph 11 — Why 1-to-1 Isolation Matters (~60 words):**
  - **Beat:** Keeping one Client per Server provides clean isolation: each server only sees the context and permissions meant for it, and if one server crashes or goes offline, the rest of your AI workspace keeps running smoothly.
  - **Visuals:** Return to the 3-server schematic with clear vertical isolation walls between Client slots: Server #2 (`Slack`) turns `rose` with an `OFFLINE / SCOPED` badge and dashed link, while Server #1 (`Files`) and Server #3 (`Notion`) remain glowing `emerald` (`HEALTHY`).
  - **Motion & `cueFrame` cues:** On `"isolation"` → draw vertical boundary dividers between Client slots; on `"crashes"` → toggle Server #2 to `rose` while keeping #1 and #3 steady `emerald`.

---

## Chapter 04 — Tools, Resources & Prompts (`04-primitives`, paragraphs: 12–15)

**Goal:** Teach the 3 core MCP primitives using the clearest mental model in the spec—**who is in control**—pairing everyday workspace examples with developer examples, plus a light, jargon-free closing note on two-way guardrails.
**Stage header:** `04` · `TOOLS, RESOURCES & PROMPTS` · `tone="emerald"` · `legend: [{ TOOLS (MODEL): cyan }, { RESOURCES (APP): emerald }, { PROMPTS (USER): amber }]`

### `SceneBeat A` (Paragraphs 12–15 — Persistent 3-Pillar Grid + Compact Bottom Drawer)

- **Paragraph 12 — Tools: Model-Controlled Actions (~60 words):**
  - **Beat:** Introduce the 3 primitives through who triggers them, starting with **Tools**. Tools are executable actions ("verbs")—like searching Drive, scheduling a calendar event, or querying a database. They are **model-controlled**: the AI reads their descriptions and decides when to call them (with your approval).
  - **Visuals:** 3-column grid opens with Column 1 active (`Card`, `tone="cyan"`, glow): `TOOLS` · Pill `MODEL-CONTROLLED` · Subtitle `"Verbs — Do Things"` · mixed everyday & dev `DataChip`s (`search_drive()`, `create_event()`, `query_sql()`). Columns 2 & 3 remain dimmed until their beats.
  - **Motion & `cueFrame` cues:** On `"tools"` → spring Column 1 to full glow; on `"decides"` → highlight the `MODEL-CONTROLLED` pill and pulse the schema badge.

- **Paragraph 13 — Resources: App-Controlled Context (~55 words):**
  - **Beat:** Next are **Resources**—structured, read-only data ("nouns") identified by clean addresses like a project plan in Drive, meeting notes, or a database schema. Think of them like safe GET endpoints: they are **application-controlled**, letting your AI app attach clean context without side effects.
  - **Visuals:** Column 2 lights up (`Card`, `tone="emerald"`, glow): `RESOURCES` · Pill `APP-CONTROLLED` · Subtitle `"Nouns — Read Context"` · URI chips (`drive://Q4-plan.pdf`, `notes://standup`, `db://schema`).
  - **Motion & `cueFrame` cues:** On `"resources"` → undim and glow Column 2; on `"endpoints"` → animate a `READ-ONLY · SAFE` emerald shield pill.

- **Paragraph 14 — Prompts: User-Controlled Workflows (~55 words):**
  - **Beat:** Third are **Prompts**—reusable workflow templates packaged directly inside a server, like `/prep-meeting`, `/weekly-brief`, or `/review-pr`. They are **user-controlled**: you intentionally pick them from a slash-command menu to kick off a consistent task.
  - **Visuals:** Column 3 lights up (`Card`, `tone="amber"`, glow): `PROMPTS` · Pill `USER-CONTROLLED` · Subtitle `"Workflows — Templates"` · Slash-command chips (`/prep-meeting`, `/weekly-brief`, `/review-pr`). All 3 columns now shine side-by-side.
  - **Motion & `cueFrame` cues:** On `"prompts"` → undim and glow Column 3; on `"slash"` → highlight `/prep-meeting` command pill.

- **Paragraph 15 — Two-Way Guardrails & Collaboration (~60 words):**
  - **Beat:** Keep it intuitive (avoid verbally dumping three spec nouns): explain that MCP is also bidirectional—your AI app can fence servers inside specific folder boundaries, and a server can pause mid-task to ask you a clarifying question or borrow the host's AI safely.
  - **Visuals:** Compact bottom bar (`Card`, `neutral`, ~110px tall) labeled `TWO-WAY CAPABILITIES` slides up cleanly beneath the 3 pillars (which subtly compress vertically to fit `850px`), showing 3 clean reference badges: `Roots` (`cyan` · "Folder Boundaries"), `Elicitation` (`amber` · "Clarifying Questions"), `Sampling` (`emerald` · "Borrow Host AI").
  - **Motion & `cueFrame` cues:** Reveal drawer on `"bidirectional"`, highlight `Roots` on `"boundaries"`, and highlight `Elicitation` / `Sampling` on `"clarifying"`.

---

## Chapter 05 — Live Trace: Inside an MCP Request (`05-walkthrough`, paragraphs: 16–19)

**Goal:** Make MCP concrete by tracing one universally relatable real-world prompt end-to-end across **Slack + Notion** with crisp structured data, showing discovery, LLM tool selection, execution, and human-in-the-loop write approval.
**Stage header:** `05` · `LIVE REQUEST TRACE` · `tone="cyan"` · `legend: [{ CONTROL FLOW: cyan }, { DATA RETURN: emerald }, { HUMAN APPROVAL: amber }]`
**Layout note (`1680 × 850` safe box):** Intentionally **omit `SectionTitle`** in Chapter 05 (relying on the `Stage` header) so the 5 vertical swimlanes (`~530px`) and bottom `CodePanel` inspector (`~280px`) have generous breathing room with zero vertical clipping.

### `SceneBeat A` (Paragraphs 16–19 — Persistent 5-Lane Sequence Diagram + Live Inspector)

*Persistent layout:* 5 vertical swimlanes (`You` | `Host + Client` | `LLM` | `Slack MCP` | `Notion MCP`) in the upper ~64% of the stage + live `CodePanel` inspector in the lower ~36%.

- **Paragraph 16 — Step 1: Discovery & The User Prompt (~60 words):**
  - **Beat:** Set the relatable prompt: *"Find the urgent customer requests from our Slack feedback channel and draft a Monday update in Notion."* Explain that when you connect those servers, the Host's Clients first pull a live tool catalog via `tools/list` so the Host knows every available action and input.
  - **Visuals:** Prompt bubble appears in lane `You`; `tools/list` packets sweep from `Host + Client` to `Slack MCP` and `Notion MCP`, populating tool badges in the `CodePanel` (`slack.search_messages`, `notion.create_draft`).
  - **Motion & `cueFrame` cues:** On `"urgent"` → pop user prompt bubble; on `"catalog"` → sweep discovery packets across swimlanes `2 → 4` and `2 → 5`.

- **Paragraph 17 — Step 2: The LLM Decides, Not Executes (~55 words):**
  - **Beat:** The Host sends your prompt plus the tool catalog to the LLM. Crucially, the LLM never touches Slack directly—it simply outputs a structured decision saying: call `slack.search_messages` filtered to `#feedback` and `urgent`.
  - **Visuals:** Glowing `cyan` packet travels `Host + Client → LLM → Host + Client`. A clear `Pill` callout stresses `LLM DECIDES · HOST EXECUTES`. `CodePanel` updates to show the clean structured `tools/call` payload for `slack.search_messages`.
  - **Motion & `cueFrame` cues:** On `"directly"` → flash subtle boundary line between `LLM` and external servers; on `"structured"` → populate `tools/call` JSON lines in `CodePanel`.

- **Paragraph 18 — Step 3: Calling Slack & Reading Real Data (~55 words):**
  - **Beat:** The Host routes that request through the Slack Client to the Slack MCP Server. The server fetches the real messages, returns three clean structured customer requests, and the Host hands that fresh data back to the LLM.
  - **Visuals:** `cyan` packet flies `Host + Client → Slack MCP`; `emerald` data packet flies back `Slack MCP → Host + Client → LLM`. `CodePanel` switches to show the 3 structured returned items (`REQ-104 CSV export`, `REQ-109 Dark mode`, `REQ-112 Team SSO`).
  - **Motion & `cueFrame` cues:** On `"routes"` → animate outbound packet; on `"returns"` → animate green return packet + reveal the 3 structured request rows.

- **Paragraph 19 — Step 4: Human Approval & Drafting in Notion (~60 words):**
  - **Beat:** Now the LLM writes the Monday update and requests `notion.create_draft`. Because this creates new external content, the Host pauses with a human-in-the-loop approval prompt. You click Approve, the Notion MCP Server creates the draft, and the AI replies with your live link.
  - **Visuals:** `amber` modal overlay card slides up over the `Host + Client` lane: `APPROVE WRITE ACTION? notion.create_draft(...)` with an animated `Approve` button turning `emerald`. Packet then flies to `Notion MCP` and returns a glowing `emerald` final reply card to `You` (`Monday Update Draft Ready → notion.so/...`).
  - **Motion & `cueFrame` cues:** On `"pauses"` → slide in `amber` approval modal; on `"approve"` → switch button to `emerald` and fire packet to `Notion MCP`; on `"link"` → reveal final completed reply.

---

## Chapter 06 — Local vs. Remote: stdio & Streamable HTTP (`06-transports`, paragraphs: 20–22)

**Goal:** Clarify where MCP servers actually live—on your laptop vs. in the cloud—and introduce `stdio` and `Streamable HTTP` (+ OAuth 2.1) cleanly without heavy networking jargon.
**Stage header:** `06` · `LOCAL VS. REMOTE TRANSPORTS` · `tone="amber"` · `legend: [{ LOCAL (STDIO): cyan }, { REMOTE (STREAMABLE HTTP): amber }, { SECURITY / WINS: emerald }]`

### `SceneBeat A` (Paragraphs 20–22 — Persistent Two-Column Transport Split + Bottom Meter Strip)

- **Paragraph 20 — Local Servers via `stdio` (~60 words):**
  - **Beat:** When your data lives on your own machine—local folders, personal notes, Git repos, or local databases—MCP uses the **stdio** transport. The Host launches the server as a tiny local subprocess and exchanges messages over standard input and output: ultra-fast and private by default.
  - **Visuals:** Left column `Card` (`tone="cyan"`, glow): `LOCAL · stdio` with laptop/process schematic (`Host` → `stdin / stdout pipe` → `Local Subprocess`) and `DataChip`s (`Files`, `Notes`, `Git Repo`, `SQLite`) + `emerald` Pill `PRIVATE · ZERO NETWORK HOPS`.
  - **Motion & `cueFrame` cues:** On `"subprocess"` → reveal left card via `slideUpStyle()`; on `"private"` → pulse animated local pipe flow between Host and Subprocess.

- **Paragraph 21 — Remote Servers via Streamable HTTP (~60 words):**
  - **Beat:** When tools live in the cloud—like Notion, Slack, Linear, Figma, or company-wide services—MCP uses **Streamable HTTP** (which replaced the older HTTP+SSE transport). You connect to a standard HTTPS address, sign in securely with OAuth 2.1, and stream updates over the web with no terminal setup.
  - **Visuals:** Right column `Card` (`tone="amber"`, glow): `REMOTE · Streamable HTTP` with cloud schematic (`Host` ↔ `HTTPS + OAuth 2.1 Lock` ↔ `Cloud MCP Server`) and `DataChip`s (`Notion`, `Slack`, `Linear`, `Company API`) + subtle tag `Replaces legacy HTTP+SSE`.
  - **Motion & `cueFrame` cues:** On `"cloud"` → slide in right card; on `"securely"` → illuminate `emerald` OAuth 2.1 lock badge on the HTTPS pipe.

- **Paragraph 22 — Choosing the Right Transport (~55 words):**
  - **Beat:** Summarize the choice cleanly: pick local `stdio` when you want fast, private access to files on your laptop; pick remote `Streamable HTTP` when you want zero-install cloud apps or shared servers across a whole team.
  - **Visuals:** Bottom comparison strip with 3 compact `MeterBar` rows contrasting `Local (stdio)` (`cyan`) vs. `Remote (Streamable HTTP)` (`amber`) across `Local Privacy`, `Zero-Install Ease`, and `Team Sharing`.
  - **Motion & `cueFrame` cues:** Animate each `MeterBar` smoothly via `progressBetween()` anchored to `"laptop"`, `"cloud"`, and `"sharing"`.

---

## Chapter 07 — How to Start Using MCP Today (`07-how-to-use`, paragraphs: 23–25)

**Goal:** Give both halves of the audience—everyday AI users and developers—an immediate, concrete path to try MCP in under 5 minutes.
**Stage header:** `07` · `HOW TO START USING MCP` · `tone="emerald"` · `legend: [{ NO-CODE USERS: emerald }, { DEVELOPERS / BUILDERS: cyan }]`

### `SceneBeat A` (Paragraphs 23–24 — Dual-Track Setup Comparison)

- **Paragraph 23 — Path 1: Everyday AI Users (Zero Code) (~60 words):**
  - **Beat:** You don't need to write a single line of code to use MCP. Modern AI apps—including Claude, ChatGPT, Notion, Cursor, and VS Code—offer built-in connector directories. Pick a remote server, sign in like any normal app, toggle it on, and start asking real questions across your workspace.
  - **Visuals:** Left-side `Card` (`tone="emerald"`, glow) titled `NO-CODE PATH · 1-Click Connectors` showing a clean UI settings list (`CheckRow` items) for `Notion`, `Google Drive`, `Calendar`, and `Slack` with animated toggle switches flipping ON and `OAuth Connected` pills glowing green.
  - **Motion & `cueFrame` cues:** On `"connectors"` → pop `ZERO CODE REQUIRED` pill; on `"toggle"` → sequentially flip the 4 connector toggles from neutral to `emerald`.

- **Paragraph 24 — Path 2: Power Users & Developers (~60 words):**
  - **Beat:** If you want custom local servers or want to build your own, most hosts read one tiny `mcpServers` config file—just point it at a local command or a remote URL. And building your own server takes roughly thirty lines of Python with FastMCP or TypeScript with the official SDK.
  - **Visuals:** Right-side `Card` (`tone="cyan"`, glow) titled `BUILDER PATH · mcp.json & SDKs` featuring a crisp `CodePanel` displaying a minimal 12-line `mcpServers` JSON config (one `stdio` entry + one remote `url` entry), plus two `DataChip`s below: `Python · FastMCP (~30 LOC)` and `TypeScript · Official SDK`.
  - **Motion & `cueFrame` cues:** On `"config"` → reveal `CodePanel` line-by-line; on `"lines"` → highlight the Python & TypeScript SDK chips via `slideUpStyle()`.

### `SceneBeat B` (Paragraph 25 — Crossfaded 3-Step Adoption Ladder)

- **Paragraph 25 — The Smart Starter Playbook (~65 words):**
  - **Beat:** Give one practical habit so viewers succeed on day one: resist connecting fifteen servers at once. Pick the AI app you already use, start with one or two trusted read-only servers like your docs or notes, and only enable write actions once you've seen the workflow behave reliably.
  - **Visuals:** `SectionTitle` + full-width 3-step horizontal progression banner (`Card`s linked by `emerald` arrows):
    1. `STEP 1` — `Pick One Host` ("Claude, ChatGPT, Cursor, VS Code")
    2. `STEP 2` — `Start Read-Only` ("Connect 1–2 trusted servers")
    3. `STEP 3` — `Scale Safely` ("Add writes or custom servers")
  - **Motion & `cueFrame` cues:** Reveal Steps 1, 2, and 3 sequentially on `"habit"`, `"trusted"`, and `"writes"`.

---

## Chapter 08 — Trade-offs, Security & The Big Picture (`08-pitfalls-and-outro`, paragraphs: 26–30)

**Goal:** Deliver honest reality (context bloat, security threats, when NOT to use MCP), close with one unforgettable synthesis mental model, and reserve clean space for YouTube end-screen cards.
**Stage header:** `08` · `TRADE-OFFS, SECURITY & BIG PICTURE` · `tone="rose"` (transitions to `emerald` for `SceneBeat D`) · `legend: [{ RISK / COST: rose }, { GUARDRAIL / WIN: emerald }]`

### `SceneBeat A` (Paragraph 26 — Context Window Bloat Meter)

- **Paragraph 26 — Pitfall 1: Context Window Bloat (~55 words):**
  - **Beat:** Connecting ten servers with dozens of tools sounds exciting—until every tool description eats tokens inside your prompt, raising cost, slowing answers, and confusing the model. Keep only focused servers active, or use hosts that load tools on demand via dynamic tool search.
  - **Visuals:** Full-width animated `Card` showing a `Context Window Budget` `MeterBar` surging to `78%` in `rose` as dozens of tiny tool-schema `DataChip`s flood in (`100 tools ≈ 25k tokens`), then collapsing cleanly down to `14%` in `emerald` when filtered to `2 focused servers` / `Dynamic Tool Search`.
  - **Motion & `cueFrame` cues:** On `"tokens"` → surge `MeterBar` into `rose`; on `"focused"` → trim chips and animate `MeterBar` smoothly down into `emerald`.

### `SceneBeat B` (Paragraph 27 — Security Threat vs. Guardrail Split)

- **Paragraph 27 — Pitfall 2: Security, Prompt Injection & Tool Poisoning (~60 words):**
  - **Beat:** Giving AI real tools creates real risk. Malicious external text can trigger **prompt injection**, and untrusted servers can hide instructions inside tool descriptions—known as **tool poisoning**. Treat MCP servers like browser extensions: install only trusted ones, grant least-privilege permissions, and keep human approval turned on for writes.
  - **Visuals:** Split layout:
    - Left (`rose` warning `Card`): `THREAT VECTORS` highlighting `Prompt Injection` ("Hidden instructions in fetched data") and `Tool Poisoning` ("Malicious tool descriptions").
    - Right (`emerald` shield `Card`): `3 GOLDEN GUARDRAILS` (`CheckRow` list): `1. Trusted Servers Only`, `2. Least-Privilege Scopes`, `3. Human Approval on Writes`.
  - **Motion & `cueFrame` cues:** On `"poisoning"` → pulse left `rose` warning card; on `"extensions"` → reveal right `emerald` guardrails sequentially.

### `SceneBeat C` (Paragraph 28 — Pragmatic Decision Matrix)

- **Paragraph 28 — When NOT to Use MCP (~50 words):**
  - **Beat:** Stay pragmatic: MCP isn't the answer to everything. If you just need to paste one file once, or run a fixed script where no AI decision is needed, keep it simple. MCP shines when an AI assistant needs repeatable, live access across multiple changing apps.
  - **Visuals:** Clean two-column decision table (`Card`s):
    - Left (`amber`): `SKIP MCP WHEN...` (`One-off file paste`, `Fixed deterministic script`, `Static single-step task`)
    - Right (`emerald`, glow): `USE MCP WHEN...` (`Live, changing data`, `Multi-app AI workflows`, `Reusable across many AI hosts`)
  - **Motion & `cueFrame` cues:** Slide in left card on `"simple"` and right card on `"shines"`.

### `SceneBeat D` (Paragraphs 29–30 — Synthesis & YouTube End-Screen Safe Layout)

- **Paragraph 29 — The Big Picture Synthesis (~50 words):**
  - **Beat:** Mirror Chapter 01 in one clean takeaway: MCP turns AI from an isolated text box into an interoperable partner—collapsing M × N custom glue into one open standard built on Hosts, Clients, Servers, Tools, Resources, and Prompts.
  - **Visuals:** Stage accent shifts cleanly to `emerald`. Crisp synthesis hero `Card` (`tone="emerald"`, glow) positioned cleanly in the **left / upper-left column (~45% width)** summarizing the video in 3 tight pills: `M × N → M + N` · `Host · Client · Server` · `Tools · Resources · Prompts`.
  - **Motion & `cueFrame` cues:** On `"isolated"` → echo a miniature Chapter 01 badge snapping cleanly into the glowing synthesis card; on `"interoperable"` → illuminate the 3 summary pills.

- **Paragraph 30 — Closing & Call to Action (~50 words — End-Screen Safe Zone):**
  - **Beat:** Wrap warmly and invite viewers to comment which MCP server they plan to connect first (or build next), holding a calm, spacious closing canvas for YouTube end-screen cards (~16–20 seconds including tail).
  - **Visuals:** Left column (~44% width) holds the `MCP Explained` summary badge + subtle discussion prompt card (`"Which MCP server will you connect first?"`). **The entire right ~55% and bottom-right area remain clean, dark grid backdrop with zero overlapping text or cards** for YouTube's video & subscribe end-screen elements.
  - **Motion & `cueFrame` cues:** On `"comment"` → gently fade in the left-side discussion prompt card while keeping motion calm and non-distracting through the end of the clip.

---

## Thumbnail Spec (`src/Thumbnail.tsx` → `out/thumbnail.png`, 1280×720)

- **Left Column (Mobile-Readable Typography):**
  - Eyebrow badge (`cyan`): `MODEL CONTEXT PROTOCOL`
  - Giant two-line headline: `MCP` (`#F8FAFC`) / `EXPLAINED` (`#38BDF8`)
  - High-contrast visual hook line: `M × N` (`rose`) `→` `M + N` (`emerald`)
- **Right Column (Focal Visual Comparison — Bottom-Right Corner Kept Clear for YouTube Duration Badge):**
  - Top card (`rose` border): `BEFORE` — mini tangled connection web badge (`50+ Custom Glue Links`)
  - Bottom card (`cyan`/`emerald` glow, lifted above the bottom-right timestamp zone via generous bottom margin): `WITH MCP` — glowing `AI` ↔ `MCP` ↔ `Tools · Files · Apps` plug diagram (`1 Universal Port`)

---

## Outro & End-Screen Checklist

- Chapter 08 mirrors Chapter 01's contrast (`Isolated AI Box` → `Connected AI via 1 Open Standard`) so viewers walk away with one durable mental model.
- Final ~16–20 seconds (Paragraph 30 + tail) keep the right ~55% and bottom-right regions visually clear for YouTube end-screen cards.
- In-video `CaptionsOverlay` stays disabled by default; generate `content/subtitles.srt` via `mycli` for native YouTube captions.
