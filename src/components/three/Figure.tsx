import { Bob, CuteFace, PASTEL } from "@/src/components/three/Cute";

export function Figure({
  position,
  shirt,
  adult = false,
  animate = false,
  sleepy = false,
}: {
  position: [number, number, number];
  shirt: string;
  adult?: boolean;
  animate?: boolean;
  sleepy?: boolean;
}) {
  const bodyH = adult ? 0.9 : 0.58;
  const headR = adult ? 0.24 : 0.26;
  const headY = bodyH / 2 + (adult ? 0.3 : 0.3) + headR * 0.7;
  return (
    <group position={position}>
      <Bob animate={animate} amp={0.045} speed={1.8}>
        <mesh position={[0, bodyH / 2, 0]}>
          <capsuleGeometry args={[adult ? 0.24 : 0.22, bodyH / 2, 6, 12]} />
          <meshStandardMaterial color={shirt} />
        </mesh>
        {/* 圆圆的小手 */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (adult ? 0.3 : 0.27), bodyH * 0.55, 0]}>
            <sphereGeometry args={[adult ? 0.07 : 0.065, 8, 8]} />
            <meshStandardMaterial color={PASTEL.skin} />
          </mesh>
        ))}
        <mesh position={[0, headY, 0]}>
          <sphereGeometry args={[headR, 16, 16]} />
          <meshStandardMaterial color={PASTEL.skin} />
        </mesh>
        <mesh position={[0, headY + headR * 0.42, 0]} scale={[1, 0.58, 1]}>
          <sphereGeometry args={[headR * 1.03, 14, 14]} />
          <meshStandardMaterial color={PASTEL.hair} />
        </mesh>
        <CuteFace r={headR} blush={!adult} sleepy={sleepy} />
      </Bob>
    </group>
  );
}
