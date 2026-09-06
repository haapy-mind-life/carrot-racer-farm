export type SceneStageId = 1 | 2 | 3 | 4;
export type ScenePower = "normal" | "invincible" | "flying";
export type SceneKind = "field" | "ladder" | "crane" | "sky";
export type ScenePhase =
  | "run"
  | "climb"
  | "collect"
  | "descend"
  | "idle"
  | "lower"
  | "lift"
  | "carry"
  | "drop"
  | "glide"
  | "fly";

export type RaceScene = {
  kind: SceneKind;
  phase: ScenePhase;
  runnerX: number;
  runnerY: number;
  focusEmoji: string;
  supportEmoji: string;
  cargoEmoji: string;
  hookX: number;
  hookY: number;
  caption: string;
};

const clampStep = (step: number) => Math.max(0, Math.floor(step));

function fieldScene(step: number, power: ScenePower): RaceScene {
  const positions = [22, 40, 58, 76];
  const runnerX = positions[step % positions.length] ?? 22;
  const flying = power === "flying";
  return {
    kind: "field",
    phase: flying ? "fly" : "run",
    runnerX,
    runnerY: flying ? 48 : 70,
    focusEmoji: "🥕",
    supportEmoji: "🪙",
    cargoEmoji: "",
    hookX: 50,
    hookY: 10,
    caption: flying ? "당근밭 위를 날아가요!" : "당근밭을 힘차게 달려요!",
  };
}

function ladderScene(step: number): RaceScene {
  const cycle = step % 8;
  const level = cycle <= 4 ? cycle : 8 - cycle;
  const phase: ScenePhase = cycle === 4 ? "collect" : cycle < 4 ? "climb" : "descend";
  return {
    kind: "ladder",
    phase,
    runnerX: 50,
    runnerY: 76 - level * 12,
    focusEmoji: phase === "collect" ? "🪙" : "🪜",
    supportEmoji: "🪜",
    cargoEmoji: "",
    hookX: 50,
    hookY: 10,
    caption:
      phase === "collect"
        ? "정상에서 코인을 모았어요!"
        : phase === "climb"
          ? "사다리를 올라가요!"
          : "코인을 챙기고 내려가요!",
  };
}

function craneScene(step: number): RaceScene {
  const cycle = step % 6;
  const phases: ScenePhase[] = ["idle", "lower", "lift", "carry", "carry", "drop"];
  const phase = phases[cycle] ?? "idle";
  const hookX = cycle <= 2 ? 28 : cycle <= 4 ? 58 + (cycle - 3) * 16 : 86;
  const hookY = phase === "lower" ? 62 : phase === "drop" ? 66 : phase === "idle" ? 22 : 38;
  return {
    kind: "crane",
    phase,
    runnerX: 18,
    runnerY: 72,
    focusEmoji: "🏗️",
    supportEmoji: "🪙",
    cargoEmoji: cycle === 0 ? "" : "📦",
    hookX,
    hookY,
    caption:
      phase === "lower"
        ? "크레인 줄을 내려요!"
        : phase === "lift"
          ? "상자를 들어 올려요!"
          : phase === "carry"
            ? "상자를 옮겨요!"
            : phase === "drop"
              ? "상자를 내려놓고 보너스!"
              : "크레인이 준비됐어요!",
  };
}

function skyScene(step: number, power: ScenePower): RaceScene {
  const wave = [0, -7, -12, -5, 4, 9, 3];
  const flying = power === "flying";
  const baseY = 55 + (wave[step % wave.length] ?? 0);
  return {
    kind: "sky",
    phase: flying ? "fly" : "glide",
    runnerX: 24 + (step % 5) * 12,
    runnerY: flying ? baseY - 18 : baseY,
    focusEmoji: flying ? "🪽" : "☁️",
    supportEmoji: "☁️",
    cargoEmoji: "",
    hookX: 50,
    hookY: 10,
    caption: flying ? "날기 변신으로 구름 위를 훨훨!" : "구름 사이를 달려요!",
  };
}

export function getRaceScene(stageId: SceneStageId, stepValue: number, power: ScenePower): RaceScene {
  const step = clampStep(stepValue);
  if (stageId === 2) return ladderScene(step);
  if (stageId === 3) return craneScene(step);
  if (stageId === 4) return skyScene(step, power);
  return fieldScene(step, power);
}
