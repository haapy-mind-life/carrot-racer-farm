import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AvatarCharacter } from "@/components/AvatarCharacter";
import type { AvatarState } from "@/lib/avatar-system";
import {
  TOWN_DESTINATIONS,
  clampTownPoint,
  movementDurationMs,
  townDistance,
  type TownPoint,
} from "@/lib/town-world";

type TownWorldProps = {
  equipped: AvatarState["equipped"];
  onNavigate: (route: "/avatar" | "/race" | "/greenhouse") => void;
};

const START: TownPoint = { x: 44, y: 59 };

export function TownWorld({ equipped, onNavigate }: TownWorldProps) {
  const [position, setPosition] = useState<TownPoint>(START);
  const [walking, setWalking] = useState(false);
  const [moveDuration, setMoveDuration] = useState(180);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const clearPending = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => clearPending, []);

  const moveTo = (target: TownPoint, route?: "/avatar" | "/race" | "/greenhouse") => {
    clearPending();
    const next = clampTownPoint(target);
    const duration = movementDurationMs(townDistance(position, next));
    setMoveDuration(duration);
    setWalking(true);
    setPosition(next);
    timerRef.current = setTimeout(() => {
      setWalking(false);
      timerRef.current = null;
      if (route) onNavigate(route);
    }, duration);
  };

  const handleWorldTap = (event: MouseEvent<HTMLDivElement>) => {
    if (!worldRef.current || event.target !== event.currentTarget) return;
    const rect = worldRef.current.getBoundingClientRect();
    moveTo({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={worldRef}
      className="game-surface relative min-h-[560px] overflow-hidden rounded-[2.25rem] border-2 border-border bg-[linear-gradient(to_bottom,#bfe8ff_0%,#dff2c5_45%,#8cc46d_100%)] shadow-lg"
      onClick={handleWorldTap}
      onContextMenu={(event) => event.preventDefault()}
      aria-label="현준 마을"
    >
      <div className="pointer-events-none absolute inset-x-0 top-[42%] h-[20%] rotate-[-3deg] bg-[#e7d7b0] opacity-95" />
      <div className="pointer-events-none absolute left-[42%] top-0 h-full w-[17%] rotate-[4deg] bg-[#e7d7b0] opacity-95" />

      <button type="button" onClick={(event) => { event.stopPropagation(); moveTo(TOWN_DESTINATIONS[0].entrance); }} className="absolute left-[5%] top-[8%] w-[27%] rounded-3xl border-2 border-[#8d674c] bg-[#f7dfb5] p-3 text-center shadow-md">
        <div className="mx-auto h-20 w-24 rounded-t-[2rem] bg-[#f3b070] shadow-inner"><div className="mx-auto mt-9 h-11 w-9 rounded-t-xl bg-[#8b5b44]" /></div>
        <span className="mt-2 block text-lg">우리 집</span>
      </button>

      <button type="button" onClick={(event) => { event.stopPropagation(); moveTo(TOWN_DESTINATIONS[1].entrance, "/avatar"); }} className="absolute right-[5%] top-[8%] w-[28%] rounded-3xl border-2 border-[#7c6599] bg-[#f3dcff] p-3 text-center shadow-md">
        <div className="mx-auto flex h-20 w-24 items-center justify-center rounded-2xl bg-[#9a75c2] text-3xl text-white">★</div>
        <span className="mt-2 block text-lg">스타일 숍</span>
      </button>

      <button type="button" onClick={(event) => { event.stopPropagation(); moveTo(TOWN_DESTINATIONS[2].entrance, "/race"); }} className="absolute bottom-[5%] right-[4%] w-[29%] rounded-3xl border-2 border-[#725649] bg-[#f5c46e] p-3 text-center shadow-md">
        <div className="mx-auto h-16 w-24 rounded-t-full border-[8px] border-[#d45b4d] border-b-0 bg-transparent" />
        <span className="mt-2 block text-lg">레이싱장</span>
      </button>

      <button type="button" onClick={(event) => { event.stopPropagation(); moveTo(TOWN_DESTINATIONS[3].entrance, "/greenhouse"); }} className="absolute bottom-[5%] left-[4%] w-[29%] rounded-3xl border-2 border-[#62835c] bg-[#dff0ca] p-3 text-center shadow-md">
        <div className="mx-auto h-16 w-24 rounded-t-[2rem] border-4 border-[#8ab88a] bg-[#d9f1ef]/80" />
        <span className="mt-2 block text-lg">식물하우스</span>
      </button>

      <div className="pointer-events-none absolute left-[8%] top-[44%] text-3xl">🌳</div>
      <div className="pointer-events-none absolute right-[9%] top-[46%] text-3xl">🌳</div>
      <div className="pointer-events-none absolute left-[14%] bottom-[32%] text-2xl">🌼</div>
      <div className="pointer-events-none absolute right-[18%] bottom-[30%] text-2xl">🌼</div>

      <div
        className={`town-avatar pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-[left,top] ease-linear ${walking ? "town-avatar--walking" : ""}`}
        style={{ left: `${position.x}%`, top: `${position.y}%`, transitionDuration: `${moveDuration}ms` }}
      >
        <AvatarCharacter equipped={equipped} size="md" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[48%] text-center text-sm text-foreground/70">길이나 가고 싶은 곳을 눌러봐!</div>
    </div>
  );
}
