import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line as DreiLine, OrbitControls } from "@react-three/drei";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  MathUtils,
  SRGBColorSpace,
  type Group,
  type PerspectiveCamera,
  type Sprite,
} from "three";

export type WordSkyCard = {
  id: string;
  kind: "word" | "chapter";
  eyebrow: string;
  title: string;
  meta: string;
  hue: string;
};

export type WordSkyFocus = {
  eyebrow: string;
  title: string;
  meta: string;
  hue: string;
};

type Tone = { accent: string; paper: string; ink: string };

const TONES: Record<string, Tone> = {
  coral: { accent: "#df5f50", paper: "#fff3ee", ink: "#4c332f" },
  sun: { accent: "#d79a2b", paper: "#fff8e8", ink: "#4e402a" },
  plum: { accent: "#8a62b5", paper: "#f7f0ff", ink: "#40324f" },
  sky: { accent: "#4a88b6", paper: "#eef8ff", ink: "#2f4455" },
  leaf: { accent: "#619653", paper: "#f2faec", ink: "#35452f" },
  mint: { accent: "#3f978b", paper: "#ecfaf6", ink: "#2e4642" },
  rose: { accent: "#c56f8d", paper: "#fff2f6", ink: "#4d333c" },
  lilac: { accent: "#8a78bf", paper: "#f5f1ff", ink: "#3d3554" },
};

const FALLBACK_TONE = TONES.coral;

