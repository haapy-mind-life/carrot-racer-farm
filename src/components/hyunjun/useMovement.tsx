import { useEffect, useRef } from "react";
export function useMovement(enabled: boolean, action: () => void) {
  const keys = useRef(new Set<string>());
  const actionRef = useRef(action);
  actionRef.current = action;
  useEffect(() => {
    keys.current.clear();
    if (!enabled) return;
    const down = (e: KeyboardEvent) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target?.closest("input,textarea,select,[contenteditable=true]")) return;
      const k = e.key.toLowerCase();
      if (k === " " && target?.closest("button,a")) return;
      if (
        ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "e", " "].includes(
          k,
        )
      )
        e.preventDefault();
      keys.current.add(k);
      if ((k === "e" || k === " ") && !e.repeat) actionRef.current();
    };
    const up = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase());
    };
    const reset = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      reset();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [enabled]);
  const direction = () => ({
    x:
      Number(keys.current.has("d") || keys.current.has("arrowright")) -
      Number(keys.current.has("a") || keys.current.has("arrowleft")),
    y:
      Number(keys.current.has("s") || keys.current.has("arrowdown")) -
      Number(keys.current.has("w") || keys.current.has("arrowup")),
  });
  const hold = (key: string) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      keys.current.add(key);
    },
    onPointerUp: () => {
      keys.current.delete(key);
    },
    onPointerCancel: () => {
      keys.current.delete(key);
    },
    onLostPointerCapture: () => {
      keys.current.delete(key);
    },
  });
  return { direction, hold };
}
