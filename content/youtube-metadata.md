# YouTube Publish Metadata

## Recommended Title
**AI Agent Harnesses Explained: The Operating System Behind Claude Code, Codex & Cursor**

### Alternative A/B Title Ideas
- **Curiosity / Paradox:** Same Frontier LLM, Opposite Results — Why the Agent Harness Matters Most
- **Mental Model / Systems:** Agent = Model + Harness (How Production AI Coding Agents Actually Work)
- **Builder Takeaway:** How to Build Reliable AI Agent Harnesses: Loops, Caching, Sandboxes & Evals

---

## Thumbnail (`src/Thumbnail.tsx` → `out/thumbnail.png`, 1280×720)
- **Visual hook:** `AI AGENT HARNESSES EXPLAINED` (`Space Grotesk`, bold white + glowing Cyan accent) + `MODEL + HARNESS = AGENT` equation paired with the `Model = CPU` → `THE HARNESS OS` (`LOOP & TOOLS`, `KV CONTEXT`, `SANDBOX`, `VERIFIERS`, `PASS ✓`) architecture visual on the right.
- **Safe zone:** Right column lifted (`marginBottom: 72`) so the bottom-right corner (~128px clearance) stays completely clear for YouTube's `18:21` duration badge.

---

## Description (Copy-Paste Ready)

```text
Put two AI coding agents powered by the exact same frontier LLM on the exact same engineering bug, and one burns 20 turns failing while the other passes every test. The difference isn't the model — it's the agent harness wrapped around it.

In this systems deep dive, we open up modern AI agent harnesses like Claude Code, Codex, Cursor, Gemini CLI, Windsurf, OpenCode, Aider, Cline, Roo Code, Devin, OpenHands, and Manus — breaking down the 6 pillars that turn a stateless LLM into reliable software, and showing why the same harness engine powers coding, browser, research, and operations agents alike.

Chapters:
00:00 The Harness Paradox
01:26 Model vs. Harness vs. Framework
03:53 The Agent Loop & Tool Calling
06:16 Context Management & Cache Economics
09:11 Memory & Durable State Across Sessions
10:37 Verification, Permissions & Sandboxes
13:25 Next Level: Sub-agents, Delegation & Scale
14:59 Observability, Evals & Build-to-Delete
17:02 The OS Mental Model & Outro

Key Takeaways:
• Agent = Model + Harness: treat the LLM as the CPU, context as RAM, filesystem & git as Disk, tools/hooks/sandboxes as Kernel & I/O, and tests/evals as the Debugger.
• Tools are a UI for the model (ACI): keep primitives small and composable, return actionable errors, and use targeted diffs instead of full-file rewrites.
• Protect KV prompt cache prefixes: keep system prompts & tool schemas token-identical, append history monotonically, truncate noisy logs to disk, and load skills lazily into the conversation tail.
• Enforce reliability in code, not ALL-CAPS prompt begging: pair closed-loop verification (tests, LSP linters, self-checks) with PreToolUse/PostToolUse hooks, OS/container sandboxes, tiered approvals, and doom-loop circuit breakers.
• Use sub-agents primarily for context hygiene & parallel git worktrees, measure production consistency with pass^k (not just pass@k), and build temporary model workarounds to delete.

#AIAgents #AgentHarness #AIEngineering #ClaudeCode #ContextEngineering
```

---

## Tags (Copy-Paste Comma-Separated — keep under 500 chars)

```text
ai agent harness,ai agents explained,coding agents,claude code,openai codex,cursor ai,context engineering,prompt caching,kv cache llm,agentic workflows,tool calling llm,mcp model context protocol,ai agent sandboxing,subagents,llm evals,swe-bench,aider,opencode,devin ai,openhands,manus ai,langgraph,deep agents,ai engineering,software engineering
```

---

## Publishing Settings & Checklist
- **Category:** Science & Technology
- **Language:** English
- **Captions:** Upload `content/subtitles.srt` generated via `mycli` (in-video `CaptionsOverlay` is disabled by default)
- **Chapters:** Verified 1:1 against `content/youtube-chapters.txt` starting at `00:00`
- **Pinned Comment Idea:**
  > If you're building with coding agents or designing your own agent harness right now, which bottleneck has hit your team the hardest — context rot, tool/MCP sprawl, or sandboxing & permissions? Drop your stack and war stories below!
- **End Screen:** Clean right/lower-right dark atmospheric zone reserved across the final ~18s (`P37`) for YouTube end-screen video & subscribe cards.
