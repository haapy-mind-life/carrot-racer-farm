import type { Point } from "./adventure.ts";

export type LifeRegion = "village" | "coast" | "mansion" | "deep-sea";
export const LIFE_MAPS = {
  coast: { width: 3800, height: 1800 },
  mansion: { width: 2200, height: 1500 },
  "deep-sea": { width: 4200, height: 1800 },
} as const;

export const LIFE_SPOTS = {
  villageGate: { x: 5380, y: 990 },
  coastArrival: { x: 260, y: 1000 },
  coastExit: { x: 150, y: 1000 },
  mansionDoor: { x: 1210, y: 1080 },
  mansionInside: { x: 400, y: 1080 },
  mansionExit: { x: 210, y: 1100 },
  mansionKitchen: { x: 920, y: 560 },
  mansionDining: { x: 1390, y: 970 },
  robot: { x: 1490, y: 1250 },
  foodTruck: { x: 1980, y: 900 },
  foodCustomer: { x: 2310, y: 1100 },
  harbor: { x: 3120, y: 1030 },
  seaStart: { x: 360, y: 970 },
  seaReturn: { x: 240, y: 970 },
} as const;

export const SEA_TREASURES = [
  { id: "pearl-coral", name: "진주 산호 정원", x: 1220, y: 550, reward: 20 },
  { id: "star-fish", name: "불가사리 협곡", x: 2450, y: 1170, reward: 25 },
  { id: "gold-shell", name: "황금 조개 동굴", x: 3590, y: 650, reward: 35 },
] as const;
export type SeaTreasureId = (typeof SEA_TREASURES)[number]["id"];

export const FOOD_MENU = [
  { id: "cutlet", name: "돈까스", emoji: "🍛", size: 1, price: 18 },
  { id: "kimchi", name: "김치", emoji: "🥬", size: 1, price: 12 },
  { id: "pizza", name: "피자", emoji: "🍕", size: 1, price: 25 },
  { id: "cola", name: "콜라", emoji: "🥤", size: 1, price: 8 },
  { id: "giant-pizza", name: "대왕 피자", emoji: "🍕", size: 1.6, price: 55 },
  { id: "gold-pizza", name: "초대형 황금 피자", emoji: "🌟🍕", size: 2.2, price: 150 },
  { id: "dino-burger", name: "공룡 햄버거", emoji: "🍔", size: 1.7, price: 60 },
  { id: "giant-icecream", name: "대왕 아이스크림", emoji: "🍦", size: 1.9, price: 45 },
] as const;
export type FoodId = (typeof FOOD_MENU)[number]["id"];
export function foodById(id: string) {
  return FOOD_MENU.find((food) => food.id === id);
}
export function seaTreasureById(id: string) {
  return SEA_TREASURES.find((site) => site.id === id);
}

export type FoodOrder = {
  id: string;
  foodId: FoodId;
  phase: "offered" | "prepared";
};
export function nextFoodOrder(index: number, id: string): FoodOrder {
  const food = FOOD_MENU[((index % FOOD_MENU.length) + FOOD_MENU.length) % FOOD_MENU.length]!;
  return { id, foodId: food.id, phase: "offered" };
}
export function nearSpot(position: Point, target: Point, radius = 160) {
  return Math.hypot(position.x - target.x, position.y - target.y) <= radius;
}
export function nearbyTreasure(position: Point) {
  return SEA_TREASURES.find((site) => nearSpot(position, site, 170)) ?? null;
}
export function stepLifePlayer(
  region: Exclude<LifeRegion, "village">,
  position: Point,
  direction: Point,
  dt: number,
): Point {
  const size = LIFE_MAPS[region];
  const length = Math.max(1, Math.hypot(direction.x, direction.y));
  const time = Math.min(0.05, Math.max(0, dt));
  const speed = region === "deep-sea" ? 320 : 245;
  const nextX = position.x + (direction.x * speed * time) / length;
  const nextY = position.y + (direction.y * speed * time) / length;
  const maxX = region === "coast" ? 3300 : size.width - 45;
  return {
    x: Math.min(maxX, Math.max(45, nextX)),
    y: Math.min(size.height - 45, Math.max(45, nextY)),
  };
}
export const LIFE_REGION_LABELS: Record<LifeRegion, string> = {
  village: "열 개 마을",
  coast: "대왕집 · 바닷가 · 푸드트럭",
  mansion: "현준이의 대왕집",
  "deep-sea": "잠수함으로 탐험하는 큰 바다",
};
