import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { CatmullRomCurve3, DoubleSide, Vector3 } from "three";
import { CuteCell, PASTEL } from "@/src/components/three/Cute";
import { Hotspot } from "@/src/components/three/Hotspot";

const CURVE = new CatmullRomCurve3([
  new Vector3(-6.5, 0.6, -1),
  new Vector3(-3.5, -0.8, 1.5),
  new Vector3(0, 0.8, -1.5),
  new Vector3(3.5, -0.8, 1.5),
  new Vector3(6.5, 0.6, -1),
]);

type FlowCell = { t: number; offset: [number, number]; color: string; size: number; shape: "round" | "bumpy" | "flat" };

const FLOW: FlowCell[] = [
  { t: 0.05, offset: [0.3, 0.2], color: PASTEL.red, size: 0.3, shape: "round" },
  { t: 0.2, offset: [-0.4, 0.3], color: PASTEL.red, size: 0.28, shape: "round" },
  { t: 0.38, offset: [0.2, -0.5], color: PASTEL.lilac, size: 0.36, shape: "bumpy" },
  { t: 0.5, offset: [-0.2, 0.5], color: PASTEL.red, size: 0.26, shape: "round" },
  { t: 0.62, offset: [0.5, 0.1], color: PASTEL.sun, size: 0.2, shape: "flat" },
  { t: 0.74, offset: [-0.5, -0.2], color: PASTEL.red, size: 0.3, shape: "round" },
  { t: 0.86, offset: [0.1, 0.6], color: PASTEL.sun, size: 0.2, shape: "flat" },
  { t: 0.95, offset: [-0.3, -0.4], color: PASTEL.red, size: 0.27, shape: "round" },
];

function FlowingCell({ cell, animate }: { cell: FlowCell; animate: boolean }) {
  const ref = useRef<Mesh>(null);
  const point = useMemo(() => new Vector3(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = animate ? (cell.t + clock.elapsedTime * 0.03) % 1 : cell.t;
    CURVE.getPointAt(t, point);
    ref.current.position.set(point.x + cell.offset[0], point.y + cell.offset[1], point.z);
  });

  const initial = CURVE.getPointAt(cell.t);

  return (
    <mesh
      ref={ref}
      position={[initial.x + cell.offset[0], initial.y + cell.offset[1], initial.z]}
      scale={cell.shape === "flat" ? [1, 0.55, 1] : 1}
    >
      {cell.shape === "bumpy" ? (
        <icosahedronGeometry args={[cell.size, 1]} />
      ) : (
        <sphereGeometry args={[cell.size, 14, 14]} />
      )}
      <meshStandardMaterial color={cell.color} />
    </mesh>
  );
}

export function VesselHighway3D({
  activeHotspot,
  animate,
  onSelectHotspot,
}: {
  activeHotspot: string | null;
  animate: boolean;
  onSelectHotspot: (id: string) => void;
}) {
  const germ = useRef<Mesh>(null);

  const oxygenAt = useMemo(() => CURVE.getPointAt(0.22).add(new Vector3(0, 1.5, 0)), []);
  const germBase = useMemo(() => CURVE.getPointAt(0.55).add(new Vector3(0.2, -1.1, 0.4)), []);
  const patchAt = useMemo(() => CURVE.getPointAt(0.78).add(new Vector3(-0.2, 1.2, 0)), []);

  useFrame(({ clock }) => {
    if (!germ.current || !animate) return;
    germ.current.position.y = germBase.y + Math.sin(clock.elapsedTime * 1.6) * 0.18;
    germ.current.rotation.z = Math.sin(clock.elapsedTime * 2.2) * 0.2;
  });

  return (
    <group>
      {/* 血管公路：半透明粉色管道 */}
      <mesh>
        <tubeGeometry args={[CURVE, 60, 1.5, 14, false]} />
        <meshStandardMaterial color={PASTEL.coral} transparent opacity={0.2} side={DoubleSide} />
      </mesh>

      {/* 公路上的小帮手 */}
      {FLOW.map((cell, index) => (
        <FlowingCell key={index} cell={cell} animate={animate} />
      ))}

      {/* 氧气配送站：红细胞 + 氧气包 */}
      <group position={oxygenAt}>
        <CuteCell r={0.42} color={PASTEL.red} shape="flat" animate={animate} phase={0.6} />
        <mesh position={[0.5, 0.42, 0]}>
          <boxGeometry args={[0.36, 0.3, 0.3]} />
          <meshStandardMaterial color={PASTEL.sky} />
        </mesh>
      </group>

      {/* 病菌入侵点：淘气的紫色病菌 + 赶来巡逻的白细胞 */}
      <group>
        <mesh ref={germ} position={germBase}>
          <icosahedronGeometry args={[0.38, 1]} />
          <meshStandardMaterial color={PASTEL.plum} />
        </mesh>
        <CuteCell r={0.46} color={PASTEL.cloud} shape="bumpy" animate={animate} phase={1.8} position={[germBase.x - 1.1, germBase.y + 0.2, germBase.z]} />
      </group>

      {/* 止血点：血小板贴着小补丁 */}
      <group position={patchAt}>
        <CuteCell r={0.4} color={PASTEL.sun} shape="flat" animate={animate} phase={2.6} />
        <mesh position={[0, -0.42, 0]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[0.7, 0.5]} />
          <meshStandardMaterial color={PASTEL.butter} side={DoubleSide} />
        </mesh>
      </group>

      {/* 热点 */}
      <Hotspot position={[oxygenAt.x, oxygenAt.y + 0.7, oxygenAt.z]} active={activeHotspot === "oxygen"} animate={animate} onSelect={() => onSelectHotspot("oxygen")} />
      <Hotspot position={[germBase.x, germBase.y - 0.7, germBase.z]} active={activeHotspot === "germ"} animate={animate} onSelect={() => onSelectHotspot("germ")} />
      <Hotspot position={[patchAt.x, patchAt.y + 0.7, patchAt.z]} active={activeHotspot === "patch"} animate={animate} onSelect={() => onSelectHotspot("patch")} />
    </group>
  );
}
