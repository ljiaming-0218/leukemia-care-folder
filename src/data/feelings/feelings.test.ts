import { describe, expect, it } from "vitest";
import {
  COURAGE_ACTS,
  FAULT_QUESTIONS,
  FEELING_ENTRIES,
  FEELING_TOOL_IDS,
  PARENT_SCRIPTS,
  SEEK_HELP_SIGNS,
  THEATER_SCENARIOS,
  WEATHER_OPTIONS,
  feelingTools,
} from "@/src/data/feelings/feelings";
import { sources } from "@/src/data/story/sources";

describe("feeling tools", () => {
  it("covers every tool id with intro, steps, caution and sources", () => {
    expect(feelingTools.map((tool) => tool.id).sort()).toEqual([...FEELING_TOOL_IDS].sort());
    const sourceIds = new Set(sources.map((source) => source.id));
    for (const tool of feelingTools) {
      expect(tool.intro.length).toBeGreaterThan(0);
      expect(tool.steps.length).toBeGreaterThan(0);
      expect(tool.caution.length).toBeGreaterThan(0);
      expect(tool.sourceIds.filter((id) => !sourceIds.has(id))).toEqual([]);
    }
  });

  it("maps each feeling to an existing tool and a sentence for an adult", () => {
    const toolIds = new Set<string>(FEELING_TOOL_IDS);
    for (const entry of FEELING_ENTRIES) {
      expect(toolIds.has(entry.toolId)).toBe(true);
      expect(entry.reason.length).toBeGreaterThan(0);
      expect(entry.line.startsWith("「")).toBe(true);
      expect(entry.line.endsWith("」")).toBe(true);
    }
  });

  it("keeps quizzes and scenarios internally consistent", () => {
    for (const question of FAULT_QUESTIONS) {
      expect(typeof question.answer).toBe("boolean");
      expect(question.explain.length).toBeGreaterThan(0);
    }
    for (const scenario of THEATER_SCENARIOS) {
      expect(scenario.options.length).toBeGreaterThanOrEqual(2);
      expect(scenario.options.filter((option) => option.good)).toHaveLength(1);
    }
    expect(WEATHER_OPTIONS.length).toBeGreaterThanOrEqual(4);
    expect(COURAGE_ACTS.length).toBeGreaterThanOrEqual(4);
    expect(PARENT_SCRIPTS.length).toBeGreaterThanOrEqual(3);
    expect(SEEK_HELP_SIGNS.length).toBeGreaterThanOrEqual(3);
  });

  it("stays within guidance-only boundaries", () => {
    const text = [
      ...feelingTools.flatMap((tool) => [tool.intro, tool.caution, ...tool.steps]),
      ...FEELING_ENTRIES.flatMap((entry) => [entry.reason, entry.line]),
      ...FAULT_QUESTIONS.flatMap((item) => [item.statement, item.explain]),
      ...PARENT_SCRIPTS.flatMap((script) => script.lines),
      ...SEEK_HELP_SIGNS,
    ].join(" ");
    expect(text).not.toMatch(/治愈率|生存率|复发率|\d+\s*%|抑郁|焦虑症|\d+\s*(mg|毫克)|泼尼松|地塞米松/);
  });
});
