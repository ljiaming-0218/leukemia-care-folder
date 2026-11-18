import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { DoubleSide } from "three";
import { CuteCell, CuteFace, PASTEL } from "@/src/components/three/Cute";
import { Hotspot } from "@/src/components/three/Hotspot";

const BELT_CELLS = [0, 1, 2, 3];
const BELT_COLORS = [PASTEL.cloud, PASTEL.cloud, PASTEL.butter, PASTEL.coral];

function BeltCell({ index, animate }: { index: number; animate: boolean }) {
  const ref = useRef<Group>(null);
  const offset = index / BELT_CELLS.length;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = animate ? (clock.elapsedTime * 0.08 + offset) % 1 : offset;
    ref.current.position.x = -2.1 + t * 4.2;
    ref.current.position.y = animate ? -0.34 + Math.sin(clock.elapsedTime * 3 + index) * 0.03 : -0.34;
  });

  return (
    <group ref={ref} position={[-2.1 + offset * 4.2, -0.34, 0]}>
      <mesh scale={index === 3 ? [1, 0.66, 1] : 1}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={BELT_COLORS[index]} />
      </mesh>
      <CuteFace r={0.22} blush={index >= 2} />
    </group>
  );
}

export function MarrowFactory3D({
  activeHotspot,
  animate,
  onSelectHotspot,
}: {
  activeHotspot: string | null;
  animate: boolean;
  onSelectHotspot: (id: string) => void;
}) {
  const spongy = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!spongy.current || !animate) return;
    spongy.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.05;
  });

  const spongeBlobs = useMemo(
    () => [
      [-2.4, 1.3, -1.2, 0.55],
      [2.5, 1.4, -1, 0.5],
      [-1.4, -1.4, -1.4, 0.45],
      [1.8, -1.5, -1.1, 0.6],
      [0.2, 1.6, -1.6, 0.4],
    ] as const,
    [],
  );

  return (
    <group>
      {/* 骨头外壳：横放的半透明骨腔 */}
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[2.3, 2.3, 7.4, 16, 1, true]} />
        <meshStandardMaterial color={PASTEL.shell} transparent opacity={0.14} side={DoubleSide} />
      </mesh>
      {[-3.7, 3.7].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation-z={Math.PI / 2}>
          <torusGeometry args={[2.3, 0.18, 10, 28]} />
          <meshStandardMaterial color={PASTEL.cream} />
        </mesh>
      ))}

      {/* 海绵状骨髓 */}
      <group ref={spongy}>
        {spongeBlobs.map(([x, y, z, r], index) => (
          <mesh key={index} position={[x, y, z]}>
            <icosahedronGeometry args={[r, 1]} />
            <meshStandardMaterial color={index % 2 === 0 ? PASTEL.peach : PASTEL.butter} flatShading />
          </mesh>
        ))}
      </group>

      {/* 传送带：细胞宝宝从左边出生，长大变颜色，从右边出厂 */}
      <mesh position={[0, -0.72, 0]}>
        <boxGeometry args={[4.6, 0.16, 0.85]} />
        <meshStandardMaterial color={PASTEL.wood} />
      </mesh>
      {BELT_CELLS.map((index) => (
        <BeltCell key={index} index={index} animate={animate} />
      ))}

      {/* 干细胞工位 */}
      <group position={[-2.5, -0.1, 0.6]}>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.55, 0.62, 0.22, 14]} />
          <meshStandardMaterial color={PASTEL.cloud} />
        </mesh>
        <CuteCell r={0.34} color={PASTEL.sky} animate={animate} phase={0.4} position={[0, 0.02, 0]} />
      </group>

      {/* 三种细胞工位 */}
      <group position={[1.2, -0.1, 1.1]}>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.5, 0.58, 0.22, 14]} />
          <meshStandardMaterial color={PASTEL.butter} />
        </mesh>
        <CuteCell r={0.36} color={PASTEL.red} shape="flat" animate={animate} phase={1.2} position={[0, 0.02, 0]} />
      </group>
      <group position={[2.3, -0.1, 0.1]}>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.5, 0.58, 0.22, 14]} />
          <meshStandardMaterial color={PASTEL.cloud} />
        </mesh>
        <CuteCell r={0.38} color={PASTEL.lilac} shape="bumpy" animate={animate} phase={2} position={[0, 0.02, 0]} />
      </group>
      <group position={[2.1, -0.1, -1.2]}>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.5, 0.58, 0.22, 14]} />
          <meshStandardMaterial color={PASTEL.peach} />
        </mesh>
        <CuteCell r={0.34} color={PASTEL.sun} shape="flat" animate={animate} phase={2.8} position={[0, 0.02, 0]} />
      </group>

      {/* 热点 */}
      <Hotspot position={[-2.5, 0.55, 0.6]} active={activeHotspot === "stem"} animate={animate} onSelect={() => onSelectHotspot("stem")} />
      <Hotspot position={[1.2, 0.55, 1.1]} active={activeHotspot === "red"} animate={animate} onSelect={() => onSelectHotspot("red")} />
      <Hotspot position={[2.3, 0.55, 0.1]} active={activeHotspot === "white"} animate={animate} onSelect={() => onSelectHotspot("white")} />
      <Hotspot position={[2.1, 0.5, -1.2]} active={activeHotspot === "platelet"} animate={animate} onSelect={() => onSelectHotspot("platelet")} />
      <Hotspot position={[-0.6, 1.5, -1.1]} active={activeHotspot === "marrow"} animate={animate} onSelect={() => onSelectHotspot("marrow")} />
    </group>
  );
}
