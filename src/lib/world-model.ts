export type CropId = "radish" | "beet" | "lettuce" | "carrot" | "sunflower";
export type Outfit = "mint" | "peach" | "lavender";
export type Wallpaper = "cream" | "sky" | "rose";
export type Crop = {
  id: CropId;
  name: string;
  goldName: string;
  seedCost: number;
  sellPrice: number;
  goldSellPrice: number;
  waterNeeded: number;
};
export const CROPS: Crop[] = [
  {
    id: "radish",
    name: "동글 무",
    goldName: "반짝 무",
    seedCost: 0,
    sellPrice: 8,
    goldSellPrice: 16,
    waterNeeded: 2,
  },
  {
    id: "beet",
    name: "하트 사탕무",
    goldName: "반짝 사탕무",
    seedCost: 4,
    sellPrice: 14,
    goldSellPrice: 28,
    waterNeeded: 2,
  },
  {
    id: "lettuce",
    name: "폭신 양상추",
    goldName: "반짝 양상추",
    seedCost: 6,
    sellPrice: 18,
    goldSellPrice: 36,
    waterNeeded: 3,
  },
  {
    id: "carrot",
    name: "토끼 당근",
    goldName: "반짝 당근",
    seedCost: 8,
    sellPrice: 24,
    goldSellPrice: 48,
    waterNeeded: 3,
  },
  {
    id: "sunflower",
    name: "방긋 해바라기",
    goldName: "반짝 해바라기",
    seedCost: 10,
    sellPrice: 30,
    goldSellPrice: 60,
    waterNeeded: 4,
  },
];
export const FURNITURE = [
  { id: "bed", name: "구름 침대", cost: 0 },
  { id: "rug", name: "꽃잎 러그", cost: 0 },
  { id: "plant", name: "새싹 화분", cost: 0 },
  { id: "sofa", name: "복숭아 소파", cost: 25 },
  { id: "lamp", name: "별빛 스탠드", cost: 20 },
  { id: "shelf", name: "그림책 책장", cost: 30 },
  { id: "teddy", name: "곰돌이 친구", cost: 15 },
  { id: "window", name: "무지개 창문", cost: 35 },
] as const;
export type FurnitureId = (typeof FURNITURE)[number]["id"];
export type Plot = { crop: CropId | null; water: number; gold: boolean };
export type GameState = {
  version: 2;
  money: number;
  plots: Plot[];
  hasTicket: boolean;
  bestRun: number;
  runnerBest: number;
  runs: number;
  harvests: number;
  outfit: Outfit;
  wallpaper: Wallpaper;
  ownedFurniture: FurnitureId[];
  room: (FurnitureId | null)[];
  settledRuns: string[];
};
export const PLOT_COUNT = 6;
export const TICKET_PRICE = 50000;
export const cropById = (id: CropId) => CROPS.find((c) => c.id === id)!;
export const coins = (n: number) => `${Math.floor(n).toLocaleString("ko-KR")} 별코인`;
export const won = coins;
const knownCrop = (v: unknown): v is CropId => CROPS.some((c) => c.id === v);
const knownFurniture = (v: unknown): v is FurnitureId => FURNITURE.some((f) => f.id === v);
const finite = (v: unknown, fallback = 0, max = 1e12) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(max, Math.max(0, Math.floor(v)))
    : fallback;
