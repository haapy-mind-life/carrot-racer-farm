import type { useMovement } from "./useMovement";
export function MovePad({ hold }: { hold: ReturnType<typeof useMovement>["hold"] }) {
  return (
    <div className="adv-pad" aria-label="누르고 이동">
      <button {...hold("w")} aria-label="위로 이동">
        ↑
      </button>
      <button {...hold("a")} aria-label="왼쪽 이동">
        ←
      </button>
      <button {...hold("s")} aria-label="아래로 이동">
        ↓
      </button>
      <button {...hold("d")} aria-label="오른쪽 이동">
        →
      </button>
    </div>
  );
}
