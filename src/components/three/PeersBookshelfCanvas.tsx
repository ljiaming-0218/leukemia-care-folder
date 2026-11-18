import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  CanvasTexture,
  MathUtils,
  SRGBColorSpace,
  type Group,
  type PerspectiveCamera,
} from "three";

export type ShelfBook = { id: string; title: string; theme: string };

const TONES: Record<string, { paper: string; band: string; spine: string; ink: string }> = {
  刚确诊: { paper: "#fbe4dd", band: "#f6b3a4", spine: "#e39a89", ink: "#5a3730" },
  异地就医: { paper: "#e3f1fa", band: "#a5d3ef", spine: "#86bcdd", ink: "#2f4658" },
  治疗与随访: { paper: "#ebf5de", band: "#b5e394", spine: "#95c775", ink: "#39482f" },
  返校与手足: { paper: "#fbf1d4", band: "#f9d976", spine: "#e3bf55", ink: "#594a22" },
};
const FALLBACK_TONE = TONES["刚确诊"];

function makeCoverTexture(title: string, theme: string) {
  const width = 384;
  const height = 768;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const tone = TONES[theme] ?? FALLBACK_TONE;
  if (ctx) {
    ctx.fillStyle = tone.paper;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = tone.band;
    ctx.fillRect(0, 0, width, 112);
    ctx.fillStyle = tone.ink;
    ctx.font = '600 34px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(theme, 28, 72);

    ctx.font = '700 72px "PingFang SC","Microsoft YaHei",sans-serif';
    const chars = Array.from(title.split(/[，,]/)[0].trim());
    for (let line = 0; line < 4; line++) {
      const chunk = chars.slice(line * 4, line * 4 + 4).join("");
      if (!chunk) break;
      ctx.fillText(chunk, 28, 238 + line * 88);
    }

    ctx.strokeStyle = tone.spine;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(28, height - 96);
    ctx.lineTo(width - 28, height - 96);
    ctx.stroke();
    ctx.fillStyle = tone.ink;
    ctx.font = '600 28px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText("真实同路人", 28, height - 46);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

type PlacedBook = {
  book: ShelfBook;
  x: number;
  baseY: number;
  width: number;
  height: number;
};

function layoutBooks(books: ShelfBook[]): PlacedBook[] {
  const placed: PlacedBook[] = [];
  [books.slice(0, 4), books.slice(4, 8)].forEach((rowBooks, row) => {
    const sizes = rowBooks.map((_, index) => ({
      width: 0.78 + (index % 2) * 0.05,
      height: 1.02 + ((index + row) % 3) * 0.06,
    }));
    const total =
      sizes.reduce((sum, item) => sum + item.width, 0) + Math.max(0, rowBooks.length - 1) * 0.05;
    let cursor = -total / 2;
    rowBooks.forEach((book, index) => {
      const size = sizes[index];
      placed.push({
        book,
        x: cursor + size.width / 2,
        baseY: row === 0 ? 0.04 : 1.56,
        width: size.width,
        height: size.height,
      });
      cursor += size.width + 0.05;
    });
  });
  return placed;
}

function Bookcase() {
  const wood = "#e8d2b4";
  const woodDark = "#d8bb96";
  return (
    <group>
      <mesh position={[0, 1.47, -0.32]}>
        <boxGeometry args={[3.9, 3.0, 0.06]} />
        <meshStandardMaterial color="#f2e5d2" roughness={0.95} />
      </mesh>
      {[-1.94, 1.94].map((x) => (
        <mesh key={x} position={[x, 1.47, 0]}>
          <boxGeometry args={[0.08, 3.0, 0.64]} />
          <meshStandardMaterial color={woodDark} roughness={0.9} />
        </mesh>
      ))}
      {[0, 1.52, 2.9].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[3.9, 0.08, 0.64]} />
          <meshStandardMaterial color={wood} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 2.98, 0.02]}>
        <boxGeometry args={[4.06, 0.08, 0.7]} />
        <meshStandardMaterial color={woodDark} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Book({
  book,
  x,
  baseY,
  width,
  height,
  active,
  animate,
  onOpen,
}: PlacedBook & { active: boolean; animate: boolean; onOpen: (id: string) => void }) {
  const ref = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const tone = TONES[book.theme] ?? FALLBACK_TONE;
  const texture = useMemo(() => makeCoverTexture(book.title, book.theme), [book.title, book.theme]);

  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => () => {
    document.body.style.cursor = "";
  }, []);

  useFrame((_, delta) => {
    const group = ref.current;
    if (!group) return;
    const baseCenter = baseY + height / 2;
    const targetY = baseCenter + (active ? 0.05 : hovered ? 0.02 : 0);
    const targetZ = 0.26 + (active ? 0.2 : hovered ? 0.05 : 0);
    if (animate) {
      group.position.y = MathUtils.damp(group.position.y, targetY, 7, delta);
      group.position.z = MathUtils.damp(group.position.z, targetZ, 7, delta);
    } else {
      group.position.y = targetY;
      group.position.z = targetZ;
    }
  });

  return (
    <group
      ref={ref}
      position={[x, baseY + height / 2, 0.26]}
      onClick={(event) => {
        event.stopPropagation();
        onOpen(book.id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <mesh>
        <boxGeometry args={[width, height, 0.18]} />
        <meshStandardMaterial attach="material-0" color="#f4ead9" roughness={0.95} />
        <meshStandardMaterial attach="material-1" color={tone.spine} roughness={0.85} />
        <meshStandardMaterial attach="material-2" color="#f4ead9" roughness={0.95} />
        <meshStandardMaterial attach="material-3" color={tone.spine} roughness={0.85} />
        <meshStandardMaterial attach="material-4" map={texture} roughness={0.9} />
        <meshStandardMaterial attach="material-5" color={tone.spine} roughness={0.9} />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const vFov = (cam.fov * Math.PI) / 180;
    const aspect = size.width / Math.max(1, size.height);
    const distance = Math.max(
      1.7 / Math.tan(vFov / 2),
      2.12 / (Math.tan(vFov / 2) * aspect),
    );
    cam.position.set(distance * 0.1, 2.0, distance);
    cam.lookAt(0, 1.5, 0);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

export default function PeersBookshelfCanvas({
  books,
  activeId,
  animate,
  onOpen,
}: {
  books: ShelfBook[];
  activeId: string | null;
  animate: boolean;
  onOpen: (id: string) => void;
}) {
  const placed = useMemo(() => layoutBooks(books), [books]);

  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      camera={{ position: [0.85, 2.0, 6.2], fov: 34 }}
      gl={{ antialias: true, powerPreference: "low-power", alpha: true }}
      aria-hidden="true"
    >
      <CameraRig />
      <ambientLight intensity={0.78} />
      <hemisphereLight args={["#fff4e0", "#cfe3f2", 0.45]} />
      <directionalLight position={[2.5, 4.5, 5]} intensity={1.12} />
      <directionalLight position={[-3, 2, 3]} intensity={0.35} color="#ffd9c2" />
      <Bookcase />
      {placed.map((item) => (
        <Book
          key={item.book.id}
          {...item}
          active={item.book.id === activeId}
          animate={animate}
          onOpen={onOpen}
        />
      ))}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        target={[0, 1.5, 0]}
        minPolarAngle={1.22}
        maxPolarAngle={1.62}
        minAzimuthAngle={-0.38}
        maxAzimuthAngle={0.38}
        enableDamping
        dampingFactor={0.12}
      />
    </Canvas>
  );
}
