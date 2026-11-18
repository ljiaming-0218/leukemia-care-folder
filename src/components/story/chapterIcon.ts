import type { CellKind } from "@/src/components/story/CellBuddy";
import type { Chapter } from "@/src/data/story/chapters";

const ICON: Record<Chapter["scene"], CellKind> = {
  cells: "red",
  factory: "stem",
  mischief: "blast",
  detective: "white",
  marathon: "platelet",
  shield: "white",
  school: "red",
  followup: "platelet",
};

export function chapterIcon(scene: Chapter["scene"]): CellKind {
  return ICON[scene];
}
