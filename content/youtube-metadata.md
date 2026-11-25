# YouTube Publish Metadata

## Recommended Title
**Why AI Output Tokens Cost 5× More Than Input Tokens**

### Alternative A/B Title Ideas
- Why AI Output Tokens Are So Expensive (GPU Physics Explained)
- Same Model, 5× the Price: Why LLM Output Tokens Cost So Much
- The GPU Bottleneck Behind Expensive AI Output Tokens
- Why Reading Tokens Is Cheap — And Writing Them Is 5× Expensive

---

## Thumbnail (`src/Thumbnail.tsx` → `out/thumbnail.png`, 1280×720)
- **Visual hook:** `WHY AI OUTPUT COSTS 5× MORE` paired with a high-contrast `INPUT $3 (82% GPU)` vs. `OUTPUT $15 (3% GPU — HBM MEMORY WALL)` comparison card.
- **Safe zone:** Bottom-right kept clean for YouTube's `6:56` timestamp badge.

---

## Description (Copy-Paste Ready)

```text
Open any AI API pricing page and one number jumps right out: output tokens cost 3×–5× more than input tokens — and up to 50× more than cached input.

They're both just tokens passing through the exact same Transformer model and weights. So why is writing tokens so much more expensive than reading them?

It's not arbitrary markup — it's GPU physics. In this video, we go inside an AI GPU to break down the two phases of LLM inference (Prefill vs. Decode), why output generation slams into the HBM Memory Wall while 95% of your GPU sits idle, how the KV cache turns tokens into GPU-seconds, and the exact engineering tricks (MoE, quantization, speculative decoding, PagedAttention, and prompt caching) AI labs and developers use to fight back.

Chapters:
00:00 The Pricing Paradox
00:48 Two Worlds: Prefill vs. Decode
01:34 Compute vs. The Memory Wall
02:47 The KV Cache & Slot-Time Tax
03:58 Why the Gap Keeps Widening
04:47 How AI Labs Fight the Memory Wall
05:45 What This Means for Your AI App
06:35 Closing Synthesis

Key Takeaways for AI Developers:
• Shift work from output to input (request concise diffs or tight JSON instead of full file rewrites)
• Keep prompt prefixes static from byte 0 so you don't bust the KV prompt cache
• Route routine, verbose generation to smaller models and reserve reasoning budgets for genuinely hard steps

#AI #LLM #GPU #MachineLearning #SoftwareEngineering #AIEngineering
```

---

## Tags (Copy-Paste Comma-Separated — 469 / 500 chars)

```text
why ai output tokens are expensive,llm output tokens,input vs output tokens,prefill vs decode,llm inference explained,kv cache explained,gpu memory wall,hbm bandwidth llm,ai api pricing explained,gemm vs gemv,prompt caching llm,reasoning models token cost,speculative decoding,mixture of experts moe,pagedattention vllm,prefill decode disaggregation,ai engineering,transformer inference,gpu utilization llm,reduce llm api cost
```

---

## Publishing Settings & Checklist
- **Category:** Science & Technology
- **Language:** English
- **Captions:** Upload separate `.srt` subtitle track (in-video captions are disabled in Remotion)
- **Pinned Comment Idea:**
  > Curious what your real-world AI API bills look like — are reasoning/thinking tokens or long outputs dominating your spend, or are you mostly seeing cache misses? Drop your stack below!
- **End Screen:** Safe visual space reserved in Chapter 08 (`06:35`–`06:56`).
