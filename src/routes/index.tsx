import { createFileRoute, Link } from "@tanstack/react-router";
import { AvatarCharacter } from "@/components/AvatarCharacter";
import { TICKET_PRICE, useGame, won } from "@/lib/game-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "박현준 게임 — 집" },
      {
        name: "description",
        content: "달리기와 식물하우스로 돈을 벌고 내 캐릭터를 꾸미는 아늑한 게임의 집 화면.",
      },
      { property: "og:title", content: "박현준 게임 — 집" },
      {
        property: "og:description",
        content: "달리고 키우고 꾸미면서 나만의 캐릭터를 만들어보세요.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { state, ready, buyTicket } = useGame();
  const progress = Math.min(100, Math.round((state.money / TICKET_PRICE) * 100));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_-10%,var(--color-sky),transparent_55%)] px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="text-center">
          <p className="text-lg text-muted-foreground">아늑한 하루</p>
          <h1 className="text-5xl text-foreground">박현준 게임</h1>
        </header>

        <section className="rounded-4xl border-2 border-border bg-card p-6 shadow-sm">
          <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto]">
            <div className="text-center sm:text-left">
              <p className="text-lg text-muted-foreground">내 돈</p>
              <p className="text-5xl text-primary">{ready ? won(state.money) : "…"}</p>
            </div>
            <Link
              to="/avatar"
              className="mx-auto flex items-center gap-3 rounded-3xl bg-secondary px-4 py-3 text-left transition-transform hover:-translate-y-0.5"
            >
              <AvatarCharacter equipped={state.avatar.equipped} size="sm" />
              <span>
                <strong className="block text-lg">내 캐릭터</strong>
                <span className="text-sm text-muted-foreground">지금 모습 보기</span>
              </span>
            </Link>
          </div>

          <div className="mt-6 text-left">
            <div className="flex items-baseline justify-between text-base text-muted-foreground">
              <span>🎫 티켓까지</span>
              <span>{won(TICKET_PRICE)}</span>
            </div>
            <div className="mt-2 h-5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {state.hasTicket ? (
            <p className="mt-6 rounded-3xl bg-secondary px-4 py-4 text-center text-2xl text-secondary-foreground">
              🎉 티켓을 샀어요! 박현준을 만나러 갑니다 🎫
            </p>
          ) : (
            <button
              onClick={buyTicket}
              disabled={state.money < TICKET_PRICE}
              className="mt-6 w-full rounded-full bg-accent px-6 py-4 text-2xl text-accent-foreground shadow-sm transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-50"
            >
              🎫 티켓 사기
            </button>
          )}
        </section>

        <section className="grid gap-5 sm:grid-cols-3">
          <Link
            to="/race"
            className="rounded-4xl border-2 border-border bg-card p-6 text-center shadow-sm transition-transform hover:-translate-y-1"
          >
            <span className="block text-6xl">🏃</span>
            <h2 className="mt-3 text-3xl">레이싱</h2>
            <p className="mt-1 text-muted-foreground">달려서 코인을 모아 돈을 벌어요</p>
            <p className="mt-2 text-base text-muted-foreground">
              최고 기록 {ready ? won(state.bestRun) : "…"}
            </p>
          </Link>

          <Link
            to="/greenhouse"
            className="rounded-4xl border-2 border-border bg-card p-6 text-center shadow-sm transition-transform hover:-translate-y-1"
          >
            <span className="block text-6xl">🌿</span>
            <h2 className="mt-3 text-3xl">식물하우스</h2>
            <p className="mt-1 text-muted-foreground">씨앗을 사고 물을 줘서 키워요</p>
            <p className="mt-2 text-base text-muted-foreground">황금 작물이 나올지도? ✨</p>
          </Link>

          <Link
            to="/avatar"
            className="rounded-4xl border-2 border-border bg-card p-6 text-center shadow-sm transition-transform hover:-translate-y-1"
          >
            <span className="block text-6xl">🪞</span>
            <h2 className="mt-3 text-3xl">내 캐릭터</h2>
            <p className="mt-1 text-muted-foreground">번 돈으로 머리와 옷, 신발을 꾸며요</p>
            <p className="mt-2 text-base text-muted-foreground">내 모습으로 레이싱! ✨</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
