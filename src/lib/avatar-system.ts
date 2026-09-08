export type AvatarCategory = "hair" | "top" | "bottom" | "shoes";

export type AvatarItem = {
  id: string;
  category: AvatarCategory;
  name: string;
  visual: string;
  price: number;
};

export type AvatarState = {
  ownedItems: string[];
  equipped: Record<AvatarCategory, string>;
};

export type AvatarActionResult = {
  ok: boolean;
  avatar: AvatarState;
  money: number;
  message: string;
};

export type AvatarEquipResult = {
  ok: boolean;
  avatar: AvatarState;
  message: string;
};

export const AVATAR_ITEMS: AvatarItem[] = [
  { id: "hair-short", category: "hair", name: "짧은 머리", visual: "🙂", price: 0 },
  { id: "hair-brown", category: "hair", name: "갈색 머리", visual: "🟤", price: 0 },
  { id: "hair-spiky", category: "hair", name: "뾰족 머리", visual: "⚡", price: 150 },
  { id: "hair-blue", category: "hair", name: "파란 머리", visual: "🔵", price: 300 },
  { id: "hair-star", category: "hair", name: "별 머리", visual: "⭐", price: 600 },
  { id: "hair-crown", category: "hair", name: "왕관 머리", visual: "👑", price: 1200 },
  { id: "top-shirt", category: "top", name: "기본 티셔츠", visual: "👕", price: 0 },
  { id: "top-green", category: "top", name: "초록 티셔츠", visual: "🟢", price: 0 },
  { id: "top-red", category: "top", name: "빨간 티셔츠", visual: "🔴", price: 150 },
  { id: "top-hoodie", category: "top", name: "후드티", visual: "🧥", price: 300 },
  { id: "top-rainbow", category: "top", name: "무지개 옷", visual: "🌈", price: 600 },
  { id: "top-hero", category: "top", name: "히어로 옷", visual: "🦸", price: 1200 },
  { id: "bottom-shorts", category: "bottom", name: "기본 반바지", visual: "🩳", price: 0 },
  { id: "bottom-jeans", category: "bottom", name: "청바지", visual: "👖", price: 0 },
  { id: "bottom-green", category: "bottom", name: "초록 바지", visual: "🟩", price: 200 },
  { id: "bottom-sport", category: "bottom", name: "운동 바지", visual: "🏃", price: 450 },
  { id: "bottom-gold", category: "bottom", name: "황금 바지", visual: "✨", price: 900 },
  { id: "shoes-sneakers", category: "shoes", name: "기본 운동화", visual: "👟", price: 0 },
  { id: "shoes-blue", category: "shoes", name: "파란 운동화", visual: "🔵", price: 0 },
  { id: "shoes-red", category: "shoes", name: "빨간 운동화", visual: "🔴", price: 200 },
  { id: "shoes-boots", category: "shoes", name: "튼튼한 부츠", visual: "🥾", price: 450 },
  { id: "shoes-rocket", category: "shoes", name: "로켓 신발", visual: "🚀", price: 900 },
];

const starters = AVATAR_ITEMS.filter((item) => item.price === 0).map((item) => item.id);

export const DEFAULT_AVATAR: AvatarState = {
  ownedItems: starters,
  equipped: {
    hair: "hair-short",
    top: "top-shirt",
    bottom: "bottom-shorts",
    shoes: "shoes-sneakers",
  },
};

const cloneAvatar = (avatar: AvatarState): AvatarState => ({
  ownedItems: [...avatar.ownedItems],
  equipped: { ...avatar.equipped },
});

const byId = (id: string) => AVATAR_ITEMS.find((item) => item.id === id);
const fallbackFor = (category: AvatarCategory) => DEFAULT_AVATAR.equipped[category];

export function normalizeAvatarState(input: unknown): AvatarState {
  const raw = input && typeof input === "object" ? (input as Partial<AvatarState>) : {};
  const validOwned = Array.isArray(raw.ownedItems)
    ? raw.ownedItems.filter((id): id is string => typeof id === "string" && Boolean(byId(id)))
    : [];
  const ownedItems = Array.from(new Set([...starters, ...validOwned]));
  const rawEquipped = raw.equipped && typeof raw.equipped === "object" ? raw.equipped : {};
  const equipped = {} as Record<AvatarCategory, string>;
  for (const category of ["hair", "top", "bottom", "shoes"] as const) {
    const candidate = (rawEquipped as Partial<Record<AvatarCategory, string>>)[category];
    const item = typeof candidate === "string" ? byId(candidate) : undefined;
    const chosen = item?.category === category && ownedItems.includes(item.id) ? item.id : fallbackFor(category);
    equipped[category] = chosen;
    if (!ownedItems.includes(chosen)) ownedItems.push(chosen);
  }
  return { ownedItems, equipped };
}

export function equipAvatarItem(state: AvatarState, itemId: string): AvatarEquipResult {
  const item = byId(itemId);
  if (!item) return { ok: false, avatar: state, message: "아이템을 찾을 수 없어요." };
  if (!state.ownedItems.includes(item.id)) return { ok: false, avatar: state, message: "아직 가지고 있지 않아요." };
  return {
    ok: true,
    avatar: { ownedItems: [...state.ownedItems], equipped: { ...state.equipped, [item.category]: item.id } },
    message: `${item.name} 입었어요!`,
  };
}

export function buyAvatarItem(state: AvatarState, money: number, itemId: string): AvatarActionResult {
  const item = byId(itemId);
  if (!item) return { ok: false, avatar: state, money, message: "아이템을 찾을 수 없어요." };
  if (state.ownedItems.includes(item.id)) {
    const equipped = equipAvatarItem(state, item.id);
    return { ok: equipped.ok, avatar: equipped.avatar, money, message: equipped.message };
  }
  if (money < item.price) return { ok: false, avatar: state, money, message: "돈이 조금 더 필요해요!" };
  return {
    ok: true,
    avatar: {
      ownedItems: [...state.ownedItems, item.id],
      equipped: { ...state.equipped, [item.category]: item.id },
    },
    money: money - item.price,
    message: `${item.name} 구입! 바로 입었어요.`,
  };
}

export function getAvatarItem(itemId: string): AvatarItem | undefined {
  return byId(itemId);
}

export function createDefaultAvatar(): AvatarState {
  return cloneAvatar(DEFAULT_AVATAR);
}
