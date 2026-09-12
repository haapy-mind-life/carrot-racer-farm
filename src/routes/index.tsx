import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TownWorld } from "@/components/TownWorld";
import { TICKET_PRICE, useGame, won } from "@/lib/game-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "박현준 게임 — 현준 마을" },
      { name: "description", content: "현준이가 직접 걸어서 집, 스타일 숍, 레이싱장, 식물하우스를 오가는 작은 마을." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { state, ready, buyTicket } = useGame();
  const progress = Math.min(100, Math.round((state.money / TICKET_PRICE) * 100));

  return (
    <main className="game-surface min-h-screen bg-[radial-gradient(circle_at_20%_-10%,var(--color-sky),transparent_55%)] px-3 py-5 sm:px-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-card/90 px-5 py-3 shadow-sm">
          <div>
            <p className="text-sm text-muted-foreground">오늘도 신나는 하루</p>
            <h1 className="text-3xl text-foreground">현준 마을</h1>
          </div>
          <div className="rounded-full bg-secondary px-5 py-2 text-xl">내 돈 {ready ? won(state.money) : "…"}</div>
        </header>

        <TownWorld
          equipped={state.avatar.equipped}
          onNavigate={(to) => void navigate({ to })}
        />

        <section className="rounded-3xl border border-border bg-card/95 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>티켓까지 {won(TICKET_PRICE)}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          {state.hasTicket ? (
            <p className="mt-2 text-center text-base">티켓 준비 완료! 마을에서 더 놀아봐.</p>
          ) : (
            <button type="button" onClick={buyTicket} disabled={state.money < TICKET_PRICE} className="mt-3 w-full rounded-full bg-accent px-4 py-2 text-lg text-accent-foreground disabled:opacity-45">
              티켓 사기
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
