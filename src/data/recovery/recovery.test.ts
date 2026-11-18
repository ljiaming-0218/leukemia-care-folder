import { describe, expect, it } from "vitest";
import { RECOVERY_CATEGORIES, RECOVERY_STAGES, recoveryTips } from "@/src/data/recovery/recovery";
import { sources } from "@/src/data/story/sources";

describe("recovery tips", () => {
  it("covers all ten categories with do / dont / when-to-call and sources", () => {
    const covered = new Set(recoveryTips.map((tip) => tip.category));
    for (const category of RECOVERY_CATEGORIES) {
      expect(covered.has(category)).toBe(true);
    }
    const sourceIds = new Set(sources.map((source) => source.id));
    for (const tip of recoveryTips) {
      expect(tip.do.length).toBeGreaterThan(0);
      expect(tip.dont.length).toBeGreaterThan(0);
      expect(tip.whenToCall.length).toBeGreaterThan(0);
      expect(tip.stages.length).toBeGreaterThan(0);
      for (const stage of tip.stages) {
        expect(RECOVERY_STAGES).toContain(stage);
      }
      expect(tip.sourceIds.filter((id) => !sourceIds.has(id))).toEqual([]);
    }
    expect(new Set(recoveryTips.map((tip) => tip.id)).size).toBe(recoveryTips.length);
  });

  it("stays within reminder-only boundaries", () => {
    for (const tip of recoveryTips) {
      const text = [tip.title, ...tip.do, ...tip.dont, ...tip.whenToCall].join(" ");
      expect(text).not.toMatch(/泼尼松|地塞米松|甲氨蝶呤|长春新碱|\d+\s*(mg|毫克)|治愈率|生存率|复发率|\d+\s*%/);
    }
  });
});
