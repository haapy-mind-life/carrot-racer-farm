import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AvatarCharacter } from "@/components/AvatarCharacter";
import { HomeButton } from "@/components/HomeButton";
import { AVATAR_ITEMS, type AvatarCategory } from "@/lib/avatar-system";
import { useGame, won } from "@/lib/game-state";

export const Route = createFileRoute("/avatar")({
  head: () => ({
    meta: [
      { title: "박현준 게임 — 내 캐릭터" },
      {
        name: "description",
        content: "레이싱과 식물하우스에서 번 돈으로 머리, 옷, 바지, 신발을 꾸미는 캐릭터 방.",
      },
    ],
  }),
  component: AvatarRoom,
});

const categories: { id: AvatarCategory; label: string; emoji: string }[] = [
  { id: "hair", label: "머리", emoji: "💇" },
  { id: "top", label: "상의", emoji: "👕" },
  { id: "bottom", label: "하의", emoji: "👖" },
  { id: "shoes", label: "신발", emoji: "👟" },
];

function AvatarRoom() {
  const { state, ready, buyAvatarItem, equipAvatarItem } = useGame();
  const [category, setCategory] = useState<AvatarCategory>("hair");
  const [message, setMessage] = useState("머리부터 골라볼까요?");
  const items = AVATAR_ITEMS.filter((item) => item.category === category);

  const chooseItem = (item: (typeof AVATAR_ITEMS)[number]) => {
    const owned = state.avatar.ownedItems.includes(item.id);
    if (owned) {
      equipAvatarItem(item.id);
      setMessage(`${item.name} 입었어요!`);
      return;
    }
    if (state.money < item.price) {
      setMessage("돈이 조금 더 필요해요!");
      return;
    }
    buyAvatarItem(item.id);
    setMessage(`${item.name} 구입! 바로 입었어요.`);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,var(--color-sky),transparent_58%)] px-4 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <HomeButton />
          <div className="rounded-full bg-card px-5 py-2 text-lg shadow-sm">
            내 돈 {ready ? won(state.money) : "…"}
          </div>
        </div>

        <header className="text-center">
          <p className="text-lg text-muted-foreground">번 돈으로 마음껏 꾸며요</p>
          <h1 className="text-4xl text-foreground">🪞 내 캐릭터</h1>
        </header>

        <section className="grid gap-5 md:grid-cols-[0.9fr_1.4fr]">
          <div className="rounded-4xl border-2 border-border bg-card p-5 text-center shadow-sm">
            <p className="text-lg text-muted-foreground">지금 모습</p>
            <div className="mt-2 flex min-h-72 items-center justify-center rounded-3xl bg-secondary/60">
              <AvatarCharacter equipped={state.avatar.equipped} size="lg" />
            </div>
            <p className="mt-4 rounded-3xl bg-muted/70 px-4 py-3 text-lg">{message}</p>
          </div>

          <div className="rounded-4xl border-2 border-border bg-card p-5 shadow-sm">
            <div className="grid grid-cols-4 gap-2">
              {categories.map((entry) => (
                <button
                  type="button"
                  key={entry.id}
                  onClick={() => setCategory(entry.id)}
                  className={`rounded-2xl border px-2 py-3 text-center ${category === entry.id ? "bg-secondary" : "bg-card"}`}
                >
                  <span className="block text-2xl" aria-hidden="true">{entry.emoji}</span>
                  <span>{entry.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => {
                const owned = state.avatar.ownedItems.includes(item.id);
                const equipped = state.avatar.equipped[item.category] === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => chooseItem(item)}
                    className={`rounded-3xl border-2 p-4 text-center transition-transform active:scale-[0.98] ${equipped ? "border-primary bg-secondary" : "border-border bg-muted/40"}`}
                    aria-pressed={equipped}
                  >
                    <span className="block text-5xl" aria-hidden="true">{item.visual}</span>
                    <span className="mt-2 block text-lg">{item.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {equipped
                        ? "입는 중"
                        : owned
                          ? "가지고 있어요"
                          : item.price === 0
                            ? "무료"
                            : won(item.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
