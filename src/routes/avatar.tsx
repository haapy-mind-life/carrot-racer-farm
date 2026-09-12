import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AvatarCharacter } from "@/components/AvatarCharacter";
import { HomeButton } from "@/components/HomeButton";
import { AVATAR_ITEMS, type AvatarCategory, type AvatarSetId } from "@/lib/avatar-system";
import { useGame, won } from "@/lib/game-state";

export const Route = createFileRoute("/avatar")({
  head: () => ({ meta: [{ title: "박현준 게임 — 스타일 숍" }] }),
  component: AvatarRoom,
});

const categories: { id: AvatarCategory; label: string }[] = [
  { id: "hair", label: "머리" },
  { id: "top", label: "상의" },
  { id: "bottom", label: "하의" },
  { id: "shoes", label: "신발" },
];

const setLabel: Record<AvatarSetId, string> = {
  everyday: "데일리",
  sport: "스포츠",
  street: "스트리트",
  hero: "히어로",
};

function AvatarRoom() {
  const { state, ready, buyAvatarItem, equipAvatarItem } = useGame();
  const [category, setCategory] = useState<AvatarCategory>("hair");
  const [message, setMessage] = useState("마음에 드는 스타일을 골라봐!");
  const items = AVATAR_ITEMS.filter((item) => item.category === category);

  const chooseItem = (item: (typeof AVATAR_ITEMS)[number]) => {
    const owned = state.avatar.ownedItems.includes(item.id);
    if (owned) {
      equipAvatarItem(item.id);
      setMessage(`${item.name} 입었어요!`);
    } else if (state.money < item.price) {
      setMessage("돈이 조금 더 필요해요!");
    } else {
      buyAvatarItem(item.id);
      setMessage(`${item.name} 구입! 바로 입었어요.`);
    }
  };

  return (
    <main className="game-surface min-h-screen bg-[radial-gradient(circle_at_top,var(--color-sky),transparent_58%)] px-4 py-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <HomeButton />
          <div className="rounded-full bg-card px-5 py-2 text-lg shadow-sm">내 돈 {ready ? won(state.money) : "…"}</div>
        </div>

        <header className="text-center">
          <p className="text-lg text-muted-foreground">멋있는 조합을 직접 골라요</p>
          <h1 className="text-4xl">스타일 숍</h1>
        </header>

        <section className="grid gap-5 md:grid-cols-[0.9fr_1.5fr]">
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
                <button key={entry.id} type="button" onClick={() => setCategory(entry.id)} className={`rounded-2xl border px-2 py-3 ${category === entry.id ? "bg-secondary" : "bg-card"}`}>
                  {entry.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item) => {
                const owned = state.avatar.ownedItems.includes(item.id);
                const equipped = state.avatar.equipped[item.category] === item.id;
                const previewEquipped = { ...state.avatar.equipped, [item.category]: item.id };
                return (
                  <button key={item.id} type="button" onClick={() => chooseItem(item)} aria-pressed={equipped} className={`rounded-3xl border-2 p-3 text-center transition-transform active:scale-[0.98] ${equipped ? "border-primary bg-secondary" : "border-border bg-muted/40"}`}>
                    <div className="mx-auto flex h-24 items-center justify-center"><AvatarCharacter equipped={previewEquipped} size="sm" /></div>
                    <span className="mt-1 block text-lg">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">{setLabel[item.setId]} · Lv.{item.tier}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{equipped ? "입는 중" : owned ? "가지고 있어요" : item.price === 0 ? "무료" : won(item.price)}</span>
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
