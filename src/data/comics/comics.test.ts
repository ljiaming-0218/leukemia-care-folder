import { describe, expect, it } from "vitest";
import { ART_KEYS, comicPanels, getComicPanels } from "@/src/data/comics/panels";
import { chapters } from "@/src/data/story/chapters";

const COMIC_CHAPTERS = ["helpers", "factory", "mischief", "detective", "marathon", "shield", "school", "followup"];

describe("comic panels", () => {
  it("covers all 8 chapters with 8-14 panels each", () => {
    for (const chapterId of COMIC_CHAPTERS) {
      const panels = getComicPanels(chapterId);
      expect(panels.length, chapterId).toBeGreaterThanOrEqual(8);
      expect(panels.length, chapterId).toBeLessThanOrEqual(14);
    }
    expect(new Set(comicPanels.map((panel) => panel.chapterId))).toEqual(new Set(COMIC_CHAPTERS));
  });

  it("numbers panels 1..n per chapter with unique ids", () => {
    expect(new Set(comicPanels.map((panel) => panel.id)).size).toBe(comicPanels.length);
    for (const chapterId of COMIC_CHAPTERS) {
      const panels = getComicPanels(chapterId);
      expect(panels.map((panel) => panel.order)).toEqual(panels.map((_, index) => index + 1));
    }
  });

  it("links panels to existing chapters and uses every art key", () => {
    const chapterIds = new Set(chapters.map((chapter) => chapter.id));
    expect(comicPanels.filter((panel) => !chapterIds.has(panel.chapterId)).map((panel) => panel.id)).toEqual([]);
    const used = new Set(comicPanels.map((panel) => panel.art));
    expect(ART_KEYS.filter((key) => !used.has(key))).toEqual([]);
  });

  it("gives the bone-marrow-puncture chapter a content warning on its first panel", () => {
    const [first] = getComicPanels("detective");
    expect(first.contentWarning).toBeTruthy();
  });

  it("does not promise outcomes or give dosing in panel text", () => {
    const text = comicPanels
      .flatMap((panel) => [panel.caption ?? "", ...(panel.dialogue ?? []).map((line) => line.text)])
      .join("\n");
    expect(text).not.toMatch(/\d+\s*%|治愈率|生存率|复发率|mg|毫克/);
  });
});