function toneFor(hue: string): Tone {
  return TONES[hue] ?? FALLBACK_TONE;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  weight: number,
) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px "PingFang SC","Microsoft YaHei",sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  cheeks = false,
) {
  const eyeX = radius * 0.34;
  const eyeY = cy - radius * 0.08;
  const eyeR = Math.max(1.8, radius * 0.1);
  ctx.fillStyle = color;
  for (const dx of [-eyeX, eyeX]) {
    ctx.beginPath();
    ctx.arc(cx + dx, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, radius * 0.085);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy + radius * 0.04, radius * 0.34, Math.PI * 0.22, Math.PI * 0.78);
  ctx.stroke();
  if (cheeks) {
    ctx.fillStyle = "rgba(247, 168, 184, 0.62)";
    for (const dx of [-eyeX * 1.3, eyeX * 1.3]) {
      ctx.beginPath();
      ctx.ellipse(cx + dx, cy + radius * 0.26, radius * 0.15, radius * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -radius);
  ctx.quadraticCurveTo(radius * 0.22, -radius * 0.22, radius, 0);
  ctx.quadraticCurveTo(radius * 0.22, radius * 0.22, 0, radius);
  ctx.quadraticCurveTo(-radius * 0.22, radius * 0.22, -radius, 0);
  ctx.quadraticCurveTo(-radius * 0.22, -radius * 0.22, 0, -radius);
  ctx.fill();
  ctx.restore();
}

function makeCardTexture(card: WordSkyCard) {
  const width = 256;
  const height = 100;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const tone = toneFor(card.hue);

  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = "round";

    roundRect(ctx, 8, 10, 240, 86, 22);
    ctx.fillStyle = "rgba(76, 51, 47, 0.14)";
    ctx.fill();

    roundRect(ctx, 3, 3, 250, 90, 24);
    ctx.fillStyle = "#fffdf8";
    ctx.fill();

    roundRect(ctx, 8, 8, 240, 80, 20);
    ctx.fillStyle = tone.paper;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = tone.accent;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(36, 48, 20, 0, Math.PI * 2);
    ctx.fillStyle = tone.accent;
    ctx.fill();
    drawFace(ctx, 36, 48, 20, "#fffdf8", true);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = tone.accent;
    ctx.font = '700 17px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(card.eyebrow, 66, 26);

    const titleSize = fitFont(ctx, card.title, 172, 32, 19, 700);
    ctx.font = `700 ${titleSize}px "PingFang SC","Microsoft YaHei",sans-serif`;
    ctx.fillStyle = tone.ink;
    ctx.fillText(card.title, 66, 56);

    drawStar(ctx, 230, 22, 7, tone.accent);
    ctx.fillStyle = tone.accent;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(226, 76, 2.6, 0, Math.PI * 2);
    ctx.arc(236, 80, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeChapterTexture(card: WordSkyCard) {
  const width = 384;
  const height = 192;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const tone = toneFor(card.hue);

  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = "round";

    roundRect(ctx, 10, 14, width - 20, height - 24, 36);
    ctx.fillStyle = "rgba(76, 51, 47, 0.14)";
    ctx.fill();

    roundRect(ctx, 3, 3, width - 6, height - 6, 38);
    ctx.fillStyle = "#fffdf8";
    ctx.fill();

    roundRect(ctx, 9, 9, width - 18, height - 18, 32);
    ctx.fillStyle = tone.paper;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = tone.accent;
    ctx.stroke();

    roundRect(ctx, 24, 24, 164, 46, 23);
    ctx.fillStyle = tone.accent;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(52, 47, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#fffdf8";
    ctx.fill();
    drawFace(ctx, 52, 47, 15, tone.accent);

    ctx.fillStyle = "#fffdf8";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = '700 23px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(card.eyebrow, 76, 47);

    drawStar(ctx, width - 42, 42, 11, tone.accent);
    ctx.globalAlpha = 0.5;
    drawStar(ctx, width - 70, 64, 4, tone.accent);
    ctx.globalAlpha = 1;

    const titleSize = fitFont(ctx, card.title, width - 80, 46, 26, 700);
    ctx.font = `700 ${titleSize}px "PingFang SC","Microsoft YaHei",sans-serif`;
    ctx.fillStyle = tone.ink;
    ctx.textAlign = "center";
    ctx.fillText(card.title, width / 2, 118);

    ctx.fillStyle = tone.accent;
    ctx.font = '600 24px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(card.meta, width / 2, 158);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeFocusTexture(focus: WordSkyFocus) {
  const width = 384;
  const height = 192;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const tone = toneFor(focus.hue);

  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.lineJoin = "round";

    roundRect(ctx, 10, 16, width - 20, height - 26, 42);
    ctx.fillStyle = "rgba(76, 51, 47, 0.16)";
    ctx.fill();

    roundRect(ctx, 3, 3, width - 6, height - 6, 42);
    ctx.fillStyle = "#fffdf8";
    ctx.fill();

    roundRect(ctx, 9, 9, width - 18, height - 18, 36);
    ctx.fillStyle = tone.accent;
    ctx.fill();

    roundRect(ctx, 20, 20, width - 40, height - 40, 28);
    ctx.strokeStyle = "rgba(255, 253, 248, 0.34)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(84, 96, 46, 0, Math.PI * 2);
    ctx.fillStyle = "#fffdf8";
    ctx.fill();
    drawFace(ctx, 84, 96, 40, tone.accent, true);

    ctx.fillStyle = "rgba(255, 253, 248, 0.88)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = '700 24px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(focus.eyebrow, 150, 62);

    const titleSize = fitFont(ctx, focus.title, width - 172, 44, 26, 700);
    ctx.font = `700 ${titleSize}px "PingFang SC","Microsoft YaHei",sans-serif`;
    ctx.fillStyle = "#fffdf8";
    ctx.fillText(focus.title, 150, 106);

    ctx.fillStyle = "rgba(255, 253, 248, 0.82)";
    ctx.font = '600 22px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(focus.meta, 150, 144);

    ctx.globalAlpha = 0.7;
    drawStar(ctx, width - 44, 46, 10, "#fffdf8");
    drawStar(ctx, width - 70, 72, 4.5, "#fffdf8");
    ctx.globalAlpha = 0.4;
    drawStar(ctx, width - 34, 140, 5, "#fffdf8");
    ctx.globalAlpha = 1;
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

type PlacedCard = {
  card: WordSkyCard;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
};

type Layout = {
  hub: { width: number; height: number; x: number; y: number; z: number };
  cards: PlacedCard[];
  width: number;
  height: number;
};

function buildLayout(cards: WordSkyCard[], viewportWidth: number): Layout {
  const singleColumn = viewportWidth < 560 && cards.length <= 6;
  const columns = singleColumn ? 1 : 2;
  const chapterMode = cards.every((card) => card.kind === "chapter");
  const rowGap = chapterMode ? 1.02 : 0.76;
  const colGap = chapterMode ? 2.16 : 2.04;
  const hubWidth = chapterMode ? 2.05 : 1.8;
  const hubHeight = hubWidth / 2;

  const placed = cards.map((card, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const width = chapterMode
      ? 1.82
      : Math.min(1.66, 1.26 + Math.min(card.title.length, 10) * 0.038);
    const height = width / (chapterMode ? 2 : 2.56);
    return {
      card,
      width,
      height,
      x: columns === 1 ? 0 : column === 0 ? -colGap / 2 : colGap / 2,
      y: -row * rowGap,
      z: row % 2 === 0 ? -0.14 : 0.14,
    };
  });

  const hubY = 0.9;
  const minY = placed.length
    ? Math.min(-hubHeight / 2, ...placed.map((item) => item.y - item.height / 2))
    : -hubHeight / 2;
  const maxY = placed.length
    ? Math.max(hubY + hubHeight / 2, ...placed.map((item) => item.y + item.height / 2))
    : hubY + hubHeight / 2;
  const minX = placed.length
    ? Math.min(-hubWidth / 2, ...placed.map((item) => item.x - item.width / 2))
    : -hubWidth / 2;
  const maxX = placed.length
    ? Math.max(hubWidth / 2, ...placed.map((item) => item.x + item.width / 2))
    : hubWidth / 2;
  const offsetY = -(minY + maxY) / 2;

  placed.forEach((item) => {
    item.y += offsetY;
  });

  return {
    hub: { width: hubWidth, height: hubHeight, x: 0, y: hubY + offsetY, z: 0.2 },
    cards: placed,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function CameraRig({ layoutWidth, layoutHeight }: { layoutWidth: number; layoutHeight: number }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useEffect(() => {
    const cam = camera as PerspectiveCamera;
    const vFov = (cam.fov * Math.PI) / 180;
    const aspect = size.width / Math.max(1, size.height);
    const fitHeight = layoutHeight / (2 * Math.tan(vFov / 2));
    const fitWidth = layoutWidth / (2 * Math.tan(vFov / 2) * aspect);
    const distance = Math.max(fitHeight, fitWidth) * 1.16 + 0.55;
    cam.position.set(0, 0.1, distance);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, layoutHeight, layoutWidth, size.height, size.width]);

  return null;
}

function SkyCard({
  placed,
  active,
  animate,
  onPick,
}: {
  placed: PlacedCard;
  active: boolean;
  animate: boolean;
  onPick: (card: WordSkyCard) => void;
}) {
  const { card, width, height, x, y, z } = placed;
  const group = useRef<Group>(null);
  const sprite = useRef<Sprite>(null);
  const [hovered, setHovered] = useState(false);
  const phase = useMemo(() => {
    let hash = 0;
    for (let index = 0; index < card.id.length; index += 1) {
      hash = (hash * 31 + card.id.charCodeAt(index)) % 628;
    }
    return (hash / 100) % (Math.PI * 2);
  }, [card.id]);
  const texture = useMemo(
    () => (card.kind === "chapter" ? makeChapterTexture(card) : makeCardTexture(card)),
    [card],
  );

  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );

  useFrame((state, delta) => {
    if (group.current) {
      const bob = animate ? Math.sin(state.clock.elapsedTime * 1.25 + phase) * 0.026 : 0;
      group.current.position.y = MathUtils.damp(group.current.position.y, y + bob, 3, delta);
    }
    const node = sprite.current;
    if (!node) return;
    const factor = active ? 1.1 : hovered ? 1.05 : 1;
    const targetWidth = width * factor;
    const targetHeight = height * factor;
    if (!animate) {
      node.scale.set(targetWidth, targetHeight, 1);
      return;
    }
    node.scale.set(
      MathUtils.damp(node.scale.x, targetWidth, 12, delta),
      MathUtils.damp(node.scale.y, targetHeight, 12, delta),
      1,
    );
  });

  return (
    <group ref={group} position={[x, y, z]}>
      {active && (
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[width * 1.09, height * 1.18]} />
          <meshBasicMaterial color={toneFor(card.hue).accent} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      )}
      <sprite
        ref={sprite}
        scale={[width, height, 1]}
        onClick={(event) => {
          event.stopPropagation();
          onPick(card);
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
        <spriteMaterial map={texture} transparent toneMapped={false} opacity={active ? 1 : 0.95} />
      </sprite>
    </group>
  );
}

function Connections({
  hub,
  cards,
  activeId,
  animate,
}: {
  hub: Layout["hub"];
  cards: PlacedCard[];
  activeId: string | null;
  animate: boolean;
}) {
  const activeCard = cards.find((item) => item.card.id === activeId);
  const geometry = useMemo(() => {
    const positions = new Float32Array(cards.length * 6);
    const colors = new Float32Array(cards.length * 6);
    cards.forEach((item, index) => {
      const offset = index * 6;
      positions[offset] = hub.x;
      positions[offset + 1] = hub.y - hub.height / 2;
      positions[offset + 2] = hub.z;
      positions[offset + 3] = item.x;
      positions[offset + 4] = item.y + item.height / 2;
      positions[offset + 5] = item.z;
      const color = new Color(toneFor(item.card.hue).accent);
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
      colors[offset + 3] = color.r;
      colors[offset + 4] = color.g;
      colors[offset + 5] = color.b;
    });
    const next = new BufferGeometry();
    next.setAttribute("position", new BufferAttribute(positions, 3));
    next.setAttribute("color", new BufferAttribute(colors, 3));
    return next;
  }, [cards, hub]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial vertexColors transparent opacity={0.34} depthWrite={false} />
      </lineSegments>
      {activeCard && (
        <DreiLine
          points={[
            [hub.x, hub.y - hub.height / 2, hub.z],
            [activeCard.x, activeCard.y + activeCard.height / 2, activeCard.z],
          ]}
          color={toneFor(activeCard.card.hue).accent}
          lineWidth={2.2}
          transparent
          opacity={animate ? 0.9 : 1}
        />
      )}
    </group>
  );
}

function SkyScene({
  cards,
  focus,
  activeId,
  animate,
  onSelectWord,
  onSelectChapter,
}: {
  cards: WordSkyCard[];
  focus: WordSkyFocus;
  activeId: string | null;
  animate: boolean;
  onSelectWord: (id: string) => void;
  onSelectChapter: (id: string) => void;
}) {
  const size = useThree((state) => state.size);
  const layout = useMemo(() => buildLayout(cards, size.width), [cards, size.width]);
  const focusTexture = useMemo(() => makeFocusTexture(focus), [focus]);

  useEffect(() => () => focusTexture.dispose(), [focusTexture]);

  function pick(card: WordSkyCard) {
    if (card.kind === "chapter") onSelectChapter(card.id);
    else onSelectWord(card.id);
  }

  return (
    <>
      <CameraRig layoutWidth={layout.width} layoutHeight={layout.height} />
      <group>
        <sprite position={[layout.hub.x, layout.hub.y, layout.hub.z]} scale={[layout.hub.width, layout.hub.height, 1]}>
          <spriteMaterial map={focusTexture} transparent toneMapped={false} />
        </sprite>
        {layout.cards.map((placed) => (
          <SkyCard
            key={placed.card.id}
            placed={placed}
            active={placed.card.id === activeId}
            animate={animate}
            onPick={pick}
          />
        ))}
        <Connections hub={layout.hub} cards={layout.cards} activeId={activeId} animate={animate} />
      </group>
      <OrbitControls
        enablePan={false}
        minDistance={4.2}
        maxDistance={17}
        minPolarAngle={1.22}
        maxPolarAngle={1.94}
        minAzimuthAngle={-0.8}
        maxAzimuthAngle={0.8}
        enableDamping
        dampingFactor={0.12}
      />
    </>
  );
}

export default function WordsConstellationCanvas({
  cards,
  focus,
  activeId,
  animate,
  onSelectWord,
  onSelectChapter,
}: {
  cards: WordSkyCard[];
  focus: WordSkyFocus;
  activeId: string | null;
  animate: boolean;
  onSelectWord: (id: string) => void;
  onSelectChapter: (id: string) => void;
}) {
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.1, 9], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      aria-hidden="true"
    >
      <SkyScene
        cards={cards}
        focus={focus}
        activeId={activeId}
        animate={animate}
        onSelectWord={onSelectWord}
        onSelectChapter={onSelectChapter}
      />
    </Canvas>
  );
}
