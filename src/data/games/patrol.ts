import { z } from "zod";
import { sources, type SourceId } from "@/src/data/story/sources";

const idSchema = z.string().regex(/^[a-z0-9-]+$/);

const patrolNodeSchema = z.object({
  id: idSchema,
  x: z.number().int().min(0).max(4),
  y: z.number().int().min(0).max(3),
  label: z.string().min(1),
});

const patrolLevelSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  teaser: z.string().min(1),
  hint: z.string().min(1),
  lesson: z.string().min(1),
  nodes: z.array(patrolNodeSchema).min(2),
  edges: z.array(z.tuple([idSchema, idSchema])).min(1),
  germPath: z.array(idSchema).min(3),
  whiteStart: idSchema,
});

export type PatrolLevel = z.infer<typeof patrolLevelSchema>;

const sourceIds = sources.map((source) => source.id) as [string, ...string[]];

const patrolGameSchema = z.object({
  intro: z.string().min(1),
  safety: z.string().min(1),
  rules: z.array(z.string().min(1)).min(2),
  levels: z.array(patrolLevelSchema).min(1),
  sourceIds: z.array(z.enum(sourceIds)).min(1),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

type ParsedPatrolGame = z.infer<typeof patrolGameSchema>;

const rawGame = {
  intro:
    "病菌想顺着血管溜到下一段路。你是一颗巡逻的白细胞，每次走一步，抢先站到病菌前面的路口，把路轻轻挡起来。没有倒计时，可以慢慢想。",
  safety:
    "这只是一次练习，不是真的在身体里打仗。真实生活里怎么保护自己，要听孩子所在医院治疗团队的话。发烧、发冷或很不舒服时，要马上告诉大人，按治疗医院的要求处理。",
  rules: [
    "点一个亮起来的路口，白细胞走一步。",
    "病菌每次沿红色小路前进一步。",
    "站到病菌前面的路口，就拦住它。",
    "键盘也可以：按方向键，朝那个方向的路口走。",
  ],
  levels: [
    {
      id: "straight-road",
      title: "第一段公路",
      teaser: "从旁边的小路插到前面去",
      hint: "先走到「小路 1」，再往上到「路口 3」等它。",
      lesson: "白细胞会沿着血管巡逻，帮身体挡住病菌。",
      nodes: [
        { id: "germ-start", x: 4, y: 1, label: "公路起点" },
        { id: "road-a", x: 3, y: 1, label: "路口 1" },
        { id: "road-b", x: 2, y: 1, label: "路口 2" },
        { id: "road-c", x: 1, y: 1, label: "路口 3" },
        { id: "germ-exit", x: 0, y: 1, label: "下一段血管" },
        { id: "white-start", x: 1, y: 3, label: "巡逻起点" },
        { id: "path-a", x: 1, y: 2, label: "小路 1" },
      ],
      edges: [
        ["germ-start", "road-a"],
        ["road-a", "road-b"],
        ["road-b", "road-c"],
        ["road-c", "germ-exit"],
        ["white-start", "path-a"],
        ["path-a", "road-c"],
      ],
      germPath: ["germ-start", "road-a", "road-b", "road-c", "germ-exit"],
      whiteStart: "white-start",
    },
    {
      id: "bend-road",
      title: "转弯的路口",
      teaser: "在小路和大道之间找一条近路",
      hint: "沿小路走到「路口 3」，就能赶到病菌前面。",
      lesson: "看清楚病菌会往哪走，再选一条更快的路。",
      nodes: [
        { id: "germ-start", x: 4, y: 0, label: "公路起点" },
        { id: "road-a", x: 3, y: 0, label: "路口 1" },
        { id: "road-b", x: 2, y: 0, label: "路口 2" },
        { id: "bend-a", x: 2, y: 1, label: "转角" },
        { id: "road-c", x: 2, y: 2, label: "路口 3" },
        { id: "road-d", x: 1, y: 2, label: "路口 4" },
        { id: "germ-exit", x: 0, y: 2, label: "下一段血管" },
        { id: "white-start", x: 4, y: 3, label: "巡逻起点" },
        { id: "path-a", x: 4, y: 2, label: "小路 1" },
        { id: "path-b", x: 3, y: 2, label: "小路 2" },
      ],
      edges: [
        ["germ-start", "road-a"],
        ["road-a", "road-b"],
        ["road-b", "bend-a"],
        ["bend-a", "road-c"],
        ["road-c", "road-d"],
        ["road-d", "germ-exit"],
        ["white-start", "path-a"],
        ["path-a", "path-b"],
        ["path-b", "road-c"],
      ],
      germPath: ["germ-start", "road-a", "road-b", "bend-a", "road-c", "road-d", "germ-exit"],
      whiteStart: "white-start",
    },
    {
      id: "shortcut-road",
      title: "巡逻小路",
      teaser: "抄近路，也要算好步子",
      hint: "从小路绕到「路口 3」等它，就会在病菌前面拦住。",
      lesson: "洗手、通风、按医生说的戴口罩，能减少病菌靠近；发烧了要马上告诉大人。",
      nodes: [
        { id: "germ-start", x: 4, y: 3, label: "公路起点" },
        { id: "road-a", x: 4, y: 2, label: "路口 1" },
        { id: "bend-a", x: 4, y: 1, label: "转角" },
        { id: "road-b", x: 3, y: 1, label: "路口 2" },
        { id: "road-c", x: 2, y: 1, label: "路口 3" },
        { id: "bend-b", x: 2, y: 0, label: "转角 2" },
        { id: "road-d", x: 1, y: 0, label: "路口 4" },
        { id: "germ-exit", x: 0, y: 0, label: "下一段血管" },
        { id: "white-start", x: 3, y: 3, label: "巡逻起点" },
        { id: "path-a", x: 3, y: 2, label: "小路 1" },
        { id: "path-b", x: 2, y: 2, label: "小路 2" },
      ],
      edges: [
        ["germ-start", "road-a"],
        ["road-a", "bend-a"],
        ["bend-a", "road-b"],
        ["road-b", "road-c"],
        ["road-c", "bend-b"],
        ["bend-b", "road-d"],
        ["road-d", "germ-exit"],
        ["white-start", "path-a"],
        ["path-a", "path-b"],
        ["path-b", "road-c"],
      ],
      germPath: ["germ-start", "road-a", "bend-a", "road-b", "road-c", "bend-b", "road-d", "germ-exit"],
      whiteStart: "white-start",
    },
  ],
  sourceIds: ["stjude-fever", "sciping-leukemia"],
  verifiedAt: "2026-11-18",
};

export const patrolGame: Omit<ParsedPatrolGame, "sourceIds"> & { sourceIds: SourceId[] } =
  patrolGameSchema.parse(rawGame) as Omit<ParsedPatrolGame, "sourceIds"> & { sourceIds: SourceId[] };

export function getPatrolLevel(id: string | null): PatrolLevel {
  return patrolGame.levels.find((level) => level.id === id) ?? patrolGame.levels[0];
}
