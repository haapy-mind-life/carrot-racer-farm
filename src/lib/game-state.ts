import { useCallback, useEffect, useState } from "react";
import {
  createDefaultAvatar,
  normalizeAvatarState,
  buyAvatarItem as purchaseAvatarItem,
  equipAvatarItem as applyAvatarEquip,
  type AvatarState,
} from "@/lib/avatar-system";

export type CropId = "radish" | "beet" | "lettuce" | "carrot" | "sunflower";

export type Crop = {
  id: CropId;
  name: string;
  goldName: string;
  emoji: string;
  goldEmoji: string;
  seedCost: number;
  sellPrice: number;
  goldSellPrice: number;
  waterNeeded: number;
};

export const CROPS: Crop[] = [
  { id: "radish", name: "무", goldName: "황금 무", emoji: "🥬", goldEmoji: "✨🥬", seedCost: 10, sellPrice: 30, goldSellPrice: 300, waterNeeded: 2 },
  { id: "beet", name: "사탕무", goldName: "황금 사탕무", emoji: "🍠", goldEmoji: "✨🍠", seedCost: 100, sellPrice: 260, goldSellPrice: 2600, waterNeeded: 3 },
  { id: "lettuce", name: "양상추", goldName: "황금 양상추", emoji: "🥗", goldEmoji: "✨🥗", seedCost: 300, sellPrice: 800, goldSellPrice: 8000, waterNeeded: 4 },
  { id: "carrot", name: "당근", goldName: "황금 당근", emoji: "🥕", goldEmoji: "✨🥕", seedCost: 1000, sellPrice: 2800, goldSellPrice: 28000, waterNeeded: 5 },
  { id: "sunflower", name: "해바라기", goldName: "황금 해바라기", emoji: "🌻", goldEmoji: "✨🌻", seedCost: 10000, sellPrice: 30000, goldSellPrice: 300000, waterNeeded: 6 },
];

export const cropById = (id: CropId) => CROPS.find((c) => c.id === id)!;

export const TICKET_PRICE = 50000;
export const GOLD_CHANCE = 0.12;
export const PLOT_COUNT = 6;

export type Plot = {
  crop: CropId | null;
  water: number;
  gold: boolean;
};

export type GameState = {
  money: number;
  plots: Plot[];
  hasTicket: boolean;
  bestRun: number;
  avatar: AvatarState;
};

const STORAGE_KEY = "hyunjun-game-v1";

const emptyPlots = (): Plot[] =>
  Array.from({ length: PLOT_COUNT }, () => ({ crop: null, water: 0, gold: false }));

const makeInitialState = (): GameState => ({
  money: 50,
  plots: emptyPlots(),
  hasTicket: false,
  bestRun: 0,
  avatar: createDefaultAvatar(),
});

const initialState = makeInitialState();

function load(): GameState {
  if (typeof window === "undefined") return makeInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeInitialState();
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return {
      money: typeof parsed.money === "number" ? parsed.money : initialState.money,
      plots:
        Array.isArray(parsed.plots) && parsed.plots.length === PLOT_COUNT
          ? (parsed.plots as Plot[])
          : emptyPlots(),
      hasTicket: Boolean(parsed.hasTicket),
      bestRun: typeof parsed.bestRun === "number" ? parsed.bestRun : 0,
      avatar: normalizeAvatarState(parsed.avatar),
    };
  } catch {
    return makeInitialState();
  }
}

export function useGame() {
  const [state, setState] = useState<GameState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const addMoney = useCallback((amount: number) => {
    setState((s) => ({ ...s, money: s.money + amount }));
  }, []);

  const recordRun = useCallback((earned: number) => {
    setState((s) => ({
      ...s,
      money: s.money + earned,
      bestRun: Math.max(s.bestRun, earned),
    }));
  }, []);

  const plant = useCallback((index: number, cropId: CropId) => {
    setState((s) => {
      const crop = cropById(cropId);
      if (s.money < crop.seedCost) return s;
      if (s.plots[index]?.crop) return s;
      const plots = s.plots.map((p, i) =>
        i === index ? { crop: cropId, water: 0, gold: false } : p,
      );
      return { ...s, money: s.money - crop.seedCost, plots };
    });
  }, []);

  const water = useCallback((index: number) => {
    setState((s) => {
      const plot = s.plots[index];
      if (!plot?.crop) return s;
      const crop = cropById(plot.crop);
      if (plot.water >= crop.waterNeeded) return s;
      const nextWater = plot.water + 1;
      const grownNow = nextWater >= crop.waterNeeded;
      const plots = s.plots.map((p, i) =>
        i === index
          ? { ...p, water: nextWater, gold: grownNow ? Math.random() < GOLD_CHANCE : p.gold }
          : p,
      );
      return { ...s, plots };
    });
  }, []);

  const harvest = useCallback((index: number) => {
    let result: { name: string; amount: number; gold: boolean } | null = null;
    setState((s) => {
      const plot = s.plots[index];
      if (!plot?.crop) return s;
      const crop = cropById(plot.crop);
      if (plot.water < crop.waterNeeded) return s;
      const amount = plot.gold ? crop.goldSellPrice : crop.sellPrice;
      result = { name: plot.gold ? crop.goldName : crop.name, amount, gold: plot.gold };
      const plots = s.plots.map((p, i) =>
        i === index ? { crop: null, water: 0, gold: false } : p,
      );
      return { ...s, money: s.money + amount, plots };
    });
    return result;
  }, []);

  const buyTicket = useCallback(() => {
    setState((s) =>
      s.hasTicket || s.money < TICKET_PRICE
        ? s
        : { ...s, money: s.money - TICKET_PRICE, hasTicket: true },
    );
  }, []);

  const buyAvatarItem = useCallback((itemId: string) => {
    setState((s) => {
      const result = purchaseAvatarItem(s.avatar, s.money, itemId);
      return result.ok ? { ...s, money: result.money, avatar: result.avatar } : s;
    });
  }, []);

  const equipAvatarItem = useCallback((itemId: string) => {
    setState((s) => {
      const result = applyAvatarEquip(s.avatar, itemId);
      return result.ok ? { ...s, avatar: result.avatar } : s;
    });
  }, []);

  const reset = useCallback(() => setState(makeInitialState()), []);

  return {
    state,
    ready,
    addMoney,
    recordRun,
    plant,
    water,
    harvest,
    buyTicket,
    buyAvatarItem,
    equipAvatarItem,
    reset,
  };
}

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
