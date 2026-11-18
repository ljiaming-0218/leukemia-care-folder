import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { Bob, CuteFace, PASTEL } from "@/src/components/three/Cute";
import { Figure } from "@/src/components/three/Figure";
import { Hotspot } from "@/src/components/three/Hotspot";

function BobbingHeart({ animate }: { animate: boolean }) {
  const heart = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!heart.current || !animate) return;
    heart.current.position.y = 2 + Math.sin(clock.elapsedTime * 1.6) * 0.12;
  });

  return (
    <group position={[0.35, 0, -0.4]}>
      <mesh ref={heart} position={[0, 2, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color={PASTEL.pink} />
      </mesh>
      <mesh position={[0.14, 2.08, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={PASTEL.pink} />
      </mesh>
      <mesh position={[-0.14, 2.08, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={PASTEL.pink} />
      </mesh>
    </group>
  );
}

function Tree({ position, crown }: { position: [number, number, number]; crown: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.12, 0.17, 1.1, 10]} />
        <meshStandardMaterial color={PASTEL.woodDark} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <icosahedronGeometry args={[0.64, 1]} />
        <meshStandardMaterial color={crown} />
      </mesh>
      <mesh position={[0.3, 1.85, 0.2]}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial color={crown} />
      </mesh>
    </group>
  );
}

export function Garden3D({
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
      {/* 草地 */}
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[4.6, 28]} />
        <meshStandardMaterial color={PASTEL.leaf} />
      </mesh>

      {/* 笑眯眯的太阳 */}
      <Bob animate={animate} amp={0.1} speed={1} phase={0.8}>
        <group position={[-3.4, 3.1, -2.6]}>
          <mesh>
            <sphereGeometry args={[0.5, 18, 18]} />
            <meshStandardMaterial color={PASTEL.sun} emissive="#f2c14e" emissiveIntensity={0.35} />
          </mesh>
          <CuteFace r={0.5} />
        </group>
      </Bob>

      {/* 散步的小路：一块块踏脚石 */}
      {[3.1, 2.3, 1.5, 0.7].map((z, index) => (
        <mesh key={z} position={[index % 2 === 0 ? -0.2 : 0.2, 0.03, z]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.3, 14]} />
          <meshStandardMaterial color={PASTEL.butter} />
        </mesh>
      ))}

      {/* 树 */}
      <Tree position={[-3.2, 0, -1.2]} crown={PASTEL.leaf} />
      <Tree position={[3.3, 0, -1.6]} crown={PASTEL.mint} />

      {/* 睡觉角落：小床和打盹的月亮 */}
      <group position={[-2.5, 0, 1.8]}>
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[1.4, 0.14, 0.75]} />
          <meshStandardMaterial color={PASTEL.wood} />
        </mesh>
        <mesh position={[-0.48, 0.4, 0]}>
          <boxGeometry args={[0.36, 0.14, 0.55]} />
          <meshStandardMaterial color={PASTEL.cream} />
        </mesh>
        <mesh position={[0.1, 0.42, 0]} rotation-z={Math.PI / 2}>
          <capsuleGeometry args={[0.14, 0.4, 6, 12]} />
          <meshStandardMaterial color={PASTEL.sky} />
        </mesh>
        <Bob animate={animate} amp={0.06} speed={0.9} phase={2}>
          <group position={[-0.3, 2.5, -0.3]}>
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color={PASTEL.butter} emissive="#ecd489" emissiveIntensity={0.3} />
            </mesh>
            <CuteFace r={0.3} sleepy />
          </group>
        </Bob>
      </group>

      {/* 吃饭角落：小桌和饭碗 */}
      <group position={[1, 0, 2.1]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 16]} />
          <meshStandardMaterial color={PASTEL.wood} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.44, 10]} />
          <meshStandardMaterial color={PASTEL.woodDark} />
        </mesh>
        <mesh position={[0, 0.58, 0]} scale={[1, 0.5, 1]}>
          <sphereGeometry args={[0.26, 16, 10]} />
          <meshStandardMaterial color={PASTEL.cream} />
        </mesh>
        <mesh position={[0, 0.66, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color={PASTEL.leaf} />
        </mesh>
        <mesh position={[0.16, 0.66, 0.05]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={PASTEL.peach} />
        </mesh>
      </group>

      {/* 书包：准备回学校 */}
      <group position={[2.7, 0, 1.1]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.6, 0.75, 0.32]} />
          <meshStandardMaterial color={PASTEL.sky} />
        </mesh>
        <mesh position={[0, 0.72, 0.19]}>
          <boxGeometry args={[0.5, 0.26, 0.08]} />
          <meshStandardMaterial color={PASTEL.sun} />
        </mesh>
        <mesh position={[0, 0.95, -0.02]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.14, 0.04, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#84b3d4" />
        </mesh>
      </group>

      {/* 朋友们手拉手 */}
      <Figure position={[-0.1, 0, -0.4]} shirt={PASTEL.pink} animate={animate} />
      <Figure position={[0.8, 0, -0.4]} shirt={PASTEL.mint} animate={animate} />
      <mesh position={[0.35, 0.55, -0.4]} rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.045, 0.5, 6, 10]} />
        <meshStandardMaterial color={PASTEL.skin} />
      </mesh>
      <BobbingHeart animate={animate} />

      {/* 热点 */}
      <Hotspot position={[1, 1.2, 2.1]} active={activeHotspot === "nutrition"} animate={animate} onSelect={() => onSelectHotspot("nutrition")} />
      <Hotspot position={[0, 0.7, 2.9]} active={activeHotspot === "activity"} animate={animate} onSelect={() => onSelectHotspot("activity")} />
      <Hotspot position={[2.7, 1.4, 1.1]} active={activeHotspot === "school"} animate={animate} onSelect={() => onSelectHotspot("school")} />
      <Hotspot position={[0.35, 2.6, -0.4]} active={activeHotspot === "mood"} animate={animate} onSelect={() => onSelectHotspot("mood")} />
    </group>
  );
}
