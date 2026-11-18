import { describe, expect, it } from "vitest";
import { feelingTools } from "@/src/data/feelings/feelings";
import { recoveryTips } from "@/src/data/recovery/recovery";
import { chapters } from "@/src/data/story/chapters";
import { sources } from "@/src/data/story/sources";
import { words } from "@/src/data/story/words";

describe("story content", () => {
  it("numbers chapters 1..n with unique ids", () => {
    expect(chapters.map((chapter) => chapter.number)).toEqual(chapters.map((_, index) => index + 1));
    expect(new Set(chapters.map((chapter) => chapter.id)).size).toBe(chapters.length);
  });

  it("uses every source at least once", () => {
    const used = new Set<string>([
      ...chapters.flatMap((chapter) => chapter.sourceIds),
      ...words.map((word) => word.sourceId),
      ...recoveryTips.flatMap((tip) => tip.sourceIds),
      ...feelingTools.flatMap((tool) => tool.sourceIds),
    ]);
    expect(sources.filter((source) => !used.has(source.id)).map((source) => source.id)).toEqual([]);
  });

  it("links every word to an existing chapter", () => {
    const ids = new Set(chapters.map((chapter) => chapter.id));
    expect(words.filter((word) => !ids.has(word.chapterId)).map((word) => word.id)).toEqual([]);
    expect(new Set(words.map((word) => word.id)).size).toBe(words.length);
  });

  it("does not give prognosis percentages or dosing in kid text", () => {
    const kidText = [...chapters.flatMap((chapter) => chapter.kidText), ...words.map((word) => word.kid)].join("\n");
    expect(kidText).not.toMatch(/\d+\s*%|治愈率|生存率|mg|毫克/);
  });
});
