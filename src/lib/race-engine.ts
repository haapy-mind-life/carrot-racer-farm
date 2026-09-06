export type RacePower = "normal" | "invincible" | "flying";
export type TrackEvent = "coin" | "obstacle" | "invincible-item" | "flying-item";
export type RaceEvent = "start" | TrackEvent | "finish";

export type RaceStage = {
  id: 1 | 2 | 3 | 4;
  name: string;
  emoji: string;
  minScore: number;
  reward: number;
};

export const RACE_FINISH_SCORE = 800;
export const POWER_DURATION = 5;
export const FINISH_BONUS = 200;

export const RACE_STAGES: readonly RaceStage[] = [
  { id: 1, name: "당근 들판", emoji: "🥕", minScore: 0, reward: 20 },
  { id: 2, name: "사다리 언덕", emoji: "🪜", minScore: 120, reward: 30 },
  { id: 3, name: "크레인 공사장", emoji: "🏗️", minScore: 300, reward: 45 },
  { id: 4, name: "하늘 정원", emoji: "☁️", minScore: 520, reward: 60 },
];

export type RaceState = {
  step: number;
  score: number;
  money: number;
  power: RacePower;
  powerSteps: number;
  event: RaceEvent;
  lastDelta: number;
  lastMoney: number;
  finished: boolean;
  message: string;
};

export function createRaceState(): RaceState {
  return {
    step: 0,
    score: 0,
    money: 0,
    power: "normal",
    powerSteps: 0,
    event: "start",
    lastDelta: 0,
    lastMoney: 0,
    finished: false,
    message: "화면을 눌러 출발!",
  };
}

export function getRaceStage(score: number): RaceStage {
  for (let index = RACE_STAGES.length - 1; index >= 0; index -= 1) {
    const stage = RACE_STAGES[index];
    if (stage && score >= stage.minScore) return stage;
  }
  return RACE_STAGES[0]!;
}

export function getRaceEvent(step: number): TrackEvent {
  if (step > 0 && step % 13 === 0) return "flying-item";
  if (step > 0 && step % 8 === 0) return "invincible-item";
  if (step > 0 && step % 5 === 0) return "obstacle";
  return "coin";
}

function consumePower(power: RacePower, powerSteps: number) {
  if (power === "normal" || powerSteps <= 1) {
    return { power: "normal" as const, powerSteps: 0 };
  }
  return { power, powerSteps: powerSteps - 1 };
}

export function advanceRace(state: RaceState): RaceState {
  if (state.finished) return state;

  const step = state.step + 1;
  const event = getRaceEvent(step);
  const stage = getRaceStage(state.score);
  let power = state.power;
  let powerSteps = state.powerSteps;
  let lastDelta = 0;
  let lastMoney = 0;
  let message = "코인을 모았어요!";

  if (event === "invincible-item") {
    power = "invincible";
    powerSteps = POWER_DURATION;
    lastDelta = 15;
    message = "⭐ 무적 변신! 장애물이 보너스로 바뀌어요.";
  } else if (event === "flying-item") {
    power = "flying";
    powerSteps = POWER_DURATION;
    lastDelta = 20;
    message = "🪽 날기 변신! 코인을 두 배로 모아요.";
  } else if (event === "obstacle") {
    if (power === "normal") {
      lastDelta = 5;
      message = "🪨 장애물! 천천히 넘었어요. 다시 달려요!";
    } else if (power === "invincible") {
      lastDelta = 35;
      lastMoney = 35;
      message = "⭐ 무적으로 장애물을 쾅! 보너스!";
    } else {
      lastDelta = 45;
      lastMoney = 45;
      message = "🪽 장애물 위로 훨훨! 보너스!";
    }
    ({ power, powerSteps } = consumePower(power, powerSteps));
  } else {
    lastMoney = power === "flying" ? stage.reward * 2 : stage.reward;
    lastDelta = lastMoney;
    message = power === "flying" ? "🪽 하늘 코인 두 배!" : "🪙 코인을 모았어요!";
    ({ power, powerSteps } = consumePower(power, powerSteps));
  }

  const score = state.score + lastDelta;
  let money = state.money + lastMoney;
  const finished = score >= RACE_FINISH_SCORE;

  if (finished) {
    money += FINISH_BONUS;
    message = `🏁 완주! 보너스 ${FINISH_BONUS}원!`;
  }

  return {
    step,
    score,
    money,
    power,
    powerSteps,
    event: finished ? "finish" : event,
    lastDelta,
    lastMoney,
    finished,
    message,
  };
}
