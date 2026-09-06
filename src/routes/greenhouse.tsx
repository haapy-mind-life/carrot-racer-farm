import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HomeButton } from "@/components/HomeButton";
import {
  CROPS,
  GOLD_CHANCE,
  cropById,
  type CropId,
  useGame,
  won,
} from "@/lib/game-state";

export const Route = createFileRoute("/greenhouse")({
  head: () => ({
    meta: [
      { title: "박현준 게임 — 식물하우스" },
      {
        name: "description",
        content: "작물을 고르고 밭을 눌러 심기, 물주기, 수확을 이어가는 간단한 식물하우스.",
      },
    ],
  }),
  component: GreenhousePage,
});

function GreenhousePage() {
  const { state, ready, plant, water, harvest } = useGame();
  const [selectedCrop, setSelectedCrop] = useState<CropId>("radish");
  const [message, setMessage] = useState("씨앗을 고르고 빈 밭을 눌러보세요.");
  const selected = cropById(selectedCrop);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,var(--color-sky),transparent_55%)] px-4 py-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <HomeButton />
          <div className="rounded-full bg-card px-5 py-2 text-lg shadow-sm">
            내 돈 {ready ? won(state.money) : "…"}
          </div>
        </div>

        <header className="text-center">
          <p className="text-lg text-muted-foreground">누르기만 하면 자라요</p>
          <h1 className="text-4xl text-foreground">🌿 식물하우스</h1>
        </header>

        <section className="rounded-4xl border-2 border-border bg-card p-5 shadow-sm">
          <p className="text-center text-xl">심을 작물 선택</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CROPS.map((crop) => {
              const selectedNow = crop.id === selectedCrop;
              const affordable = state.money >= crop.seedCost;
              return (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`rounded-3xl border-2 p-3 text-center transition-transform active:scale-95 ${
                    selectedNow ? "border-primary bg-secondary" : "border-border bg-background"
                  }`}
                >
                  <div className="text-4xl" aria-hidden="true">{crop.emoji}</div>
                  <div className="mt-1 text-lg">{crop.name}</div>
                  <div className={`text-sm ${affordable ? "text-muted-foreground" : "text-destructive"}`}>
                    {won(crop.seedCost)}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <p className="rounded-3xl bg-secondary px-5 py-4 text-center text-xl text-secondary-foreground">
          {message}
        </p>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.plots.map((plot, index) => {
            if (!plot.crop) {
              return (
                <button
                  key={index}
                  type="button"
                  disabled={!ready || state.money < selected.seedCost}
                  onClick={() => {
                    plant(index, selectedCrop);
                    setMessage(`${selected.emoji} ${selected.name} 씨앗을 심었어요!`);
                  }}
                  className="min-h-52 rounded-4xl border-2 border-dashed border-border bg-card p-5 text-center shadow-sm transition-transform enabled:active:scale-[0.98] disabled:opacity-50"
                >
                  <div className="text-5xl" aria-hidden="true">🟫</div>
                  <p className="mt-3 text-2xl">빈 밭</p>
                  <p className="mt-2 text-lg text-muted-foreground">
                    {selected.emoji} {selected.name} 심기
                  </p>
                </button>
              );
            }

            const crop = cropById(plot.crop);
            const grown = plot.water >= crop.waterNeeded;
            const cropEmoji = grown && plot.gold ? crop.goldEmoji : crop.emoji;

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (!grown) {
                    water(index);
                    setMessage(
                      `💧 ${crop.name}에 물을 줬어요! (${Math.min(plot.water + 1, crop.waterNeeded)}/${crop.waterNeeded})`,
                    );
                    return;
                  }
                  const amount = plot.gold ? crop.goldSellPrice : crop.sellPrice;
                  const name = plot.gold ? crop.goldName : crop.name;
                  harvest(index);
                  setMessage(`${plot.gold ? "✨ " : ""}${name} 수확! +${won(amount)}`);
                }}
                className={`min-h-52 rounded-4xl border-2 p-5 text-center shadow-sm transition-transform active:scale-[0.98] ${
                  plot.gold && grown ? "border-accent bg-secondary" : "border-border bg-card"
                }`}
              >
                <div className="text-6xl" aria-hidden="true">{cropEmoji}</div>
                <p className="mt-3 text-2xl">{plot.gold && grown ? crop.goldName : crop.name}</p>
                {grown ? (
                  <p className="mt-2 rounded-full bg-accent px-4 py-2 text-lg text-accent-foreground">
                    🧺 눌러서 수확 · {won(plot.gold ? crop.goldSellPrice : crop.sellPrice)}
                  </p>
                ) : (
                  <>
                    <p className="mt-2 text-lg text-muted-foreground">물 {plot.water}/{crop.waterNeeded}</p>
                    <p className="mt-2 rounded-full bg-sky-100 px-4 py-2 text-lg text-sky-800">💧 눌러서 물주기</p>
                  </>
                )}
              </button>
            );
          })}
        </section>

        <p className="text-center text-base text-muted-foreground">
          다 자랄 때 약 {Math.round(GOLD_CHANCE * 100)}% 확률로 황금 작물이 나와요. ✨
        </p>
      </div>
    </main>
  );
}
