# YouTube Publish Metadata

## Recommended Title
**<Primary Video Title>**

### Alternative A/B Title Ideas
- <Alternative angle 1 — curiosity / paradox>
- <Alternative angle 2 — concrete metric or comparison>
- <Alternative angle 3 — outcome / developer takeaway>

---

## Thumbnail (`src/Thumbnail.tsx` → `out/thumbnail.png`, 1280×720)
- **Visual hook:** `<3–5 bold words>` paired with a high-contrast focal visual on the right.
- **Safe zone:** Keep the bottom-right corner clear for YouTube's video duration badge.

---

## Description (Copy-Paste Ready)

```text
<Opening 1–2 hook sentences that reinforce the title and click promise.>

<Brief 2–3 sentence summary of what the video breaks down and why it matters.>

Chapters:
00:00 Hook
00:06 Main Point

Key Takeaways:
• <Takeaway 1>
• <Takeaway 2>
• <Takeaway 3>

#TagOne #TagTwo #TagThree
```

---

## Tags (Copy-Paste Comma-Separated — keep under 500 chars)

```text
keyword one,keyword two,keyword three
```

---

## Publishing Settings & Checklist
- **Category:** Science & Technology
- **Language:** English
- **Captions:** Upload `content/subtitles.srt` generated via `mycli` (in-video `CaptionsOverlay` is disabled by default)
- **Chapters:** Copy timestamps from `content/youtube-chapters.txt` into the Description above
- **Pinned Comment Idea:**
  > <Engaging question tied to the video's topic to spark discussion in the comments.>
- **End Screen:** Reserve clean visual space in the closing chapter for YouTube end-screen elements.
