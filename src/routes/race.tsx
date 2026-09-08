import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AvatarCharacter } from "@/components/AvatarCharacter";
import { HomeButton } from "@/components/HomeButton";
import type { AvatarState } from "@/lib/avatar-system";
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
import { getRaceScene } from "@/lib/race-scene";

export const Route = createFileRoute("/race")({
  head: () => ({
    meta: [
      { title: "박현준 게임 — 레이싱" },
      {
        name: "description",
        content: "꾸민 캐릭터로 화면을 탭하며 네 개의 스테이지를 달리고 사다리와 크레인을 움직이는 레이싱 게임.",
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
  invincible: { emoji: "🌟", label: "무적 변신" },
  flying: { emoji: "🪽", label: "날기 변신" },
};

function StageScene({
  stageId,
  step,
  power,
  equipped,
}: {
  stageId: 1 | 2 | 3 | 4;
  step: number;
  power: RacePower;
  equipped: AvatarState["equipped"];
}) {
  const scene = getRaceScene(stageId, step, power);

  return (
    <div className="relative h-52 w-full overflow-hidden rounded-3xl border-2 border-border bg-[linear-gradient(to_bottom,var(--color-sky),var(--color-card))] shadow-inner">
      {scene.kind === "field" && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-secondary" />
          <div className="absolute bottom-7 left-[12%] text-4xl">🥕</div>
          <div className="absolute bottom-5 left-[44%] text-4xl">🥕</div>
          <div className="absolute bottom-8 right-[12%] text-4xl">🪙</div>
        </>
      )}

      {scene.kind === "ladder" && (
        <>
          <div className="absolute bottom-3 left-1/2 h-44 w-20 -translate-x-1/2 rounded-lg border-x-8 border-amber-700 bg-[repeating-linear-gradient(to_bottom,transparent_0px,transparent_14px,#a16207_14px,#a16207_20px)]" />
          <div className="absolute left-1/2 top-3 -translate-x-1/2 text-5xl">🪙</div>
        </>
      )}

      {scene.kind === "crane" && (
        <>
          <div className="absolute left-5 top-4 text-6xl">🏗️</div>
          <div
            className="absolute top-0 w-1 bg-foreground/40 transition-all duration-300"
            style={{ left: `${scene.hookX}%`, height: `${scene.hookY}%` }}
          />
          <div
            className="absolute text-4xl transition-all duration-300"
            style={{ left: `calc(${scene.hookX}% - 18px)`, top: `${scene.hookY}%` }}
          >
            🪝
          </div>
          {scene.cargoEmoji && (
            <div
              className="absolute text-5xl transition-all duration-300"
              style={{ left: `calc(${scene.hookX}% - 22px)`, top: `calc(${scene.hookY}% + 28px)` }}
            >
              {scene.cargoEmoji}
            </div>
          )}
          <div className="absolute bottom-4 right-5 text-4xl">🪙</div>
        </>
      )}

      {scene.kind === "sky" && (
        <>
          <div className="absolute left-[8%] top-[24%] text-5xl">☁️</div>
          <div className="absolute right-[8%] top-[15%] text-5xl">☁️</div>
          <div className="absolute left-[55%] bottom-[8%] text-5xl">☁️</div>
          <div className="absolute right-[26%] top-[46%] text-4xl">🪙</div>
        </>
      )}

      <div
        className="absolute transition-all duration-300 ease-out"
        style={{
          left: `calc(${scene.runnerX}% - 32px)`,
          top: `calc(${scene.runnerY}% - 38px)`,
          transform: power === "invincible" ? "scale(1.08) rotate(-3deg)" : "scale(1)",
        }}
      >
        <AvatarCharacter equipped={equipped} size="sm" power={power} />
      </div>

      <div className="absolute inset-x-3 bottom-2 rounded-full bg-card/90 px-3 py-1 text-base shadow-sm">
        {scene.caption}
      </div>
    </div>
  );
}

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
          <p className="text-lg text-muted-foreground">화면 하나만 눌러서 놀아요</p>
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
          className="min-h-[500px] w-full rounded-4xl border-2 border-border bg-card p-5 text-center shadow-lg transition-transform enabled:active:scale-[0.99] disabled:cursor-default"
          aria-label={race.finished ? "레이스 완주" : "레이스 화면 탭하기"}
        >
          <div className="mx-auto flex min-h-[450px] flex-col items-center justify-between gap-4">
            <StageScene
              stageId={stage.id}
              step={race.step}
              power={race.power}
              equipped={game.avatar.equipped}
            />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="rounded-full bg-secondary px-4 py-2 text-lg">
                {powerView[race.power].emoji} {powerView[race.power].label}
              </span>
              {race.power !== "normal" && (
                <span className="rounded-full bg-muted px-4 py-2 text-base">
                  남은 변신 {race.powerSteps}번
                </span>
              )}
            </div>

            <div className="rounded-3xl bg-muted/70 px-5 py-3">
              <p className="text-xl">{race.message}</p>
            </div>

            {race.finished ? (
              <div>
                <div className="text-6xl" aria-hidden="true">🏁🎉</div>
                <p className="mt-2 text-3xl">완주 성공!</p>
                <p className="mt-1 text-lg text-muted-foreground">{won(race.money)}을 집에 가져갑니다.</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">다음</p>
                <div className="mt-1 text-5xl" aria-hidden="true">{eventView[upcoming!].emoji}</div>
                <p className="text-lg">{eventView[upcoming!].label}</p>
                <p className="mt-2 rounded-full bg-accent px-8 py-3 text-2xl text-accent-foreground">
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
