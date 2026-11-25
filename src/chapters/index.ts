import type React from "react";
import type { ChapterInfo, ClipInfo } from "../lib/timeline";
import { HookChapter } from "./01-hook";
import { PrefillVsDecodeChapter } from "./02-prefill-vs-decode";
import { MemoryWallChapter } from "./03-memory-wall";
import { KvCacheChapter } from "./04-kv-cache";
import { WideningGapChapter } from "./05-widening-gap";
import { OptimizationsChapter } from "./06-optimizations";
import { DeveloperTakeawaysChapter } from "./07-developer-takeaways";
import { OutroChapter } from "./08-outro";

export type ChapterComponentProps = {
  chapter: ChapterInfo;
  clips: ClipInfo[];
};

export const CHAPTER_COMPONENTS: Record<string, React.FC<ChapterComponentProps>> = {
  "01-hook": HookChapter,
  "02-prefill-vs-decode": PrefillVsDecodeChapter,
  "03-memory-wall": MemoryWallChapter,
  "04-kv-cache": KvCacheChapter,
  "05-widening-gap": WideningGapChapter,
  "06-optimizations": OptimizationsChapter,
  "07-developer-takeaways": DeveloperTakeawaysChapter,
  "08-outro": OutroChapter,
};
