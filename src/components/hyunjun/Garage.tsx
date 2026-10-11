import { useState } from "react";
import { CARS, carById } from "@/game/cars";
import { CarArt } from "./CarArt";
const KEY = "hyunjun-selected-car-v1";
export function loadCarId() {
  if (typeof window === "undefined") return CARS[0]!.id;
  try {
    return carById(window.localStorage.getItem(KEY) ?? "").id;
  } catch {
    return CARS[0]!.id;
  }
}
export function Garage({
  selected,
  onSelect,
  onClose,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(CARS.length / 20);
  return (
    <div className="hj-garage-backdrop" role="presentation">
      <section className="hj-garage" role="dialog" aria-modal="true" aria-label="자동차 120종 차고">
        <header>
          <div>
            <h2>현준이의 자동차 차고</h2>
            <p>{CARS.length}대 중 마음에 드는 차를 골라 운전해 보자!</p>
          </div>
          <button onClick={onClose}>닫기 ✕</button>
        </header>
        <p role="status">
          선택한 자동차: {carById(selected).name} · {selected.replace("car-", "")}번
        </p>
        <div className="hj-garage-grid">
          {CARS.slice(page * 20, page * 20 + 20).map((car) => (
            <button
              key={car.id}
              className={selected === car.id ? "chosen" : ""}
              aria-pressed={selected === car.id}
              onClick={() => onSelect(car.id)}
            >
              <CarArt car={car} size={85} />
              <span>{car.name}</span>
              <small>
                {car.number} / {CARS.length}
              </small>
            </button>
          ))}
        </div>
        <footer>
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            ◀ 이전 20대
          </button>
          <strong>
            {page + 1} / {pages}
          </strong>
          <button
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={page === pages - 1}
          >
            다음 20대 ▶
          </button>
          <button className="hj-drive-now" onClick={onClose}>
            이 차 타고 출발!
          </button>
        </footer>
      </section>
    </div>
  );
}
export function saveCarId(id: string) {
  try {
    window.localStorage.setItem(KEY, carById(id).id);
  } catch {
    /* session-only selection */
  }
}
