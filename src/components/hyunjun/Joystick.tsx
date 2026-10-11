import { useCallback, useEffect, useRef, useState } from "react";
type Point = { x: number; y: number };
/** The active finger owns movement; a second finger can press an action button. */
export function Joystick({
  onMove,
  disabled = false,
}: {
  onMove: (p: Point) => void;
  disabled?: boolean;
}) {
  const [knob, setKnob] = useState<Point>({ x: 0, y: 0 });
  const active = useRef<{ id: string; x: number; y: number; radius: number } | null>(null);
  const reset = useCallback(() => {
    active.current = null;
    onMove({ x: 0, y: 0 });
    setKnob({ x: 0, y: 0 });
  }, [onMove]);
  const move = useCallback(
    (x: number, y: number) => {
      const a = active.current;
      if (!a) return;
      const dx = x - a.x,
        dy = y - a.y,
        length = Math.hypot(dx, dy),
        scale = Math.max(a.radius, length);
      const value = length < 8 ? { x: 0, y: 0 } : { x: dx / scale, y: dy / scale };
      onMove(value);
      setKnob({ x: value.x * a.radius, y: value.y * a.radius });
    },
    [onMove],
  );
  useEffect(() => {
    const pointerMove = (e: PointerEvent) => {
      if (active.current?.id === `p${e.pointerId}`) {
        e.preventDefault();
        move(e.clientX, e.clientY);
      }
    };
    const pointerEnd = (e: PointerEvent) => {
      if (active.current?.id === `p${e.pointerId}`) reset();
    };
    const touchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches))
        if (active.current?.id === `t${t.identifier}`) {
          e.preventDefault();
          move(t.clientX, t.clientY);
        }
    };
    const touchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches))
        if (active.current?.id === `t${t.identifier}`) reset();
    };
    const hidden = () => {
      if (document.hidden) reset();
    };
    window.addEventListener("pointermove", pointerMove, { passive: false });
    window.addEventListener("pointerup", pointerEnd);
    window.addEventListener("pointercancel", pointerEnd);
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("touchend", touchEnd);
    window.addEventListener("touchcancel", touchEnd);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      onMove({ x: 0, y: 0 });
      active.current = null;
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerEnd);
      window.removeEventListener("pointercancel", pointerEnd);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchcancel", touchEnd);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [move, onMove, reset]);
  useEffect(() => {
    if (disabled) reset();
  }, [disabled, reset]);
  function begin(el: HTMLDivElement, id: string, x: number, y: number) {
    if (disabled || active.current) return;
    const r = el.getBoundingClientRect();
    active.current = { id, x: r.x + r.width / 2, y: r.y + r.height / 2, radius: r.width * 0.3 };
    move(x, y);
  }
  return (
    <div className="adv-joystick-group">
      <div
        className="adv-joystick"
        role="group"
        aria-label="이동 조이스틱"
        aria-disabled={disabled}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          e.preventDefault();
          begin(e.currentTarget, `p${e.pointerId}`, e.clientX, e.clientY);
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* Global events handle release outside the stick. */
          }
        }}
        onTouchStart={(e) => {
          if (typeof window.PointerEvent !== "undefined") return;
          const t = e.changedTouches[0];
          if (t) {
            e.preventDefault();
            begin(e.currentTarget, `t${t.identifier}`, t.clientX, t.clientY);
          }
        }}
        onLostPointerCapture={(e) => {
          if (active.current?.id === `p${e.pointerId}`) reset();
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className="adv-stick-arrows" aria-hidden="true">
          ↑<br />
          ← →
          <br />↓
        </span>
        <span
          className="adv-stick-knob"
          style={{ transform: `translate(${knob.x}px,${knob.y}px)` }}
          aria-hidden="true"
        />
      </div>
      <small>밀어서 이동 · 떼면 멈춤</small>
    </div>
  );
}
