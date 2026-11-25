# Storyboard — Why AI Output Tokens Are So Expensive

- **Target length:** 7.5–8.5 minutes (~1,200–1,300 words across 24 paragraphs)
- **Audience:** Software engineers & AI builders (intuitive analogies backed by real GPU inference mechanics)
- **Canvas & visual system (`src/theme/tokens.ts`):** 1920×1080, 30 fps, safe margins `120px` X / `80px` Y
  - Background: `#0B1020` | Surface cards: `#141B30` | Subtle border: `rgba(255,255,255,0.12)`
  - **Semantic color coding (keep consistent across every chapter):**
    - **Cyan (`#38BDF8`)** — Input tokens, Prefill phase, Parallel compute / Tensor Cores, Cache hits
    - **Amber (`#F59E0B`)** — Output tokens, Decode phase, Memory bandwidth / HBM wall, Cost spikes
    - **Emerald (`#34D399`)** — Optimizations (MoE, Speculative Decoding, Caching wins, cost savings)
    - **Rose (`#FB7185`)** — Bottlenecks, redlined HBM pipes, OOM / latency ceilings
  - Typography: `Inter` for headlines & labels, `JetBrains Mono` for token IDs, dimensions (`[N × d]`), pricing numbers, and bandwidth metrics.
- **Animation rule:** Anchor all key transitions to spoken cues via `wordFrame()` from `src/lib/timeline.ts` rather than hardcoded frame offsets.

---

## Chapter 01 — The Pricing Paradox (`01-hook`, paragraphs: 1–3, ~0:55)

**Goal:** Open with an undeniable API pricing shock, state the intuitive misconception, and drop the core thesis.

- **Paragraph 1 — The 5× Price Gap:**
  - **Beat:** Show modern LLM API pricing tables where output tokens cost 3×–5× more than input tokens (and 30×–50× more than cached input).
  - **Visuals:** Clean dark pricing table (`#141B30` cards) comparing representative frontier-tier pricing rows (e.g., Input `$3 / 1M` in cyan vs. Output `$15 / 1M` in amber, plus a subtle badge for Cached Input `$0.30 / 1M`).
  - **Motion & `wordFrame` cues:** On `"input"` → cyan price column slides in; on `"output"` → amber price column snaps in and a bold `5×` multiplier pill pops between them; on `"cached"` → a secondary `50×` callout ticks upward.

- **Paragraph 2 — The Naive Assumption:**
  - **Beat:** Ask the obvious engineering question: aren't input and output both just tokens passing through the exact same Transformer weights?
  - **Visuals:** Split diagram: a cyan token badge (`[4821]`) on the left and an amber token badge (`[9104]`) on the right both feed into the exact same glowing central `Transformer Model` block, with a floating `$1 vs $5` question-mark scale above it.
  - **Motion & `wordFrame` cues:** On `"same"` → both tokens enter the identical block symmetrically; on `"why"` → the balance scale tilts dramatically toward the amber output side.

