import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HomeButton } from "@/components/HomeButton";
import { useGame, won } from "@/lib/game-state";
import {
  RACE_FINISH_SCORE,
  advanceRace,
  createRaceState,
  getRaceEvent,
  getRaceStage,
  type RacePower,
  type TrackEvent,
} from "@/lib/race-engine";

export const Route = createFileRoute("/race")({
  head: () => ({
    meta: [
      { title: "박현준 게임 — 레이싱" },
      {
        name: "description",
        content: "화면을 탭해서 네 개의 스테이지를 달리고 무적과 날기 아이템으로 변신하는 레이싱 게임.",
      },
    ],
  }),
  component: RacePage,
});

const eventView: Record<TrackEvent, { emoji: string; label: string }> = {
  coin: { emoji: "🪙", label: "코인" },
  obstacle: { emoji: "🪨", label: "장애물" },
  "invincible-item": { emoji: "⭐", label: "무적 아이템" },
  "flying-item": { emoji: "🪽", label: "날기 아이템" },
};

const powerView: Record<RacePower, { emoji: string; label: string }> = {
  normal: { emoji: "🏃", label: "달리는 중" },
  invincible: { emoji: "🌟🏃", label: "무적 변신" },
  flying: { emoji: "🪽🏃", label: "날기 변신" },
};

function RacePage() {
  const { state: game, ready, recordRun } = useGame();
  const [race, setRace] = useState(createRaceState);
  const stage = getRaceStage(race.score);
  const progress = Math.min(100, Math.round((race.score / RACE_FINISH_SCORE) * 100));
  const upcoming = race.finished ? null : getRaceEvent(race.step + 1);

  const handleTap = () => {
    if (race.finished) return;
    const next = advanceRace(race);
    setRace(next);
    if (next.finished && !race.finished) recordRun(next.money);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,var(--color-sky),transparent_55%)] px-4 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <HomeButton />
          <div className="rounded-full bg-card px-5 py-2 text-lg shadow-sm">
            내 돈 {ready ? won(game.money) : "…"}
          </div>
        </div>

        <header className="text-center">
          <p className="text-lg text-muted-foreground">화면 하나만 눌러서 달려요</p>
          <h1 className="text-4xl text-foreground">{stage.emoji} {stage.name}</h1>
        </header>

        <section className="rounded-4xl border-2 border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 text-lg">
            <span>점수 {race.score} / {RACE_FINISH_SCORE}</span>
            <span>이번 판 {won(race.money)}</span>
          </div>
          <div className="mt-3 h-5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        <button
          type="button"
          onClick={handleTap}
          disabled={race.finished}
          className="min-h-[430px] w-full rounded-4xl border-2 border-border bg-card p-6 text-center shadow-lg transition-transform enabled:active:scale-[0.99] disabled:cursor-default"
          aria-label={race.finished ? "레이스 완주" : "레이스 화면 탭하기"}
        >
          <div className="mx-auto flex h-full min-h-[380px] flex-col items-center justify-between gap-6">
            <div>
              <p className="text-lg text-muted-foreground">현재 상태</p>
              <div className="mt-2 text-7xl" aria-hidden="true">{powerView[race.power].emoji}</div>
              <p className="mt-2 text-2xl">{powerView[race.power].label}</p>
              {race.power !== "normal" && (
                <p className="text-base text-muted-foreground">남은 변신 {race.powerSteps}번</p>
              )}
            </div>

            <div className="rounded-3xl bg-muted/70 px-5 py-4">
              <p className="text-2xl">{race.message}</p>
            </div>

            {race.finished ? (
              <div>
                <div className="text-6xl" aria-hidden="true">🏁🎉</div>
                <p className="mt-2 text-3xl">완주 성공!</p>
                <p className="mt-1 text-lg text-muted-foreground">{won(race.money)}을 집에 가져갑니다.</p>
              </div>
            ) : (
              <div>
                <p className="text-base text-muted-foreground">다음에 만나요</p>
                <div className="mt-1 text-6xl" aria-hidden="true">{eventView[upcoming!].emoji}</div>
                <p className="text-xl">{eventView[upcoming!].label}</p>
                <p className="mt-4 rounded-full bg-accent px-8 py-3 text-2xl text-accent-foreground">
                  화면을 탭!
                </p>
              </div>
            )}
          </div>
        </button>

        {race.finished && (
          <button
            type="button"
            onClick={() => setRace(createRaceState())}
            className="w-full rounded-full bg-accent px-6 py-4 text-2xl text-accent-foreground shadow-sm"
          >
            🔁 한 번 더 달리기
          </button>
        )}

        <section className="grid grid-cols-4 gap-2 text-center text-sm sm:text-base">
          {[
            ["🥕", "당근 들판"],
            ["🪜", "사다리 언덕"],
            ["🏗️", "크레인"],
            ["☁️", "하늘 정원"],
          ].map(([emoji, name], index) => (
            <div
              key={name}
              className={`rounded-2xl border p-2 ${stage.id === index + 1 ? "bg-secondary" : "bg-card"}`}
            >
              <div className="text-2xl">{emoji}</div>
              <div>{name}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
