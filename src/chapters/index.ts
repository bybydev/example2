import type React from "react";
import type { ChapterInfo, ClipInfo } from "../lib/timeline";
import { HookChapter } from "./01-hook";
import { ModelVsHarnessChapter } from "./02-model-vs-harness";
import { CoreLoopChapter } from "./03-the-core-loop";
import { ContextEngineeringChapter } from "./04-context-engineering";
import { MemoryAndStateChapter } from "./05-memory-and-state";
import { VerificationAndGuardrailsChapter } from "./06-verification-and-guardrails";
import { NextLevelSubagentsChapter } from "./07-next-level-subagents";
import { EvalsAndEvolutionChapter } from "./08-evals-and-evolution";
import { SynthesisAndOutroChapter } from "./09-synthesis-and-outro";

export type ChapterComponentProps = {
  chapter: ChapterInfo;
  clips: ClipInfo[];
};

export const CHAPTER_COMPONENTS: Record<string, React.FC<ChapterComponentProps>> = {
  "01-hook": HookChapter,
  "02-model-vs-harness": ModelVsHarnessChapter,
  "03-the-core-loop": CoreLoopChapter,
  "04-context-engineering": ContextEngineeringChapter,
  "05-memory-and-state": MemoryAndStateChapter,
  "06-verification-and-guardrails": VerificationAndGuardrailsChapter,
  "07-next-level-subagents": NextLevelSubagentsChapter,
  "08-evals-and-evolution": EvalsAndEvolutionChapter,
  "09-synthesis-and-outro": SynthesisAndOutroChapter,
};
