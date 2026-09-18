import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGame } from "@/lib/game-state";
import {
  WORLD_ENTITIES,
  interactionForEntity,
  movePlayer,
  nearbyEntity,
  type Point,
} from "@/world/world-exploration";
import { Building, Mascot } from "./Art";
import { Shell } from "./Shell";

const gateArt = {
  house: <Building kind="home" />,
  runner: <Building kind="run" />,
  farm: <Building kind="farm" />,
} as const;

export function Village() {
  const { state, dispatch, getState } = useGame();
  const nav = useNavigate();
  const [pos, setPos] = useState<Point>({ x: 50, y: 73 });
  const [message, setMessage] = useState(
    "A / D로 걸어봐. 친구와 동물 가까이에 가면 할 일이 보여!",
  );
  const nearby = useMemo(() => nearbyEntity(pos), [pos]);
  const interaction = useMemo(
    () => (nearby ? interactionForEntity(nearby, state) : null),
    [nearby, state],
  );

  const move = useCallback((x: number, y: number) => {
    setPos((current) => movePlayer(current, { x, y }, 4));
  }, []);

  const interact = useCallback(() => {
    if (!nearby) return;
    const current = interactionForEntity(nearby, getState());
    if ("navigate" in current) {
      void nav({ to: current.navigate });
      return;
    }
    if ("action" in current) {
      const next = dispatch(current.action);
      if (nearby.id === "toto") {
        setMessage(
          next.friendship.toto >= 3
            ? "토토: 쉿! 공원 뒤 수상한 문에 비밀이 있대. 같이 보물찾기 하자!"
            : "토토와 신나게 뛰어놀았어! 친해지면 비밀 놀이도 알려준대.",
        );
      } else if (nearby.id === "lulu") {
        setMessage(
          next.friendship.lulu >= 3
            ? "루루: 보리랑 같이 산책하자! 동물 마당도 곧 열릴 거야."
            : "루루와 같이 놀았어! 루루는 동물을 정말 좋아해.",
        );
      } else {
        setMessage("보리: 멍멍! 꼬리를 흔들며 현준이를 따라다닐 준비를 해.");
      }
      return;
    }
    setMessage(current.message);
  }, [dispatch, getState, nav, nearby]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["a", "d", "w", "s", "e"].includes(key)) event.preventDefault();
      if (key === "a") move(-1, 0);
      if (key === "d") move(1, 0);
      if (key === "w") move(0, -1);
      if (key === "s") move(0, 1);
      if (key === "e") interact();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interact, move]);

  return (
    <Shell
      active="home"
      title="박현준 월드"
      subtitle="버튼을 고르는 대신 직접 걸어가서 친구와 놀고, 동물을 돌보고, 새로운 길을 찾아봐!"
    >
      <section className="hj-world" aria-label="박현준 월드">
        <div className="hj-world-sky">
          ☁️ <span>☀️</span> ☁️
        </div>
        <div className="hj-world-hill left" />
        <div className="hj-world-hill right" />
        <div className="hj-world-road main" />
        <div className="hj-world-road park" />
        <div className="hj-mini-park">
          <b>MINI PARK</b>
          <span>🛝</span>
          <span>⚽</span>
          <span>🌳</span>
        </div>
        <div className="hj-pond">💧 🐸</div>

        {WORLD_ENTITIES.map((entity) => (
          <div
            key={entity.id}
            className={`hj-world-entity ${entity.kind} ${
              nearby?.id === entity.id ? "near" : ""
            }`}
            style={{ left: `${entity.x}%`, top: `${entity.y}%` }}
          >
            {entity.kind === "gate" && entity.id in gateArt ? (
              gateArt[entity.id as keyof typeof gateArt]
            ) : (
              <span className="hj-world-emoji">{entity.emoji}</span>
            )}
            <b>{entity.name}</b>
            {entity.id === "toto" && (
              <small>
                {"♥".repeat(state.friendship.toto)}
                {"♡".repeat(3 - state.friendship.toto)}
              </small>
            )}
            {entity.id === "lulu" && (
              <small>
                {"♥".repeat(state.friendship.lulu)}
                {"♡".repeat(3 - state.friendship.lulu)}
              </small>
            )}
            {entity.id === "bori" && (
              <small>
                배부름 {"●".repeat(state.animals.bori.fullness)}
                {"○".repeat(3 - state.animals.bori.fullness)}
              </small>
            )}
          </div>
        ))}

        <div className="hj-player" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
          <Mascot outfit={state.outfit} small />
          <b>현준</b>
        </div>

        {interaction && (
          <button className="hj-interaction" onClick={interact}>
            {interaction.label}
          </button>
        )}

        <div className="hj-world-secret-note">🚧 아직 열리지 않은 길</div>
      </section>

      <p className="hj-world-message" role="status">
        {message}
      </p>

      <div className="hj-world-controls" aria-label="이동 조작">
        <button onClick={() => move(-1, 0)} aria-label="왼쪽">
          A<br />
          <span>←</span>
        </button>
        <div>
          <button onClick={() => move(0, -1)} aria-label="위">
            W<br />
            <span>↑</span>
          </button>
          <button onClick={() => move(0, 1)} aria-label="아래">
            S<br />
            <span>↓</span>
          </button>
        </div>
        <button onClick={() => move(1, 0)} aria-label="오른쪽">
          D<br />
          <span>→</span>
        </button>
        <button className="action" disabled={!interaction} onClick={interact}>
          E<br />
          <span>행동</span>
        </button>
      </div>
    </Shell>
  );
}
