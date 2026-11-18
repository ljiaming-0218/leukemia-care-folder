import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Scene3D } from "@/src/data/scenes/scenes";
import { DetectiveLab3D } from "@/src/components/three/DetectiveLab3D";
import { Garden3D } from "@/src/components/three/Garden3D";
import { MarathonTrack3D } from "@/src/components/three/MarathonTrack3D";
import { MarrowFactory3D } from "@/src/components/three/MarrowFactory3D";
import { ShieldCamp3D } from "@/src/components/three/ShieldCamp3D";
import { VesselHighway3D } from "@/src/components/three/VesselHighway3D";

/* 只在 3D 模式下被 ExplorePage 动态加载；首屏与 2D 降级都不会拉取 three。
   标签页隐藏时浏览器会暂停 requestAnimationFrame，渲染随之停止。 */

const SCENES: Record<Scene3D["id"], typeof MarrowFactory3D> = {
  "marrow-factory": MarrowFactory3D,
  "vessel-highway": VesselHighway3D,
  "detective-lab": DetectiveLab3D,
  "treatment-marathon": MarathonTrack3D,
  "shield-camp": ShieldCamp3D,
  "recovery-garden": Garden3D,
};

export default function Scene3DCanvas({
  scene,
  activeHotspot,
  animate,
  onSelectHotspot,
}: {
  scene: Scene3D;
  activeHotspot: string | null;
  animate: boolean;
  onSelectHotspot: (id: string) => void;
}) {
  const Scene = SCENES[scene.id];
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      camera={{ position: scene.camera.position, fov: 45 }}
      gl={{ antialias: true, powerPreference: "low-power", alpha: true }}
      aria-hidden="true"
    >
      <color attach="background" args={["#fff8ec"]} />
      <ambientLight intensity={0.72} />
      <hemisphereLight args={["#fff4e0", "#cfe3f2", 0.4]} />
      <directionalLight position={[4, 6, 4]} intensity={1.15} />
      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={13}
        minPolarAngle={0.5}
        maxPolarAngle={1.9}
        target={scene.camera.target}
        enableDamping
        dampingFactor={0.12}
      />
      <Scene activeHotspot={activeHotspot} animate={animate} onSelectHotspot={onSelectHotspot} />
    </Canvas>
  );
}
