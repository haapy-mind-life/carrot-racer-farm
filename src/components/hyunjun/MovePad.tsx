import type { useMovement } from "./useMovement";
export function MovePad({ hold }: { hold: ReturnType<typeof useMovement>["hold"] }) {
  return (
    <div className="adv-pad" role="group" aria-label="화면 방향키 · 꾹 누르면 이동">
      <button {...hold("w")} aria-label="위로 이동">
        ↑<small>위</small>
      </button>
      <button {...hold("a")} aria-label="왼쪽 이동">
        ←<small>왼쪽</small>
      </button>
      <button {...hold("s")} aria-label="아래로 이동">
        ↓<small>아래</small>
      </button>
      <button {...hold("d")} aria-label="오른쪽 이동">
        →<small>오른쪽</small>
      </button>
    </div>
  );
}
