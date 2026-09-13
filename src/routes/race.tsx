import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { HomeButton } from "@/components/HomeButton";
import { useGame, won } from "@/lib/game-state";

export const Route = createFileRoute("/race")({
  head: () => ({
    meta: [
      { title: "박현준 게임 — 레이싱" },
      { name: "description", content: "장애물을 피하고 코인을 먹어 돈을 버는 레이싱." },
      { property: "og:title", content: "박현준 게임 — 레이싱" },
      { property: "og:description", content: "장애물을 피하고 코인을 먹어 돈을 버는 레이싱." },
    ],
  }),
  component: Race,
});

const LANES = 3;
const ROWS = 12;

type Cell = { type: "coin" | "rock" | null };

type Phase = "idle" | "run" | "done";

function Race() {
  const { recordRun } = useGame();
  const [phase, setPhase] = useState<Phase>("idle");
  const [lane, setLane] = useState(1);
  const [row, setRow] = useState(ROWS - 1);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [earned, setEarned] = useState(0);

  const stateRef = useRef({ lane, row, grid, phase });
  stateRef.current = { lane, row, grid, phase };

  const start = useCallback(() => {
    const cells: Cell[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: LANES }, () => ({ type: null })),
    );
    for (let r = 0; r < ROWS - 2; r++) {
      const rockLane = Math.floor(Math.random() * LANES);
      cells[r][rockLane] = { type: "rock" };
      for (let l = 0; l < LANES; l++) {
        if (l !== rockLane && Math.random() < 0.5) cells[r][l] = { type: "coin" };
      }
    }
    setGrid(cells);
    setLane(1);
    setRow(ROWS - 1);
    setEarned(0);
    setPhase("run");
  }, []);

  const move = useCallback((dir: -1 | 1) => {
    setLane((l) => Math.min(LANES - 1, Math.max(0, l + dir)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") move(-1);
      if (e.key === "ArrowRight" || e.key === "d") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  useEffect(() => {
    if (phase !== "run") return;
    const timer = window.setInterval(() => {
      const s = stateRef.current;
      if (s.phase !== "run") return;
      const nextRow = s.row - 1;
      if (nextRow < 0) {
        setPhase("done");
        return;
      }
      const cell = s.grid[nextRow]?.[s.lane];
      if (cell?.type === "rock") {
        setRow(nextRow);
        setPhase("done");
        return;
      }
      if (cell?.type === "coin") {
        setEarned((v) => v + 10);
      }
      setRow(nextRow);
    }, 700);
    return () => window.clearInterval(timer);
  }, [phase]);

  const finished = phase === "done";
  const paidRef = useRef(false);
  useEffect(() => {
    if (finished && !paidRef.current) {
      paidRef.current = true;
      if (earned > 0) recordRun(earned);
    }
    if (!finished) paidRef.current = false;
  }, [finished, earned, recordRun]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_80%_-10%,var(--color-secondary),transparent_55%)] px-4 py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <HomeButton />
          <p className="rounded-full bg-card px-4 py-1 text-lg shadow-sm">
            🪙 {won(earned)}
          </p>
        </div>

        <h1 className="text-center text-4xl">🏃 레이싱</h1>
        <p className="text-center text-muted-foreground">
          좌우로 움직여 바위를 피하고 코인을 먹어요. 끝까지 가면 코인이 돈이 됩니다!
        </p>

        <div className="mx-auto grid w-full max-w-xs gap-2 rounded-4xl border-2 border-border bg-card p-4 shadow-sm">
          {grid.map((rowCells, r) => (
            <div key={r} className="grid grid-cols-3 gap-2">
              {rowCells.map((cell, l) => {
                const isPlayer = r === row && l === lane;
                return (
                  <div
                    key={l}
                    className={`flex h-11 items-center justify-center rounded-2xl text-2xl ${
                      isPlayer ? "bg-secondary" : "bg-muted"
                    }`}
                  >
                    {isPlayer ? "🏃" : cell.type === "rock" ? "🪨" : cell.type === "coin" ? "🪙" : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {phase === "run" && (
          <div className="mx-auto flex gap-4">
            <button
              onClick={() => move(-1)}
              aria-label="왼쪽으로"
              className="h-16 w-16 rounded-full border-2 border-border bg-card text-3xl shadow-sm active:translate-y-0.5"
            >
              ⬅️
            </button>
            <button
              onClick={() => move(1)}
              aria-label="오른쪽으로"
              className="h-16 w-16 rounded-full border-2 border-border bg-card text-3xl shadow-sm active:translate-y-0.5"
            >
              ➡️
            </button>
          </div>
        )}

        {phase === "idle" && (
          <button
            onClick={start}
            className="mx-auto rounded-full bg-primary px-10 py-4 text-2xl text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            출발! 🚩
          </button>
        )}

        {finished && (
          <div className="mx-auto flex flex-col items-center gap-4 rounded-4xl border-2 border-border bg-card p-6 text-center shadow-sm">
            <p className="text-3xl">
              {earned > 0 ? `🪙 ${won(earned)} 벌었어요!` : "앗, 바위에 부딪혔어요!"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={start}
                className="rounded-full bg-primary px-8 py-3 text-xl text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                다시 달리기
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