const object = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const emptyPlot = (): Plot => ({ crop: null, water: 0, gold: false });
export function migrateSave(input: unknown): GameState {
  const raw = object(input),
    oldPlots = Array.isArray(raw.plots) ? raw.plots : [];
  const starter: FurnitureId[] = ["bed", "rug", "plant"];
  const owned = [
    ...new Set([
      ...starter,
      ...(Array.isArray(raw.ownedFurniture) ? raw.ownedFurniture.filter(knownFurniture) : []),
    ]),
  ];
  const placed = new Set<FurnitureId>();
  const sourceRoom = Array.isArray(raw.room) ? raw.room : ["bed", null, "plant", null, "rug", null];
  const room = Array.from({ length: 6 }, (_, i) => {
    const item = sourceRoom[i];
    if (!knownFurniture(item) || !owned.includes(item) || placed.has(item)) return null;
    placed.add(item);
    return item;
  });
  return {
    version: 2,
    money: finite(raw.money, 50),
    plots: Array.from({ length: PLOT_COUNT }, (_, i) => {
      const p = object(oldPlots[i]);
      if (!knownCrop(p.crop)) return emptyPlot();
      const crop = cropById(p.crop);
      return { crop: p.crop, water: finite(p.water, 0, crop.waterNeeded), gold: p.gold === true };
    }),
    hasTicket: raw.hasTicket === true,
    bestRun: finite(raw.bestRun),
    runnerBest: finite(raw.runnerBest, 0, 1000),
    runs: finite(raw.runs),
    harvests: finite(raw.harvests),
    outfit: raw.outfit === "peach" || raw.outfit === "lavender" ? raw.outfit : "mint",
    wallpaper: raw.wallpaper === "sky" || raw.wallpaper === "rose" ? raw.wallpaper : "cream",
    ownedFurniture: owned,
    room,
    settledRuns: Array.isArray(raw.settledRuns)
      ? raw.settledRuns
          .filter((id): id is string => typeof id === "string" && id.length > 0 && id.length < 160)
          .slice(-50)
      : [],
  };
}
export type WorldAction =
  | { type: "plant"; index: number; crop: CropId }
  | { type: "water" | "harvest"; index: number }
  | { type: "settle-run"; id: string; score: number; coins: number; clear: boolean }
  | { type: "buy-furniture"; id: FurnitureId }
  | { type: "place-furniture"; id: FurnitureId | null; slot: number }
  | { type: "outfit"; outfit: Outfit }
  | { type: "wallpaper"; wallpaper: Wallpaper };
export function reduceWorld(state: GameState, action: WorldAction): GameState {
  if (action.type === "plant" || action.type === "water" || action.type === "harvest") {
    if (!Number.isInteger(action.index) || action.index < 0 || action.index >= PLOT_COUNT)
      return state;
    const plots = state.plots.slice(),
      plot = plots[action.index];
    if (action.type === "plant") {
      if (plot.crop || !knownCrop(action.crop)) return state;
      const crop = cropById(action.crop);
      if (state.money < crop.seedCost) return state;
      plots[action.index] = { crop: crop.id, water: 0, gold: false };
      return { ...state, money: state.money - crop.seedCost, plots };
    }
    if (!plot.crop) return state;
    const crop = cropById(plot.crop);
    if (action.type === "water") {
      if (plot.water >= crop.waterNeeded) return state;
      plots[action.index] = { ...plot, water: plot.water + 1 };
      return { ...state, plots };
    }
    if (plot.water < crop.waterNeeded) return state;
    const harvests = state.harvests + 1,
      bonus = plot.gold || harvests % 5 === 0;
    plots[action.index] = emptyPlot();
    return {
      ...state,
      harvests,
      plots,
      money: Math.min(1e12, state.money + (bonus ? crop.goldSellPrice : crop.sellPrice)),
    };
  }
  if (action.type === "settle-run") {
    if (
      !action.id ||
      action.id.length >= 160 ||
      state.settledRuns.includes(action.id) ||
      !Number.isFinite(action.score) ||
      !Number.isFinite(action.coins) ||
      action.score < 0 ||
      action.coins < 0
    )
      return state;
    const score = finite(action.score, 0, 1000),
      earned = finite(action.coins, 0, 200) + (action.clear && score === 1000 ? 25 : 0);
    return {
      ...state,
      money: Math.min(1e12, state.money + earned),
      bestRun: Math.max(state.bestRun, earned),
      runnerBest: Math.max(state.runnerBest, score),
      runs: state.runs + 1,
      settledRuns: [...state.settledRuns, action.id].slice(-50),
    };
  }
  if (action.type === "buy-furniture") {
    const item = FURNITURE.find((f) => f.id === action.id);
    if (!item || state.ownedFurniture.includes(item.id) || state.money < item.cost) return state;
    return {
      ...state,
      money: state.money - item.cost,
      ownedFurniture: [...state.ownedFurniture, item.id],
    };
  }
  if (action.type === "place-furniture") {
    if (
      !Number.isInteger(action.slot) ||
      action.slot < 0 ||
      action.slot >= 6 ||
      (action.id !== null && !state.ownedFurniture.includes(action.id))
    )
      return state;
    const room = state.room.map((id) => (action.id !== null && id === action.id ? null : id));
    room[action.slot] = action.id;
    return { ...state, room };
  }
  if (action.type === "outfit") return { ...state, outfit: action.outfit };
  if (action.type === "wallpaper") return { ...state, wallpaper: action.wallpaper };
  return state;
}
