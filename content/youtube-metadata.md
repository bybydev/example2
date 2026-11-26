# YouTube Publish Metadata

## Recommended Title
**MCP Explained: How Model Context Protocol Connects AI to Everything (In 10 Minutes)**

### Alternative A/B Title Ideas
- **Model Context Protocol (MCP) Explained Clearly — The "USB-C" for AI**
- **Why Every AI App Is Adopting MCP (M × N → M + N Explained Visually)**
- **MCP Explained for Everyone: Architecture, Live Trace, Setup & Security**

---

## Thumbnail (`src/Thumbnail.tsx` → `out/thumbnail.png`, 1280×720)
- **Visual hook:** `MCP EXPLAINED` (`M × N → M + N · USB-C FOR AI`) paired with a high-contrast `Before MCP` (tangled 50+ glue links) vs. `With MCP` (1 universal port hub) comparison on the right.
- **Safe zone:** Bottom-right corner kept clear (`46px` extra column bottom margin + `52px` canvas padding) for YouTube's video duration badge.

---

## Description (Copy-Paste Ready)

```text
Stop copy-pasting context between Slack, Notion, Google Drive, and your AI chat box — here is how Model Context Protocol (MCP) connects AI safely to your real tools and live data.

Whether you use AI apps like Claude, ChatGPT, Cursor, or VS Code every day, or build AI software yourself, this 10-minute visual breakdown covers why MCP exists (collapsing M × N custom glue into M + N), how Host, Client, and Server work under the hood, the 3 core primitives (Tools, Resources, Prompts), a live end-to-end request trace, local stdio vs. remote Streamable HTTP, how to start using MCP today, and the real security & context-bloat trade-offs to watch out for.

Chapters:
00:00 The Isolated AI Problem
00:55 Why MCP Exists: M × N vs. M + N
02:20 Architecture: Host, Client & Server
03:41 Tools, Resources & Prompts
05:06 Live Trace: Inside an MCP Request
06:19 Local vs. Remote: stdio & Streamable HTTP
07:22 How to Start Using MCP Today
08:19 Trade-offs, Security & The Big Picture

Key Takeaways:
• MCP doesn't replace REST APIs or function calling — it acts as one universal adapter collapsing M × N custom integrations into M + N.
• Every MCP setup follows a clean 1:1 Host → Client → Server model exposing Tools (model-controlled), Resources (app-controlled), and Prompts (user-controlled).
• Treat MCP servers like browser extensions: start with 1–2 trusted read-only servers, keep tool count focused to avoid context bloat, and keep human approval enabled on writes.

#MCP #ModelContextProtocol #AI #AIAgents #Claude #ChatGPT #Cursor #TechExplained
```

---

## Tags (Copy-Paste Comma-Separated — keep under 500 chars)

```text
MCP,Model Context Protocol,MCP explained,what is MCP,Model Context Protocol explained,AI agents,USB-C for AI,Claude MCP,ChatGPT MCP,Cursor MCP,VS Code MCP,MCP tutorial,MCP architecture,MCP server,MCP client,MCP tools resources prompts,Streamable HTTP,stdio MCP,AI integrations,prompt injection,tool poisoning,FastMCP
```

---

## Publishing Settings & Checklist
- **Category:** Science & Technology
- **Language:** English
- **Captions:** Upload `content/subtitles.srt` (generated via `mycli`; in-video `CaptionsOverlay` is disabled by default)
- **Chapters:** Synced verbatim from `content/youtube-chapters.txt` (`00:00` – `08:19`)
- **Pinned Comment Idea:**
  > Which MCP server are you planning to connect first (or build next)? Drop it below — always curious what workflows people are wiring up!
- **End Screen:** Chapter 08 (`SceneBeat D`, Paragraphs 29–30) keeps the right ~54% of the frame clean and open for YouTube end-screen video and subscribe cards.
