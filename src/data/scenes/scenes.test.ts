import { describe, expect, it } from "vitest";
import { scenes3D } from "@/src/data/scenes/scenes";
import { chapters } from "@/src/data/story/chapters";
import { comicPanels } from "@/src/data/comics/panels";

describe("3D scenes", () => {
  it("ships all six body-adventure scenes", () => {
    expect(scenes3D.map((scene) => scene.id)).toEqual([
      "marrow-factory",
      "vessel-highway",
      "detective-lab",
      "treatment-marathon",
      "shield-camp",
      "recovery-garden",
    ]);
    for (const scene of scenes3D) {
      expect(scene.hotspots.length).toBeGreaterThanOrEqual(3);
      expect(new Set(scene.hotspots.map((hotspot) => hotspot.id)).size).toBe(scene.hotspots.length);
    }
  });

  it("gives every scene a sticker and every hotspot a spoken extra line plus a quiz", () => {
    for (const scene of scenes3D) {
      expect(scene.sticker.title.length).toBeGreaterThan(0);
      expect(scene.sticker.text.length).toBeGreaterThan(0);
      for (const hotspot of scene.hotspots) {
        expect(hotspot.extra.length).toBeGreaterThan(0);
        expect(hotspot.quiz.question.length).toBeGreaterThan(0);
        expect(hotspot.quiz.explain.length).toBeGreaterThan(0);
        expect(new Set(hotspot.quiz.options).size).toBe(hotspot.quiz.options.length);
        expect(hotspot.quiz.answer).toBeGreaterThanOrEqual(0);
        expect(hotspot.quiz.answer).toBeLessThan(hotspot.quiz.options.length);
      }
    }
  });

  it("is referenced only by chapters and panels that point at existing scenes", () => {
    const ids = new Set(scenes3D.map((scene) => scene.id));
    expect(chapters.filter((chapter) => chapter.scene3dId && !ids.has(chapter.scene3dId)).map((chapter) => chapter.id)).toEqual([]);
    expect(comicPanels.filter((panel) => panel.scene3dId && !ids.has(panel.scene3dId)).map((panel) => panel.id)).toEqual([]);
    expect(chapters.filter((chapter) => chapter.scene3dId).map((chapter) => chapter.id)).toEqual([
      "helpers",
      "factory",
      "mischief",
      "detective",
      "marathon",
      "shield",
      "school",
      "followup",
    ]);
  });
});
