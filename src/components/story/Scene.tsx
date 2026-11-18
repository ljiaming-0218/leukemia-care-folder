import type { Chapter } from "@/src/data/story/chapters";
import { CellsScene } from "@/src/components/story/scenes/CellsScene";
import { DetectiveScene } from "@/src/components/story/scenes/DetectiveScene";
import { FactoryScene } from "@/src/components/story/scenes/FactoryScene";
import { FollowupScene } from "@/src/components/story/scenes/FollowupScene";
import { MarathonScene } from "@/src/components/story/scenes/MarathonScene";
import { MischiefScene } from "@/src/components/story/scenes/MischiefScene";
import { SchoolScene } from "@/src/components/story/scenes/SchoolScene";
import { ShieldScene } from "@/src/components/story/scenes/ShieldScene";

const SCENES: Record<Chapter["scene"], () => React.JSX.Element> = {
  cells: CellsScene,
  factory: FactoryScene,
  mischief: MischiefScene,
  detective: DetectiveScene,
  marathon: MarathonScene,
  shield: ShieldScene,
  school: SchoolScene,
  followup: FollowupScene,
};

export function Scene({ scene }: { scene: Chapter["scene"] }) {
  const Component = SCENES[scene];
  return <Component />;
}
