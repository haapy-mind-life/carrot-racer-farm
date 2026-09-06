import test from "node:test";
import assert from "node:assert/strict";
import {
  RACE_FINISH_SCORE,
  advanceRace,
  createRaceState,
  getRaceEvent,
  getRaceStage,
} from "./race-engine.ts";

test("score thresholds move through the four kid-friendly stages", () => {
  assert.equal(getRaceStage(0).name, "당근 들판");
  assert.equal(getRaceStage(119).name, "당근 들판");
  assert.equal(getRaceStage(120).name, "사다리 언덕");
  assert.equal(getRaceStage(300).name, "크레인 공사장");
  assert.equal(getRaceStage(520).name, "하늘 정원");
});

test("the event track places obstacles and both transformation items", () => {
  assert.equal(getRaceEvent(5), "obstacle");
  assert.equal(getRaceEvent(8), "invincible-item");
  assert.equal(getRaceEvent(13), "flying-item");
});

test("collecting the invincible item transforms the runner for five following taps", () => {
  let state = createRaceState();
  for (let i = 0; i < 8; i += 1) state = advanceRace(state);

  assert.equal(state.power, "invincible");
  assert.equal(state.powerSteps, 5);

  for (let i = 0; i < 4; i += 1) state = advanceRace(state);
  assert.equal(state.power, "invincible");
  assert.equal(state.powerSteps, 1);

  state = advanceRace(state);
  assert.equal(state.power, "flying");
  assert.equal(state.powerSteps, 5);
});

test("a normal obstacle slows progress while a power-up turns it into a bonus", () => {
  let normal = createRaceState();
  for (let i = 0; i < 5; i += 1) normal = advanceRace(normal);
  assert.equal(normal.event, "obstacle");
  assert.equal(normal.lastDelta, 5);

  let powered = createRaceState();
  for (let i = 0; i < 10; i += 1) powered = advanceRace(powered);
  assert.equal(powered.event, "obstacle");
  assert.equal(powered.power, "invincible");
  assert.ok(powered.lastDelta > normal.lastDelta);
});

test("a run finishes at the score goal and freezes until restarted", () => {
  let state = createRaceState();
  for (let i = 0; i < 200 && !state.finished; i += 1) state = advanceRace(state);

  assert.equal(state.finished, true);
  assert.ok(state.score >= RACE_FINISH_SCORE);
  assert.equal(advanceRace(state), state);
});
