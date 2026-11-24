import type React from "react";
import type { ChapterInfo, ClipInfo } from "../lib/timeline";
import { HookChapter } from "./01-hook";
import { MainPointChapter } from "./02-main-point";

export type ChapterComponentProps = {
  chapter: ChapterInfo;
  clips: ClipInfo[];
};

export const CHAPTER_COMPONENTS: Record<string, React.FC<ChapterComponentProps>> = {
  "01-hook": HookChapter,
  "02-main-point": MainPointChapter,
};
