import { Bob, PASTEL } from "@/src/components/three/Cute";
import { Figure } from "@/src/components/three/Figure";
import { Hotspot } from "@/src/components/three/Hotspot";

const SEGMENTS: { x: number; rotation: number; color: string }[] = [
  { x: -3, rotation: 0.18, color: PASTEL.coral },
  { x: 0, rotation: -0.16, color: PASTEL.butter },
  { x: 3, rotation: 0.14, color: PASTEL.mint },
];

function Balloon({ position, color, animate, phase }: { position: [number, number, number]; color: string; animate: boolean; phase: number }) {
  return (
    <group position={position}>
      <Bob animate={animate} amp={0.09} speed={1.2} phase={phase}>
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.22, 14, 14]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.66, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.5, 6]} />
          <meshStandardMaterial color={PASTEL.woodDark} />
        </mesh>
      </Bob>
    </group>
  );
}

export function MarathonTrack3D({
  activeHotspot,
  animate,
  onSelectHotspot,
}: {
  activeHotspot: string | null;
  animate: boolean;
  onSelectHotspot: (id: string) => void;
}) {
  return (
    <group>
      {/* 分段赛道 */}
      {SEGMENTS.map((segment) => (
        <mesh key={segment.x} position={[segment.x, 0.1, 0]} rotation-y={segment.rotation}>
          <boxGeometry args={[3.1, 0.2, 1.5]} />
          <meshStandardMaterial color={segment.color} />
        </mesh>
      ))}

      {/* 跑步的小朋友和陪跑的大人 */}
      <Figure position={[-3, 0.2, 0]} shirt={PASTEL.sky} animate={animate} />
      <Figure position={[-1.9, 0.2, -0.9]} shirt={PASTEL.lilac} adult animate={animate} />
      <Figure position={[0.6, 0.2, 0.9]} shirt={PASTEL.pink} adult animate={animate} />

      {/* 补给站 */}
      <group position={[1.7, 0, -1.5]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1, 0.1, 0.55]} />
          <meshStandardMaterial color={PASTEL.wood} />
        </mesh>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.2, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.4, 10]} />
            <meshStandardMaterial color={PASTEL.woodDark} />
          </mesh>
        ))}
        <mesh position={[-0.2, 0.6, 0]}>
          <cylinderGeometry args={[0.09, 0.07, 0.18, 12]} />
          <meshStandardMaterial color={PASTEL.sky} />
        </mesh>
        <mesh position={[0.15, 0.6, 0.05]}>
          <cylinderGeometry args={[0.09, 0.07, 0.18, 12]} />
          <meshStandardMaterial color={PASTEL.peach} />
        </mesh>
      </group>
      <Balloon position={[2.3, 0, -1.7]} color={PASTEL.pink} animate={animate} phase={0.5} />
      <Balloon position={[-4.4, 0, 0.8]} color={PASTEL.sun} animate={animate} phase={2.1} />

      {/* 复诊帐篷：赛道边的检查站 */}
      <group position={[-1.2, 0, 2]}>
        <mesh position={[0, 0.75, 0]}>
          <coneGeometry args={[0.85, 0.6, 8]} />
          <meshStandardMaterial color={PASTEL.mint} />
        </mesh>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.22, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.45, 10]} />
            <meshStandardMaterial color={PASTEL.woodDark} />
          </mesh>
        ))}
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.34, 0.24, 0.1]} />
          <meshStandardMaterial color={PASTEL.cream} />
        </mesh>
        <mesh position={[0, 0.28, 0.06]}>
          <boxGeometry args={[0.2, 0.05, 0.02]} />
          <meshStandardMaterial color={PASTEL.red} />
        </mesh>
        <mesh position={[0, 0.28, 0.06]} rotation-z={Math.PI / 2}>
          <boxGeometry args={[0.2, 0.05, 0.02]} />
          <meshStandardMaterial color={PASTEL.red} />
        </mesh>
      </group>

      {/* 终点拱门 */}
      <group position={[4.6, 0, 0]}>
        {[-0.75, 0.75].map((z) => (
          <mesh key={z} position={[0, 0.9, z]}>
            <cylinderGeometry args={[0.1, 0.1, 1.8, 12]} />
            <meshStandardMaterial color={PASTEL.lilac} />
          </mesh>
        ))}
        <mesh position={[0, 1.85, 0]} rotation-x={Math.PI / 2}>
          <boxGeometry args={[0.3, 1.7, 0.16]} />
          <meshStandardMaterial color={PASTEL.sun} />
        </mesh>
      </group>

      {/* 热点 */}
      <Hotspot position={[-3, 1.1, 0]} active={activeHotspot === "induction"} animate={animate} onSelect={() => onSelectHotspot("induction")} />
      <Hotspot position={[0, 1.1, 0]} active={activeHotspot === "consolidation"} animate={animate} onSelect={() => onSelectHotspot("consolidation")} />
      <Hotspot position={[3, 1.1, 0]} active={activeHotspot === "maintenance"} animate={animate} onSelect={() => onSelectHotspot("maintenance")} />
      <Hotspot position={[-1.2, 1.6, 2]} active={activeHotspot === "checkin"} animate={animate} onSelect={() => onSelectHotspot("checkin")} />
    </group>
  );
}
