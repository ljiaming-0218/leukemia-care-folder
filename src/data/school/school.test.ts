import { describe, expect, it } from "vitest";
import { schoolGuide } from "@/src/data/school/schoolGuide";
import { sources } from "@/src/data/story/sources";

describe("school guide", () => {
  it("covers classmates and teachers with at least three points each", () => {
    expect(schoolGuide.audiences.map((audience) => audience.id).sort()).toEqual(["classmates", "teachers"]);
    for (const audience of schoolGuide.audiences) {
      expect(audience.points.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("only cites known sources", () => {
    const known = new Set(sources.map((source) => source.id));
    expect(schoolGuide.sourceIds.filter((id) => !known.has(id))).toEqual([]);
  });

  it("tells classmates that leukemia is not contagious", () => {
    const classmates = schoolGuide.audiences.find((audience) => audience.id === "classmates");
    expect([classmates?.lead, ...(classmates?.points ?? [])].join("")).toContain("不会传染");
  });

  it("does not promise outcomes or include dosing", () => {
    const text = [
      schoolGuide.intro,
      ...schoolGuide.audiences.flatMap((audience) => [audience.lead, ...audience.points]),
      ...schoolGuide.reminders,
    ].join("\n");
    expect(text).not.toMatch(/治愈率|生存率|复发率|\d+\s*%|mg|毫克|保证|一定会/);
  });
});