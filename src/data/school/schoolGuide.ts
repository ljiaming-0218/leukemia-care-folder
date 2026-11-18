import { z } from "zod";
import { sources, type SourceId } from "@/src/data/story/sources";

const sourceIds = sources.map((source) => source.id) as [string, ...string[]];

const schoolGuideSchema = z.object({
  intro: z.string().min(1),
  audiences: z
    .array(
      z.object({
        id: z.enum(["classmates", "teachers"]),
        label: z.string().min(1),
        lead: z.string().min(1),
        points: z.array(z.string().min(1)).min(3),
      }),
    )
    .length(2),
  reminders: z.array(z.string().min(1)).min(2),
  sourceIds: z.array(z.enum(sourceIds)).min(1),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

type ParsedSchoolGuide = z.infer<typeof schoolGuideSchema>;

export const schoolGuide: Omit<ParsedSchoolGuide, "sourceIds"> & { sourceIds: SourceId[] } =
  schoolGuideSchema.parse({
    intro:
      "孩子返校前后，同学和老师常不知道该怎么相处。这一页把最常被问到的事写成短句，可以打印或转发给学校。",
    audiences: [
      {
        id: "classmates",
        label: "给同学",
        lead: "你可以像平常一样和他说话、一起上课。",
        points: [
          "白血病不会传染。一起上课、一起吃饭、一起玩，都不会被传上。",
          "他可能缺课、容易累，头发也可能暂时变少。这些不是他做错了什么。",
          "想帮忙可以先问一句「需要我陪你吗？」，不用一直追问病情。",
          "如果他不想说，也没关系，可以聊点别的。",
        ],
      },
      {
        id: "teachers",
        label: "给老师",
        lead: "孩子返校前后，可能需要学校配合几件小事。",
        points: [
          "白血病不传染，不需要隔离；返校安排按治疗团队和家长的意见来。",
          "返校可以分阶段，比如先上半天或先上主要科目，体力允许再增加。",
          "班里有水痘、麻疹等传染病时，请先通知家长。",
          "同学提问时，可以帮孩子说明「不传染」，但不要替孩子讲病情细节。",
          "孩子明显焦虑或拒绝上学时，请联系家长和治疗团队。",
        ],
      },
    ],
    reminders: [
      "具体返校时间、体育活动和集体活动安排，以孩子所在医院治疗团队的意见为准。",
      "本站只帮助理解，不做诊断，也不提供治疗方案。",
    ],
    sourceIds: ["stjude-talking", "school-vaccines", "stjude-leukemia"],
    verifiedAt: "2026-11-18",
  }) as Omit<ParsedSchoolGuide, "sourceIds"> & { sourceIds: SourceId[] };