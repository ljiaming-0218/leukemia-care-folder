import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Bob, CuteFace, PASTEL } from "@/src/components/three/Cute";
import { Figure } from "@/src/components/three/Figure";
import { Hotspot } from "@/src/components/three/Hotspot";

function Bubbles({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!group.current || !animate) return;
    group.current.position.y = 1.5 + Math.sin(clock.elapsedTime * 1.8) * 0.08;
  });

  return (
    <group ref={group} position={[-2.2, 1.5, -0.5]}>
      <mesh>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color={PASTEL.cloud} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.22, 0.16, 0.05]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color={PASTEL.cloud} transparent opacity={0.9} />
      </mesh>
      <mesh position={[-0.16, 0.24, -0.08]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color={PASTEL.sky} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

export function ShieldCamp3D({
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
      {/* 营地地面 */}
      <mesh position={[0, 0, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[4.4, 28]} />
        <meshStandardMaterial color={PASTEL.leaf} />
      </mesh>

      {/* 洗手台 */}
      <group position={[-2.2, 0, -0.5]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 0.5, 0.6]} />
          <meshStandardMaterial color={PASTEL.cloud} />
        </mesh>
        <mesh position={[0, 0.78, -0.18]}>
          <cylinderGeometry args={[0.045, 0.045, 0.4, 10]} />
          <meshStandardMaterial color={PASTEL.sky} />
        </mesh>
        <mesh position={[0, 0.96, -0.06]} rotation-x={Math.PI / 2.4}>
          <cylinderGeometry args={[0.045, 0.045, 0.26, 10]} />
          <meshStandardMaterial color={PASTEL.sky} />
        </mesh>
        <mesh position={[0, 0.78, 0.04]}>
          <cylinderGeometry args={[0.16, 0.12, 0.08, 14]} />
          <meshStandardMaterial color={PASTEL.mint} />
        </mesh>
      </group>
      <Bubbles animate={animate} />

      {/* 口罩盾牌：一张笑眯眯的大口罩 */}
      <Bob animate={animate} amp={0.06} speed={1.3}>
        <group position={[0, 1.7, -1.6]}>
          <mesh>
            <boxGeometry args={[1.15, 0.8, 0.14]} />
            <meshStandardMaterial color={PASTEL.cloud} />
          </mesh>
          <mesh position={[0, -0.28, 0.02]}>
            <boxGeometry args={[1.05, 0.22, 0.12]} />
            <meshStandardMaterial color={PASTEL.sky} />
          </mesh>
          {[-0.78, 0.78].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation-y={Math.PI / 2}>
              <torusGeometry args={[0.26, 0.035, 8, 16, Math.PI]} />
              <meshStandardMaterial color={PASTEL.lilac} />
            </mesh>
          ))}
          {/* 口罩上的可爱表情 */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.26, 0.14, 0.09]}>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshStandardMaterial color={PASTEL.ink} />
            </mesh>
          ))}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.4, -0.04, 0.085]} scale={[1, 0.62, 0.34]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color={PASTEL.pink} transparent opacity={0.7} />
            </mesh>
          ))}
          <mesh position={[0, -0.02, 0.09]} rotation-z={Math.PI}>
            <torusGeometry args={[0.1, 0.022, 6, 12, Math.PI]} />
            <meshStandardMaterial color={PASTEL.ink} />
          </mesh>
        </group>
      </Bob>

      {/* 食物安全：餐盘和熟食 */}
      <group position={[2.3, 0, 0.6]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1, 0.1, 0.7]} />
          <meshStandardMaterial color={PASTEL.wood} />
        </mesh>
        {[-0.35, 0.35].map((x) => (
          <mesh key={x} position={[x, 0.2, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.4, 10]} />
            <meshStandardMaterial color={PASTEL.woodDark} />
          </mesh>
        ))}
        <mesh position={[0, 0.54, 0]} scale={[1, 0.35, 1]}>
          <sphereGeometry args={[0.34, 16, 10]} />
          <meshStandardMaterial color={PASTEL.cream} />
        </mesh>
        <mesh position={[-0.1, 0.62, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color={PASTEL.leaf} />
        </mesh>
        <mesh position={[0.12, 0.62, 0.06]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={PASTEL.peach} />
        </mesh>
      </group>

      {/* 疫苗盾牌 */}
      <Bob animate={animate} amp={0.05} speed={1.1} phase={1.4}>
        <group position={[-0.4, 1.2, 2]}>
          <mesh rotation-x={Math.PI / 2.6}>
            <cylinderGeometry args={[0.62, 0.62, 0.1, 16]} />
            <meshStandardMaterial color={PASTEL.mint} />
          </mesh>
          <mesh rotation-x={Math.PI / 2.6}>
            <boxGeometry args={[0.16, 0.06, 0.66]} />
            <meshStandardMaterial color={PASTEL.cream} />
          </mesh>
          <mesh rotation-x={Math.PI / 2.6}>
            <boxGeometry args={[0.66, 0.06, 0.16]} />
            <meshStandardMaterial color={PASTEL.cream} />
          </mesh>
        </group>
      </Bob>

      {/* 发烧怎么办：小床上睡着的小朋友 + 找大人的电话 */}
      <group position={[-2.4, 0, 2.2]}>
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[1.3, 0.14, 0.65]} />
          <meshStandardMaterial color={PASTEL.wood} />
        </mesh>
        <mesh position={[-0.45, 0.38, 0]}>
          <boxGeometry args={[0.34, 0.12, 0.5]} />
          <meshStandardMaterial color={PASTEL.cream} />
        </mesh>
        <mesh position={[0.15, 0.4, 0]} rotation-z={Math.PI / 2}>
          <capsuleGeometry args={[0.13, 0.34, 6, 12]} />
          <meshStandardMaterial color={PASTEL.pink} />
        </mesh>
        <group position={[-0.45, 0.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.13, 14, 14]} />
            <meshStandardMaterial color={PASTEL.skin} />
          </mesh>
          <CuteFace r={0.13} sleepy />
        </group>
        <mesh position={[0.85, 0.55, 0]}>
          <boxGeometry args={[0.18, 0.34, 0.08]} />
          <meshStandardMaterial color={PASTEL.sky} />
        </mesh>
      </group>

      {/* 避免人群：隔开站的小朋友 */}
      <group position={[2.5, 0, -2.1]}>
        <Figure position={[-0.8, 0, 0]} shirt={PASTEL.leaf} animate={animate} />
        <Figure position={[0.8, 0, 0.4]} shirt={PASTEL.sun} animate={animate} />
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} position={[x, 0.02, x === -0.8 ? 0 : 0.4]} rotation-x={-Math.PI / 2}>
            <torusGeometry args={[0.42, 0.04, 8, 22]} />
            <meshStandardMaterial color={PASTEL.butter} />
          </mesh>
        ))}
      </group>

      {/* 热点 */}
      <Hotspot position={[-2.2, 1.3, -0.5]} active={activeHotspot === "wash"} animate={animate} onSelect={() => onSelectHotspot("wash")} />
      <Hotspot position={[0, 2.5, -1.6]} active={activeHotspot === "mask"} animate={animate} onSelect={() => onSelectHotspot("mask")} />
      <Hotspot position={[-2.4, 1.1, 2.2]} active={activeHotspot === "fever"} animate={animate} onSelect={() => onSelectHotspot("fever")} />
      <Hotspot position={[2.5, 1.3, -2.1]} active={activeHotspot === "crowd"} animate={animate} onSelect={() => onSelectHotspot("crowd")} />
    </group>
  );
}
