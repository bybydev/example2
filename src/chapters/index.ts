import type React from "react";
import type { ChapterInfo, ClipInfo } from "../lib/timeline";
import { HookChapter } from "./01-hook";
import { MnProblemChapter } from "./02-mn-problem";
import { ArchitectureChapter } from "./03-architecture";
import { PrimitivesChapter } from "./04-primitives";
import { WalkthroughChapter } from "./05-walkthrough";
import { TransportsChapter } from "./06-transports";
import { HowToUseChapter } from "./07-how-to-use";
import { PitfallsAndOutroChapter } from "./08-pitfalls-and-outro";

export type ChapterComponentProps = {
  chapter: ChapterInfo;
  clips: ClipInfo[];
};

export const CHAPTER_COMPONENTS: Record<string, React.FC<ChapterComponentProps>> = {
  "01-hook": HookChapter,
  "02-mn-problem": MnProblemChapter,
  "03-architecture": ArchitectureChapter,
  "04-primitives": PrimitivesChapter,
  "05-walkthrough": WalkthroughChapter,
  "06-transports": TransportsChapter,
  "07-how-to-use": HowToUseChapter,
  "08-pitfalls-and-outro": PitfallsAndOutroChapter,
};