- **Paragraph 3 — Thesis Reveal (It's GPU Physics):**
  - **Beat:** It's not arbitrary SaaS markup — reading tokens and writing tokens behave like two completely different programs on a GPU.
  - **Visuals:** The central Transformer block splits horizontally into two contrasting blueprints: top half labeled `PREFILL (Parallel Compute)` in cyan, bottom half labeled `DECODE (Serial Memory Traffic)` in amber. Full-screen chapter title lockup fades in underneath: **"Why AI Output Tokens Are So Expensive"**.
  - **Motion & `wordFrame` cues:** On `"physics"` / `"GPU"` → blueprint split animates cleanly; hold 0.4s before chapter gap.

---

## Chapter 02 — Two Worlds: Prefill vs. Decode (`02-prefill-vs-decode`, paragraphs: 4–6, ~1:05)

**Goal:** Establish the two-phase lifecycle of every LLM request so the viewer clearly separates Prefill from Decode.

- **Paragraph 4 — Anatomy of a Single Request:**
  - **Beat:** Every API call has two distinct stages: **Prefill** (digesting your entire prompt to emit the first token, measured as TTFT) and **Decode** (streaming output tokens one by one).
  - **Visuals:** Horizontal request timeline bar across the stage:
    - Left short bright cyan segment: `PREFILL` (`~50 ms`, `TTFT` marker at its right edge).
    - Right long segmented amber bar: `DECODE` (`token 1 → token 2 → ... → token N`, spanning seconds).
  - **Motion & `wordFrame` cues:** On `"prefill"` → cyan segment flashes complete almost instantly; on `"first"` → `TTFT` pin drops; on `"decode"` → amber ticks animate sequentially across the bar.

- **Paragraph 5 — Prefill: All At Once:**
  - **Beat:** Because your entire prompt is already known upfront, the model processes all input tokens simultaneously in a single parallel forward pass.
  - **Visuals:** A prompt sentence (`"Explain why GPU memory..."`) breaks into 8 cyan token tiles arranged side-by-side into a single matrix block (`[Seq × d]`), sliding straight through stacked `Layer 1 → Layer 2 → ... → Layer L` blocks together in one smooth wave.
  - **Motion & `wordFrame` cues:** On `"parallel"` / `"once"` → all cyan columns illuminate simultaneously as a synchronized vertical sweep passes through the layers.

- **Paragraph 6 — Decode: Strict Autoregressive Loop:**
  - **Beat:** Output generation is autoregressive — the model cannot predict token #100 until token #99 has been generated and fed back in.
  - **Visuals:** Single amber token exits the top of the Transformer stack, arcs along a glowing feedback loop arrow back to the bottom input slot, appends to the growing sequence, and triggers the next pass — repeating 4–5 times with a ticking step counter (`Step 1`, `Step 2`, `Step 3`, ...).
  - **Motion & `wordFrame` cues:** On `"one"` → single amber block pulses; on `"depends"` / `"previous"` → feedback loop arrow traces from output back to input, locking out future greyed-out token slots with padlock icons until their turn arrives.

---

## Chapter 03 — The GPU Bottleneck: Compute vs. Memory Wall (`03-memory-wall`, paragraphs: 7–10, ~1:30)

**Goal:** Deliver the core technical "aha!" moment — showing why Prefill saturates GPU Tensor Cores (compute-bound GEMM) while Decode starves them waiting on HBM memory bandwidth (memory-bound GEMV).

- **Paragraph 7 — Inside an AI GPU (Factory vs. Highway):**
  - **Beat:** Introduce the two key subsystems of a modern GPU (e.g., H100-class): massive **HBM** (~80 GB storage, ~3.3 TB/s memory bus) connected by a narrow pipe to ultra-fast on-chip **SRAM + Tensor Cores** (~1,000 TFLOPS math engine).
  - **Visuals:** Clean architectural schematic of a GPU die:
    - Left block: `HBM (Model Weights — 140 GB)` (large memory bank).
    - Center channel: `Memory Bus (3.3 TB/s)` (explicitly drawn narrower than the compute grid).
    - Right block: `SRAM + Tensor Cores (1,000 TFLOPS)` (dense glowing grid of math units).
  - **Motion & `wordFrame` cues:** On `"HBM"` / `"memory"` → left bank highlights; on `"bandwidth"` / `"bus"` → center pipe pulses; on `"Tensor"` / `"compute"` → right grid lights up brightly.

- **Paragraph 8 — Prefill = GEMM (Matrix × Matrix):**
  - **Beat:** During Prefill, the GPU loads each layer's weight matrix from HBM *once* and multiplies it against *hundreds or thousands* of input tokens at the same time — high arithmetic intensity.
  - **Visuals:** Top half shows the GPU diagram in Prefill mode: one wave of weights crosses the bus into SRAM, where a big cyan input matrix `[1024 × d]` multiplies the weights `[d × d]` (`GEMM`). Almost every cell in the Tensor Core grid glows bright cyan. Bottom inset card shows the **Freight Train analogy** (minimalist vector icon: one train pulling many cyan containers).
  - **Motion & `wordFrame` cues:** On `"once"` → weight block transfers once; on `"matrix"` / `"GEMM"` → equation `[1024 × d] × [d × d]` snaps into focus; on `"freight"` (or chosen analogy word) → inset card slides in.

- **Paragraph 9 — Decode = GEMV (Matrix × Vector):**
  - **Beat:** During Decode, you only have *one* new token vector `[1 × d]`, yet you still must haul the *entire* model's weights across the memory bus from HBM just to produce that single token — and then do it all over again for the next word.
  - **Visuals:** The same GPU schematic switches to amber Decode mode: huge weight blocks stream relentlessly through the redlined memory bus (`#FB7185` traffic jam), arrive at SRAM, multiply one tiny amber vector `[1 × d]` (`GEMV`), emit 1 token, vanish, and immediately repeat. Bottom inset card shows the **18-Wheeler Delivering One Postcard analogy** (one giant truck carrying a single tiny amber envelope).
  - **Motion & `wordFrame` cues:** On `"entire"` / `"weights"` → heavy weight blocks flood the bus; on `"single"` / `"one"` → tiny `[1 × d]` vector flashes briefly while 90% of Tensor Core cells stay dark; on `"repeat"` → loop accelerates rapidly.

- **Paragraph 10 — The Utilization Shock (Memory Wall):**
  - **Beat:** Compare GPU utilization side-by-side: Prefill is **compute-bound** (Tensor Cores busy); Decode hits the **Memory Wall** (bandwidth maxed at 100%, Tensor Cores idling at ~2–5%). You're paying for a $30k supercomputer while 95% of its math units wait on bytes.
  - **Visuals:** Two side-by-side telemetry dashboards:
    - Left (`PREFILL — Compute-Bound`, cyan): `Tensor Cores: 82%`, `HBM Bus: 45%`, Status: `Efficient`.
    - Right (`DECODE — Memory-Bound`, amber/rose): `Tensor Cores: 3%` (dim/idle), `HBM Bus: 100%` (pulsing redline `MEMORY WALL`), Status: `Starved`.
  - **Motion & `wordFrame` cues:** On `"compute-bound"` → left bars animate smoothly; on `"memory-bound"` / `"idle"` → right HBM meter slams into 100% redline while Compute drops to a tiny sliver.

---

## Chapter 04 — The KV Cache & The Slot-Time Tax (`04-kv-cache`, paragraphs: 11–14, ~1:20)

**Goal:** Show the second half of why output is expensive: VRAM capacity consumed by the growing KV Cache, the batching vs. latency ceiling, and wall-clock GPU occupancy.

- **Paragraph 11 — Why the KV Cache Exists:**
  - **Beat:** Every new output token must attend to every previous token. Recomputing all earlier tokens from scratch on every step would be quadratic disaster, so we save each token's **Key (K) and Value (V)** vectors in VRAM — the **KV Cache**.
  - **Visuals:** Attention web diagram: token #50 points back to tokens #1–#49. A red `Recompute Everything (O(N²))` path gets crossed out, replaced by a clean cyan/amber memory shelf labeled `KV Cache (VRAM)` storing neat `[K | V]` blocks for each past token.
  - **Motion & `wordFrame` cues:** On `"recompute"` → red tangled arrows appear and strike through; on `"KV"` / `"cache"` → clean `[K | V]` drawer slides open and locks into VRAM.

- **Paragraph 12 — The Growing Memory Tax:**
  - **Beat:** The KV cache solves redundant compute, *but* every output token appends another `[K | V]` slice to VRAM — and every decode step now has to stream both the model weights *and* the growing KV cache across HBM.
  - **Visuals:** Live VRAM bar (80 GB HBM) divided into two regions: fixed `Model Weights` block on the left + dynamically growing amber `KV Cache` bar expanding rightward as each output token is emitted, accompanied by an arrow showing `Weights + KV Cache` both squeezing through the HBM memory bus.
  - **Motion & `wordFrame` cues:** On `"grows"` → amber KV Cache block visibly expands step by step; on `"read"` / `"bandwidth"` → second stream of KV blocks joins weights inside the HBM pipe.

- **Paragraph 13 — Why Batching Can't Fully Save You:**
  - **Beat:** Engineers naturally ask: "Can't we just batch 100 users together to share one weight load across 100 tokens?" Continuous batching helps hugely — *until* you slam into two hard limits: VRAM runs out of room for 100 KV caches, and larger batches increase Time-Per-Output-Token (TPOT), making chat streaming feel sluggish.
  - **Visuals:** Interactive-style 2-panel diagram:
    - Left: `VRAM Capacity` grid filling with colored user KV-cache rows (`User 1`, `User 2`, ... `User 64`) until hitting a glowing rose `VRAM FULL (OOM)` ceiling.
    - Right: `Throughput vs. Latency` seesaw/curve — as batch size rises, `Tokens/sec (GPU)` rises in emerald, while `User Streaming Speed (TPOT)` degrades into amber/rose lag.
  - **Motion & `wordFrame` cues:** On `"batch"` → user rows pack tightly into VRAM; on `"memory"` / `"limit"` → rose ceiling flashes; on `"latency"` / `"slow"` → streaming text cursor visibly stutters as the seesaw tips.

- **Paragraph 14 — Providers Sell GPU-Seconds, Not Tokens:**
  - **Beat:** Tie chapters 3 & 4 together: Prefill borrows the GPU for milliseconds at high utilization; a long output occupies a GPU VRAM slot for seconds or minutes at low utilization. Output pricing reflects **GPU-seconds consumed**.
  - **Visuals:** Clean Gantt-style GPU occupancy grid showing 4 concurrent user lanes over 10 seconds: tiny thin cyan slivers (`Prefill: 40 ms`) followed by long amber reservation bars (`Decode: 8,000 ms`) blocking other incoming requests. Big takeaway stamp: `Cost ∝ GPU-Seconds Occupied`.
  - **Motion & `wordFrame` cues:** On `"milliseconds"` → cyan slivers flash; on `"seconds"` → amber bars stretch across the entire timeline; on `"GPU-seconds"` → takeaway stamp locks in center-bottom.

---

## Chapter 05 — Why the Gap Is Getting Even Wider (`05-widening-gap`, paragraphs: 15–17, ~1:00)

**Goal:** Connect GPU physics to two trends every developer notices on their bill today: Prompt Caching and Reasoning Models.

- **Paragraph 15 — Prompt Caching Discounts Inputs by 50–90%:**
  - **Beat:** System prompts, tool schemas, and codebase context repeat across turns, so providers cache their prefilled KV states in memory — skipping Prefill almost entirely and slashing input cost up to 90%. Output tokens are unique and can never be pre-cached.
  - **Visuals:** Stacked prompt anatomy (`System Prompt + Tools + Docs` in emerald `CACHED KV — 90% OFF`, `New User Message` in cyan, `Generated Output` in amber `0% CACHEABLE`). A live cost ratio ticker climbs from `5×` to `50×` (Output vs. Cached Input).
  - **Motion & `wordFrame` cues:** On `"cached"` / `"reuse"` → prefix turns emerald with a lightning bypass skipping Prefill; on `"output"` → amber block stays uncached and ratio jumps.

- **Paragraph 16 — Reasoning Models Multiply Hidden Output Tokens:**
  - **Beat:** Modern reasoning models generate hundreds or thousands of hidden "thinking" tokens before showing a 2-sentence answer — and every single thinking token is an autoregressive decode step billed at full output rates.
  - **Visuals:** Chat UI card showing a short user question and a tiny 2-line visible answer — then the UI "peels open" like an X-ray to reveal a huge collapsed amber `<thinking>` block containing 2,400 streaming decode tokens underneath.
  - **Motion & `wordFrame` cues:** On `"thinking"` / `"hidden"` → X-ray drawer expands dramatically; on `"output"` / `"billed"` → amber price meter ticks rapidly alongside the hidden tokens.

- **Paragraph 17 — Real-World Agentic Invoice Breakdown:**
  - **Beat:** Show what a typical AI coding/agent API call looks like on an invoice: 40,000 cached input tokens cost pennies, while 3,000 reasoning + output tokens eat 70–80% of the total bill.
  - **Visuals:** Two proportional horizontal bar comparisons:
    - Top bar (`Token Volume`): 93% Input (emerald/cyan) vs. 7% Output (amber).
    - Bottom bar (`Actual Dollar Cost`): 25% Input vs. **75% Output** (amber dominates).
  - **Motion & `wordFrame` cues:** On `"volume"` → top bar fills mostly cyan/emerald; on `"bill"` / `"cost"` → bars morph and flip ratios so the tiny 7% amber slice expands to dominate the cost bar.

---

## Chapter 06 — How AI Labs Fight the Memory Wall (`06-optimizations`, paragraphs: 18–20, ~1:10)

**Goal:** Highlight the clever systems engineering keeping output prices from being 20×–50× higher — giving software engineers accurate vocabulary for modern inference stacks.

- **Paragraph 18 — Shrink What Crosses the Memory Bus (Quantization, GQA/MLA, MoE):**
  - **Beat:** If decode is bottlenecked by moving weights and KV cache from HBM, the #1 lever is moving *fewer bytes* per token:
    - **Quantization (FP16 → FP8/INT4):** shrinks weights 2×–4×.
    - **GQA / MLA:** compresses the KV cache dramatically.
    - **Mixture of Experts (MoE):** only activates a small slice of weights per token (e.g., 30B active out of 600B total), cutting HBM traffic massively.
  - **Visuals:** Three crisp side-by-side emerald optimization cards above the HBM pipe diagram:
    1. `Quantization`: 16-bit block shrinks to 8-bit / 4-bit block (`2×–4× smaller`).
    2. `GQA / MLA`: fat KV cache compresses into a slim latent vector bar.
    3. `MoE`: 8 expert blocks appear; router lights up only 2 active experts (`~85% skipped`).
  - **Motion & `wordFrame` cues:** Animate each card sequentially on `"quantization"`, `"GQA"` / `"MLA"`, and `"Mixture of Experts"` / `"MoE"`, visually unclogging the HBM pipe below.

- **Paragraph 19 — Speculative Decoding (Hacking Autoregression):**
  - **Beat:** Use a tiny, blazing-fast "draft" model to guess 4–6 tokens ahead, then feed all of them into the giant model at once to *verify in parallel* — turning memory-bound decode partially back into compute-bound prefill!
  - **Visuals:** Two-track animation:
    - Top fast track (`Tiny Draft Model`): rapidly spits out 5 candidate tokens (`[the] [GPU] [waits] [for] [bytes]`).
    - Bottom track (`Big Model — Single Parallel Pass`): verifies all 5 simultaneously in one cyan GEMM wave — 4 get emerald checkmarks ✓, 1 gets corrected in amber, yielding 4+ output tokens for the memory cost of 1!
  - **Motion & `wordFrame` cues:** On `"draft"` → 5 candidate chips pop rapidly; on `"verify"` / `"parallel"` → single cyan wave sweeps all 5 at once with emerald checkmarks.

- **Paragraph 20 — PagedAttention & Prefill–Decode Disaggregation:**
  - **Beat:** At the serving layer, **PagedAttention** eliminates KV cache fragmentation (like OS virtual memory pages) so more users fit in VRAM, while **Prefill–Decode Disaggregation** splits clusters into compute-heavy Prefill GPUs and bandwidth-optimized Decode GPUs so long prompts don't stall active streamers.
  - **Visuals:** Cluster routing diagram: incoming requests hit a `Prefill Pool (Compute-Optimized)` (cyan), transfer their KV cache across high-speed interconnect (NVLink/RDMA) into a `Decode Pool (Memory-Optimized, Paged VRAM)` (amber/emerald) that streams cleanly to users.
  - **Motion & `wordFrame` cues:** On `"PagedAttention"` → fragmented VRAM blocks defragment cleanly into tidy OS-style pages; on `"disaggregation"` → single tangled GPU cluster splits into two smooth specialized pools.

---

## Chapter 07 — What This Means For Your AI App (`07-developer-takeaways`, paragraphs: 21–23, ~0:55)

**Goal:** Translate hardware physics into 3 concrete engineering habits that immediately cut LLM API bills and latency.

- **Paragraph 21 — Shift Work From Output to Input:**
  - **Beat:** Input is cheap and cacheable; output is slow and expensive. Give rich context, examples, and docs upfront in stable prefixes, and ask the model for concise, structured outputs (diffs/patches instead of rewriting entire files, tight JSON instead of chatty prose).
  - **Visuals:** Split "Before vs. After" code/prompt card:
    - Left (`Expensive`, rose/amber): `"Rewrite the entire 400-line file with the fix"` → giant amber output bar.
    - Right (`Inference-Aware`, emerald): `Cached 400-line file` + `"Return a 12-line unified diff"` → tiny amber output bar.
  - **Motion & `wordFrame` cues:** On `"concise"` / `"diff"` → right card illuminates and output bar shrinks by 90%.

- **Paragraph 22 — Protect Your Cache Prefix & Budget Reasoning:**
  - **Beat:** Keep static system prompts and tool definitions at the top of your prompt (don't inject dynamic timestamps at byte 0 that bust the KV cache!), and route simple verbose tasks to smaller/cheaper models while reserving heavy reasoning budgets for genuinely hard steps.
  - **Visuals:** Prompt stack visual showing a `Dynamic Timestamp` badge moving from the very top (where it turns the whole prefix red `CACHE MISS`) down to the bottom user message (turning the entire static prefix emerald `CACHE HIT`), paired with a model router dial (`Fast/Small` vs. `Heavy Reasoning`).
  - **Motion & `wordFrame` cues:** On `"timestamp"` / `"cache"` → badge slides from top to bottom and cache status flips from rose to emerald; on `"route"` → router dial switches cleanly.

- **Paragraph 23 — The Cost Impact Summary:**
  - **Beat:** Putting those habits together routinely cuts production LLM spend by 50–80% while making responses feel noticeably faster to users.
  - **Visuals:** Clean 3-item engineering scorecard (emerald checks):
    1. `Keep outputs tight (diffs, JSON, stop tokens)`
    2. `Keep prefixes static for KV cache hits`
    3. `Route verbose & easy steps to smaller models`
    Alongside a live cost & latency reduction gauge (`-65% Cost`, `2.5× Faster`).
  - **Motion & `wordFrame` cues:** Each checklist item staggers in on its matching cue; cost/latency badges spring in on the closing phrase.

---

## Chapter 08 — Closing Synthesis (`08-outro`, paragraph: 24, ~0:25)

**Goal:** Leave the viewer with one unforgettable mental model that explains API pricing forever.

- **Paragraph 24 — One Mental Model to Remember:**
  - **Beat:** Summarize the entire video in one crisp contrast: **Reading tokens is parallel math (compute-bound); writing tokens is serial memory traffic (bandwidth-bound).** Next time you see a 5× output price on an API pricing page, you're not seeing markup — you're seeing the physics of streaming hundreds of gigabytes across silicon just to pick the next word.
  - **Visuals:** Minimalist split-screen callback mirroring Chapter 01 & 03:
    - Left (cyan): `INPUT / PREFILL` → `Parallel Math (Compute-Bound)`
    - Right (amber): `OUTPUT / DECODE` → `Serial Memory Traffic (Bandwidth-Bound)`
    Smooth transition into a clean end-card frame with subtle space for YouTube end-screen elements.
  - **Motion & `wordFrame` cues:** On `"parallel"` → left side locks in; on `"serial"` / `"memory"` → right side locks in; fade cleanly into end-card safe zones.
