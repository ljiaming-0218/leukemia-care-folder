import { useRef } from "react";
import type { Mesh } from "three";
import { useFrame } from "@react-three/fiber";

export function Hotspot({
  position,
  active,
  animate,
  onSelect,
}: {
  position: [number, number, number];
  active: boolean;
  animate: boolean;
  onSelect: () => void;
}) {
  const ring = useRef<Mesh>(null);
  const star = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    if (ring.current) {
      const pulse = 1 + Math.sin(t * 2.4) * 0.12;
      ring.current.scale.setScalar(active ? 1.35 : pulse);
      ring.current.position.y = Math.sin(t * 2) * 0.06;
    }
    if (star.current) {
      star.current.rotation.y = t * 1.3;
      star.current.position.y = 0.58 + Math.sin(t * 2.6) * 0.09;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={ring}
        rotation-x={Math.PI / 2}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <torusGeometry args={[0.34, 0.08, 10, 24]} />
        <meshStandardMaterial color={active ? "#ffb84d" : "#ffd98a"} emissive={active ? "#f7c95c" : "#e8b95e"} emissiveIntensity={active ? 0.4 : 0.18} />
      </mesh>
      <mesh ref={star} position={[0, 0.58, 0]}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color="#ffe9a8" emissive="#f7c95c" emissiveIntensity={0.45} />
      </mesh>
      {/* 更大的透明点击区，方便手指点按 */}
      <mesh
        visible={false}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[0.6, 8, 8]} />
      </mesh>
    </group>
  );
}
