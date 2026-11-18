import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/* 圆滚滚马卡龙画风共享件：色板、表情脸、浮动动画、带脸细胞。 */

export const PASTEL = {
  cream: "#fdf3e3",
  shell: "#f7ead6",
  pink: "#f7a8b8",
  coral: "#f6b3a4",
  red: "#f4978e",
  peach: "#f8c9a4",
  sun: "#f9d976",
  butter: "#fbeec2",
  mint: "#a8e0cf",
  leaf: "#b5e394",
  sky: "#a5d3ef",
  cloud: "#e7f2fa",
  lilac: "#c3b8ec",
  plum: "#d9b8e8",
  ink: "#4a3f55",
  skin: "#fbe0c4",
  hair: "#8a6a52",
  wood: "#ead6b8",
  woodDark: "#d9bc98",
};

export function CuteFace({
  r = 0.4,
  blush = true,
  sleepy = false,
  faceZ = 0.86,
}: {
  r?: number;
  blush?: boolean;
  sleepy?: boolean;
  faceZ?: number;
}) {
  const z = r * faceZ;
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          {sleepy ? (
            <mesh position={[side * r * 0.32, r * 0.14, z]} rotation-z={Math.PI}>
              <torusGeometry args={[r * 0.09, r * 0.022, 6, 10, Math.PI]} />
              <meshStandardMaterial color={PASTEL.ink} />
            </mesh>
          ) : (
            <>
              <mesh position={[side * r * 0.32, r * 0.16, z]}>
                <sphereGeometry args={[r * 0.088, 10, 10]} />
                <meshStandardMaterial color={PASTEL.ink} />
              </mesh>
              <mesh position={[side * r * 0.32 + r * 0.032, r * 0.2, z + r * 0.055]}>
                <sphereGeometry args={[r * 0.03, 8, 8]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            </>
          )}
          {blush && (
            <mesh position={[side * r * 0.56, -r * 0.08, z * 0.9]} scale={[1, 0.62, 0.34]}>
              <sphereGeometry args={[r * 0.13, 8, 8]} />
              <meshStandardMaterial color={PASTEL.pink} transparent opacity={0.7} />
            </mesh>
          )}
        </group>
      ))}
      {sleepy ? (
        <mesh position={[0, -r * 0.18, z]}>
          <sphereGeometry args={[r * 0.05, 8, 8]} />
          <meshStandardMaterial color={PASTEL.ink} />
        </mesh>
      ) : (
        <mesh position={[0, -r * 0.14, z]} rotation-z={Math.PI}>
          <torusGeometry args={[r * 0.16, r * 0.028, 6, 14, Math.PI]} />
          <meshStandardMaterial color={PASTEL.ink} />
        </mesh>
      )}
    </group>
  );
}

export function Bob({
  animate,
  phase = 0,
  amp = 0.08,
  speed = 1.4,
  children,
}: {
  animate: boolean;
  phase?: number;
  amp?: number;
  speed?: number;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current || !animate) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * speed + phase) * amp;
  });

  return <group ref={ref}>{children}</group>;
}

export function CuteCell({
  position = [0, 0, 0],
  r = 0.35,
  color,
  shape = "round",
  animate = false,
  phase = 0,
  blush = true,
  sleepy = false,
}: {
  position?: [number, number, number];
  r?: number;
  color: string;
  shape?: "round" | "flat" | "bumpy";
  animate?: boolean;
  phase?: number;
  blush?: boolean;
  sleepy?: boolean;
}) {
  return (
    <Bob animate={animate} phase={phase} amp={r * 0.14}>
      <group position={position}>
        <mesh scale={shape === "flat" ? [1, 0.62, 1] : 1}>
          {shape === "bumpy" ? (
            <icosahedronGeometry args={[r, 1]} />
          ) : (
            <sphereGeometry args={[r, 20, 20]} />
          )}
          <meshStandardMaterial color={color} />
        </mesh>
        <CuteFace r={r} blush={blush} sleepy={sleepy} />
      </group>
    </Bob>
  );
}
