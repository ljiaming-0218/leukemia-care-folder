import { describe, expect, it } from "vitest";
import { patrolGame } from "@/src/data/games/patrol";
import { sources } from "@/src/data/story/sources";

function neighbors(level: (typeof patrolGame.levels)[number]) {
  const map = new Map<string, Set<string>>();
  for (const node of level.nodes) map.set(node.id, new Set());
  for (const [a, b] of level.edges) {
    map.get(a)?.add(b);
    map.get(b)?.add(a);
  }
  return map;
}

function stepsTo(level: (typeof patrolGame.levels)[number], from: string, to: string): number {
  const map = neighbors(level);
  const seen = new Set([from]);
  const queue: [string, number][] = [[from, 0]];
  while (queue.length > 0) {
    const [node, steps] = queue.shift()!;
    if (node === to) return steps;
    for (const next of map.get(node) ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push([next, steps + 1]);
    }
  }
  return Number.POSITIVE_INFINITY;
}

describe("patrol game", () => {
  it("has three levels with unique node ids", () => {
    expect(patrolGame.levels).toHaveLength(3);
    for (const level of patrolGame.levels) {
      const ids = level.nodes.map((node) => node.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("keeps every road on the board and connected to a node", () => {
    for (const level of patrolGame.levels) {
      const ids = new Set(level.nodes.map((node) => node.id));
      for (const node of level.nodes) {
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.x).toBeLessThanOrEqual(4);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeLessThanOrEqual(3);
      }
      for (const [a, b] of level.edges) {
        expect(ids.has(a)).toBe(true);
        expect(ids.has(b)).toBe(true);
        expect(a).not.toBe(b);
      }
    }
  });

  it("moves the germ along connected road nodes", () => {
    for (const level of patrolGame.levels) {
      const map = neighbors(level);
      expect(level.germPath.length).toBeGreaterThanOrEqual(3);
      for (let index = 1; index < level.germPath.length; index += 1) {
        const prev = level.germPath[index - 1];
        const next = level.germPath[index];
        expect(map.get(prev)?.has(next)).toBe(true);
      }
      expect(level.nodes.some((node) => node.id === level.whiteStart)).toBe(true);
    }
  });

  it("gives every level a way to get ahead of the germ", () => {
    for (const level of patrolGame.levels) {
      const reachableAhead = level.germPath.some((nodeId, index) => {
        if (index === 0) return false;
        return stepsTo(level, level.whiteStart, nodeId) <= index;
      });
      expect(reachableAhead, `${level.id} should be solvable`).toBe(true);
    }
  });

  it("only cites known sources", () => {
    const known = new Set(sources.map((source) => source.id));
    expect(patrolGame.sourceIds.filter((id) => !known.has(id))).toEqual([]);
  });

  it("keeps the game gentle and free of medical claims", () => {
    const text = [
      patrolGame.intro,
      patrolGame.safety,
      ...patrolGame.rules,
      ...patrolGame.levels.flatMap((level) => [level.teaser, level.hint, level.lesson]),
    ].join("\n");
    expect(text).not.toMatch(/杀死|消灭|打死|殴打|治愈率|生存率|复发率|\d+\s*%|mg|毫克|一定会/);
    expect(patrolGame.safety).toContain("练习");
  });
});
