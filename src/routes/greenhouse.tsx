import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HomeButton } from "@/components/HomeButton";
import { CROPS, cropById, useGame, won, type CropId } from "@/lib/game-state";

export const Route = createFileRoute("/greenhouse")({
  head: () => ({
    meta: [
      { title: "박현준 게임 — 식물하우스" },
      {
        name: "description",
        content: "씨앗을 사서 물을 주고 작물을 키워 파는 식물하우스. 황금 작물이 나올지도!",
      },
      { property: "og:title", content: "박현준 게임 — 식물하우스" },
      {
        property: "og:description",
        content: "무, 사탕무, 양상추, 당근, 해바라기를 키우고 황금 작물을 노려보세요.",
      },
    ],
  }),
  component: Greenhouse,
});

const GROWTH_EMOJI = ["🌱", "🌿", "🍀"];

function Greenhouse() {
  const { state, ready, plant, water, harvest } = useGame();
  const [selected, setSelected] = useState<CropId>("radish");
  const [message, setMessage] = useState<string | null>(null);

  const onPlot = (index: number) => {
    const plot = state.plots[index];
    if (!plot?.crop) {
      const crop = cropById(selected);
      if (state.money < crop.seedCost) {
        setMessage(`돈이 모자라요! ${crop.name} 씨앗은 ${won(crop.seedCost)}이에요.`);
        return;
      }
      plant(index, selected);
      setMessage(`${crop.emoji} ${crop.name} 씨앗을 심었어요. 물을 주세요!`);
      return;
    }
    const crop = cropById(plot.crop);
    if (plot.water < crop.waterNeeded) {
      water(index);
      setMessage(`💧 철푸덕! ${crop.name}에게 물을 줬어요.`);
      return;
    }
    const result = harvest(index) as { name: string; amount: number; gold: boolean } | null;
    if (result) {
      setMessage(
        result.gold
          ? `✨✨ 황금이다! ${result.name} 수확! +${won(result.amount)} ✨✨`
          : `${crop.emoji} ${result.name} 수확! +${won(result.amount)}`,
      );
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_-10%,var(--color-secondary),transparent_55%)] px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <HomeButton />
          <p className="rounded-full bg-card px-4 py-1 text-lg shadow-sm">
            💰 {ready ? won(state.money) : "…"}
          </p>
        </div>

        <h1 className="text-center text-4xl">🌿 식물하우스</h1>

        <section className="rounded-4xl border-2 border-border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-2xl">씨앗 가게</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {CROPS.map((crop) => (
              <button
                key={crop.id}
                onClick={() => setSelected(crop.id)}
                className={`flex flex-col items-center gap-1 rounded-3xl border-2 px-2 py-3 transition-transform hover:-translate-y-0.5 ${
                  selected === crop.id
                    ? "border-primary bg-secondary"
                    : "border-border bg-background"
                }`}
              >
                <span className="text-3xl">{crop.emoji}</span>
                <span className="text-lg">{crop.name}</span>
                <span className="text-sm text-muted-foreground">씨앗 {won(crop.seedCost)}</span>
                <span className="text-sm text-muted-foreground">판매 {won(crop.sellPrice)}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-muted-foreground">
            다 자란 작물 중 아주 가끔 ✨황금 작물✨이 나와요!
          </p>
        </section>

        {message && (
          <p className="rounded-3xl bg-accent px-5 py-3 text-center text-xl text-accent-foreground shadow-sm">
            {message}
          </p>
        )}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {state.plots.map((plot, i) => {
            const crop = plot.crop ? cropById(plot.crop) : null;
            const grown = crop ? plot.water >= crop.waterNeeded : false;
            const stage = crop ? Math.min(GROWTH_EMOJI.length - 1, plot.water) : -1;
            return (
              <button
                key={i}
                onClick={() => onPlot(i)}
                className={`flex h-32 flex-col items-center justify-center gap-1 rounded-4xl border-2 text-center shadow-sm transition-transform hover:-translate-y-0.5 ${
                  grown && plot.gold
                    ? "border-gold bg-accent"
                    : grown
                      ? "border-primary bg-secondary"
                      : "border-border bg-card"
                }`}
              >
                <span className="text-4xl">
                  {!crop
                    ? "🪴"
                    : grown
                      ? plot.gold
                        ? crop.goldEmoji
                        : crop.emoji
                      : GROWTH_EMOJI[stage]}
                </span>
                <span className="text-lg">
                  {!crop
                    ? "빈 밭 — 눌러서 심기"
                    : grown
                      ? plot.gold
                        ? `${crop.goldName} 수확!`
                        : `${crop.name} 수확!`
                      : `${crop.name} 💧 ${plot.water}/${crop.waterNeeded}`}
                </span>
              </button>
            );
          })}
        </section>
      </div>
    </main>
  );
}
