export type Point = { x: number; y: number };
export type MiniKind = "treasure" | "stars" | "fishing";
// Preserve the original 0..5600 villages. The coast and ocean are contiguous eastern ground.
export const MAP = { width: 10200, height: 1800 };
export const OCEAN_START = 7380;
export const SPAWN = { x: 1350, y: 920 };
export const BLOCKS = [
  { id: "house", x: 360, y: 330, w: 240, h: 180 },
  { id: "farm", x: 2100, y: 1170, w: 250, h: 170 },
  { id: "runner", x: 2260, y: 300, w: 240, h: 170 },
  { id: "lake", x: 1740, y: 710, w: 650, h: 310 },
];
export const PORTALS = [
  { id: "house", name: "우리 집", x: 480, y: 565, target: "/house" },
  { id: "runner", name: "박현준 러너", x: 2380, y: 530, target: "/race" },
  { id: "farm", name: "반짝 농장", x: 2225, y: 1400, target: "/greenhouse" },
  { id: "treasure", name: "토토의 보물찾기", x: 550, y: 1300, game: "treasure" },
  { id: "stars", name: "루루의 별빛 공원", x: 1250, y: 400, game: "stars" },
  { id: "fishing", name: "호숫가 낚시", x: 2030, y: 1080, game: "fishing" },
] as const;
export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
export function isWalkable(p: Point) {
  return !BLOCKS.some(
    (b) => p.x > b.x - 18 && p.x < b.x + b.w + 18 && p.y > b.y - 18 && p.y < b.y + b.h + 18,
  );
}
export function stepPlayer(p: Point, d: Point, dt: number): Point {
  const length = Math.hypot(d.x, d.y) || 1;
  const step = (245 * clamp(dt, 0, 0.05)) / Math.max(1, length);
  const next = { x: p.x, y: p.y };
  // The old 5600px world used to wrap; a finite eastern ocean now requires real boundaries.
  const x = clamp(p.x + d.x * step, 24, OCEAN_START - 52);
  if (isWalkable({ x, y: p.y })) next.x = x;
  const y = clamp(p.y + d.y * step, 24, MAP.height - 24);
  if (isWalkable({ x: next.x, y })) next.y = y;
  return next;
}
export function cameraAt(p: Point, w: number, h: number): Point {
  return {
    x: clamp(p.x - w / 2, 0, Math.max(0, MAP.width - w)),
    y: clamp(p.y - h / 2, 0, Math.max(0, MAP.height - h)),
  };
}
export function nearestPortal(p: Point) {
  return (
    PORTALS.filter((g) => Math.hypot(g.x - p.x, g.y - p.y) < 100).sort(
      (a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y),
    )[0] ?? null
  );
}
export type Mini = {
  kind: MiniKind;
  phase: "playing" | "won" | "over";
  time: number;
  score: number;
  player: Point;
  items: (Point & { found: boolean })[];
  cursor: number;
  direction: number;
  cooldown: number;
  feedback: string;
};
export function newMini(kind: MiniKind): Mini {
  const spots: [number, number][] = [
    [120, 110],
    [610, 130],
    [360, 95],
    [150, 310],
    [630, 320],
    [390, 280],
  ];
  return {
    kind,
    phase: "playing",
    time: kind === "treasure" ? 75 : 45,
    score: 0,
    player: { x: 380, y: 370 },
    items: spots.map(([x, y]) => ({ x, y, found: false })),
    cursor: 0.1,
    direction: 1,
    cooldown: 0,
    feedback:
      kind === "fishing"
        ? "찌가 초록색 가운데에 오면 낚기 버튼을 톡!"
        : "왼쪽 조이스틱을 밀어 움직여 봐!",
  };
}
export function stepMini(g: Mini, d: Point, delta: number) {
  if (g.phase !== "playing") return;
  const dt = clamp(delta, 0, 0.05);
  g.time = Math.max(0, g.time - dt);
  g.cooldown = Math.max(0, g.cooldown - dt);
  if (g.kind === "fishing") {
    g.cursor += g.direction * dt * 0.65;
    if (g.cursor >= 1) {
      g.cursor = 1;
      g.direction = -1;
    }
    if (g.cursor <= 0) {
      g.cursor = 0;
      g.direction = 1;
    }
  } else {
    const length = Math.max(1, Math.hypot(d.x, d.y));
    g.player.x = clamp(g.player.x + (d.x / length) * 230 * dt, 28, 732);
    g.player.y = clamp(g.player.y + (d.y / length) * 230 * dt, 65, 392);
    for (const item of g.items)
      if (!item.found && Math.hypot(item.x - g.player.x, item.y - g.player.y) < 35) {
        item.found = true;
        g.score++;
        g.feedback = g.kind === "stars" ? "반짝! 별을 모았어!" : "보물 발견! 토토가 기뻐해!";
      }
    if (g.kind === "stars" && g.items.every((i) => i.found) && g.score < 18) {
      g.items = g.items.map((item, i) => ({
        x: 90 + ((item.x * 3 + i * 97) % 580),
        y: 85 + ((item.y * 2 + i * 53) % 255),
        found: false,
      }));
    }
  }
  const goal = g.kind === "treasure" ? 6 : g.kind === "stars" ? 18 : 5;
  if (g.score >= goal) g.phase = "won";
  else if (g.time <= 0) g.phase = "over";
}
export function actMini(g: Mini) {
  if (g.kind !== "fishing" || g.phase !== "playing" || g.cooldown > 0) return;
  g.cooldown = 0.8;
  if (g.cursor >= 0.32 && g.cursor <= 0.68) {
    g.score++;
    g.feedback = "잡았다! 물고기 친구를 다시 보내줬어.";
  } else g.feedback = "조금만 기다렸다가 초록색에서 눌러 봐!";
  if (g.score >= 5) g.phase = "won";
}
