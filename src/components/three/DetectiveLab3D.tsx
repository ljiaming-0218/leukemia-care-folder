import { useMemo } from "react";
import { CuteFace, PASTEL } from "@/src/components/three/Cute";
import { Hotspot } from "@/src/components/three/Hotspot";

function Helix({ position }: { position: [number, number, number] }) {
  const points = useMemo(() => {
    const items: { y: number; a: [number, number]; b: [number, number] }[] = [];
    for (let i = 0; i < 6; i += 1) {
      const y = i * 0.16 - 0.4;
      const angle = i * 1.05;
      items.push({
        y,
        a: [Math.cos(angle) * 0.22, Math.sin(angle) * 0.22],
        b: [Math.cos(angle + Math.PI) * 0.22, Math.sin(angle + Math.PI) * 0.22],
      });
    }
    return items;
  }, []);

  return (
    <group position={position}>
      {points.map((point, index) => (
        <group key={index}>
          <mesh position={[point.a[0], point.y, point.a[1]]}>
            <sphereGeometry args={[0.065, 10, 10]} />
            <meshStandardMaterial color={PASTEL.sky} />
          </mesh>
          <mesh position={[point.b[0], point.y, point.b[1]]}>
            <sphereGeometry args={[0.065, 10, 10]} />
            <meshStandardMaterial color={PASTEL.pink} />
          </mesh>
          {index % 2 === 0 && (
            <mesh position={[0, point.y, 0]} rotation-y={-index * 1.05}>
              <boxGeometry args={[0.44, 0.035, 0.035]} />
              <meshStandardMaterial color={PASTEL.butter} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export function DetectiveLab3D({
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
      {/* 实验桌 */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[4.8, 0.16, 2.2]} />
        <meshStandardMaterial color={PASTEL.wood} />
      </mesh>
      {([-2.1, 2.1] as const).map((x) =>
        ([-0.8, 0.8] as const).map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.24, z]}>
            <cylinderGeometry args={[0.08, 0.08, 0.5, 10]} />
            <meshStandardMaterial color={PASTEL.woodDark} />
          </mesh>
        )),
      )}

      {/* 显微镜 + 采血管：血常规 */}
      <group position={[-1.6, 0.63, 0.1]}>
        <mesh>
          <cylinderGeometry args={[0.26, 0.3, 0.08, 14]} />
          <meshStandardMaterial color={PASTEL.sky} />
        </mesh>
        <mesh position={[0.1, 0.3, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.14]} />
          <meshStandardMaterial color={PASTEL.sky} />
        </mesh>
        <mesh position={[-0.02, 0.44, 0]} rotation-z={0.5}>
          <cylinderGeometry args={[0.055, 0.055, 0.34, 10]} />
          <meshStandardMaterial color="#84b3d4" />
        </mesh>
        <mesh position={[0.55, 0.2, 0.1]}>
          <cylinderGeometry args={[0.07, 0.07, 0.4, 10]} />
          <meshStandardMaterial color={PASTEL.cream} />
        </mesh>
        <mesh position={[0.55, 0.1, 0.1]}>
          <cylinderGeometry args={[0.06, 0.06, 0.18, 10]} />
          <meshStandardMaterial color={PASTEL.red} />
        </mesh>
      </group>

      {/* 样本盒：骨髓检查 */}
      <group position={[0.1, 0.78, -0.2]}>
        <mesh>
          <boxGeometry args={[0.9, 0.3, 0.55]} />
          <meshStandardMaterial color={PASTEL.cloud} />
        </mesh>
        {[-0.25, 0, 0.25].map((x, index) => (
          <group key={x} position={[x, 0.24, 0]}>
            <mesh>
              <sphereGeometry args={[0.115, 12, 12]} />
              <meshStandardMaterial color={[PASTEL.sky, PASTEL.peach, PASTEL.mint][index]} />
            </mesh>
            <CuteFace r={0.115} blush={false} />
          </group>
        ))}
      </group>

      {/* 身份证卡片：免疫分型 */}
      <group position={[1.35, 0.7, 0.3]} rotation-y={-0.4}>
        <mesh>
          <boxGeometry args={[0.62, 0.04, 0.4]} />
          <meshStandardMaterial color={PASTEL.cream} />
        </mesh>
        <group position={[-0.18, 0.08, 0]}>
          <mesh>
            <sphereGeometry args={[0.085, 12, 12]} />
            <meshStandardMaterial color={PASTEL.skin} />
          </mesh>
          <CuteFace r={0.085} blush />
        </group>
        <mesh position={[0.1, 0.03, -0.08]}>
          <boxGeometry args={[0.3, 0.02, 0.05]} />
          <meshStandardMaterial color={PASTEL.lilac} />
        </mesh>
        <mesh position={[0.1, 0.03, 0.05]}>
          <boxGeometry args={[0.3, 0.02, 0.05]} />
          <meshStandardMaterial color={PASTEL.lilac} />
        </mesh>
      </group>

      {/* 图纸螺旋：基因检测 */}
      <Helix position={[2, 1.2, -0.3]} />

      {/* 报告夹 */}
      <group position={[-0.5, 0.68, 0.55]}>
        <mesh rotation-y={0.2}>
          <boxGeometry args={[0.7, 0.05, 0.5]} />
          <meshStandardMaterial color={PASTEL.sun} />
        </mesh>
        <mesh position={[0, 0.06, 0]} rotation-y={0.32}>
          <boxGeometry args={[0.7, 0.04, 0.5]} />
          <meshStandardMaterial color={PASTEL.butter} />
        </mesh>
      </group>

      {/* 腰穿的温和示意：小床上躺着的小朋友 + 抽象取样工具，不画针头和伤口 */}
      <group position={[0.4, 0, 2.3]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.7, 0.16, 0.8]} />
          <meshStandardMaterial color={PASTEL.wood} />
        </mesh>
        {[-0.7, 0.7].map((x) => (
          <mesh key={x} position={[x, 0.11, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.22, 10]} />
            <meshStandardMaterial color={PASTEL.woodDark} />
          </mesh>
        ))}
        <mesh position={[-0.5, 0.46, 0]} rotation-z={Math.PI / 2}>
          <capsuleGeometry args={[0.17, 0.4, 6, 12]} />
          <meshStandardMaterial color={PASTEL.mint} />
        </mesh>
        <group position={[-0.95, 0.46, 0]}>
          <mesh>
            <sphereGeometry args={[0.16, 14, 14]} />
            <meshStandardMaterial color={PASTEL.skin} />
          </mesh>
          <CuteFace r={0.16} sleepy />
        </group>
        <mesh position={[0.2, 0.62, 0.3]} rotation-z={-0.7}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 10]} />
          <meshStandardMaterial color={PASTEL.lilac} />
        </mesh>
        <mesh position={[0.38, 0.76, 0.3]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color={PASTEL.sun} />
        </mesh>
      </group>

      {/* 热点 */}
      <Hotspot position={[-1.1, 1.15, 0.2]} active={activeHotspot === "blood-test"} animate={animate} onSelect={() => onSelectHotspot("blood-test")} />
      <Hotspot position={[0.1, 1.3, -0.2]} active={activeHotspot === "marrow-check"} animate={animate} onSelect={() => onSelectHotspot("marrow-check")} />
      <Hotspot position={[1.35, 1.1, 0.3]} active={activeHotspot === "immuno"} animate={animate} onSelect={() => onSelectHotspot("immuno")} />
      <Hotspot position={[2, 1.95, -0.3]} active={activeHotspot === "gene"} animate={animate} onSelect={() => onSelectHotspot("gene")} />
      <Hotspot position={[0.4, 1, 2.3]} active={activeHotspot === "lumbar"} animate={animate} onSelect={() => onSelectHotspot("lumbar")} />
    </group>
  );
}
