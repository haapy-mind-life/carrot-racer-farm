export type TownPoint = { x: number; y: number };
export type TownDestinationId = "home" | "style" | "race" | "greenhouse";

export type TownDestination = {
  id: TownDestinationId;
  label: string;
  route: "/" | "/avatar" | "/race" | "/greenhouse";
  position: TownPoint;
  entrance: TownPoint;
  interactionRadius: number;
};

export const TOWN_DESTINATIONS: TownDestination[] = [
  { id: "home", label: "우리 집", route: "/", position: { x: 18, y: 27 }, entrance: { x: 25, y: 48 }, interactionRadius: 10 },
  { id: "style", label: "스타일 숍", route: "/avatar", position: { x: 76, y: 25 }, entrance: { x: 72, y: 48 }, interactionRadius: 10 },
  { id: "race", label: "레이싱장", route: "/race", position: { x: 82, y: 70 }, entrance: { x: 70, y: 72 }, interactionRadius: 11 },
  { id: "greenhouse", label: "식물하우스", route: "/greenhouse", position: { x: 19, y: 73 }, entrance: { x: 30, y: 72 }, interactionRadius: 11 },
];

export function clampTownPoint(point: TownPoint): TownPoint {
  return {
    x: Math.max(0, Math.min(100, point.x)),
    y: Math.max(0, Math.min(100, point.y)),
  };
}

export function townDistance(from: TownPoint, to: TownPoint) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

export function movementDurationMs(distance: number) {
  return Math.round(Math.max(180, Math.min(900, 180 + distance * 11)));
}

export function getTownDestination(id: TownDestinationId) {
  return TOWN_DESTINATIONS.find((item) => item.id === id)!;
}
