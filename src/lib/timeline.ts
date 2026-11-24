import data from "../generated/timeline.json";

export type WordTiming = {
  w: string;
  s: number;
  e: number;
};

export type ClipInfo = {
  paragraph: number;
  chapterId: string;
  startFrame: number;
  durationInFrames: number;
  leadFrames: number;
  voiceFrames: number;
  audioFile: string | null;
  timingSource: "whisper" | "estimated" | "none";
  text: string;
  words: WordTiming[];
};

export type ChapterInfo = {
  id: string;
  compositionId: string;
  title: string;
  startFrame: number;
  durationInFrames: number;
  startSeconds: number;
  durationSeconds: number;
  paragraphs: number[];
};

export type TimelineData = {
  schemaVersion: number;
  slug: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  totalFrames: number;
  totalSeconds: number;
  chapters: ChapterInfo[];
  clips: ClipInfo[];
};

export const timeline = data as unknown as TimelineData;

export const chapterById = (id: string): ChapterInfo => {
  const chapter = timeline.chapters.find((item) => item.id === id);
  if (!chapter) {
    throw new Error(`Chapter "${id}" missing from src/generated/timeline.json (run mycli remotion timeline)`);
  }
  return chapter;
};

export const chapterClips = (chapterId: string): ClipInfo[] =>
  timeline.clips.filter((clip) => clip.chapterId === chapterId);

export const clipByParagraph = (paragraph: number): ClipInfo => {
  const clip = timeline.clips.find((item) => item.paragraph === paragraph);
  if (!clip) {
    throw new Error(`Paragraph ${paragraph} missing from src/generated/timeline.json`);
  }
  return clip;
};

const cleanWord = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Return the local frame (relative to the chapter start) when a spoken word starts
 * inside a clip. Falls back to `fallback` if the word is not found.
 */
export const wordFrame = (
  clip: ClipInfo,
  word: string,
  fallback: number,
  options?: { chapterStartFrame?: number; nth?: number }
): number => {
  const target = cleanWord(word);
  if (!target) {
    return fallback;
  }
  const nth = options?.nth ?? 0;
  const chapterOffset = options?.chapterStartFrame ?? clip.startFrame;
  let seen = 0;
  for (const token of clip.words) {
    if (cleanWord(token.w).startsWith(target)) {
      if (seen === nth) {
        return clip.startFrame - chapterOffset + token.s;
      }
      seen += 1;
    }
  }
  return fallback;
};
