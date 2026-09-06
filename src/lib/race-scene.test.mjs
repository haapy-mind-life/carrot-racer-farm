import test from "node:test";
import assert from "node:assert/strict";
import { getRaceScene } from "./race-scene.ts";

test("each race stage maps to its own visual scene", () => {
  assert.equal(getRaceScene(1, 0, "normal").kind, "field");
  assert.equal(getRaceScene(2, 0, "normal").kind, "ladder");
  assert.equal(getRaceScene(3, 0, "normal").kind, "crane");
  assert.equal(getRaceScene(4, 0, "normal").kind, "sky");
});

test("ladder scene climbs to a reward and then descends", () => {
  const climb = getRaceScene(2, 2, "normal");
  const top = getRaceScene(2, 4, "normal");
  const descend = getRaceScene(2, 6, "normal");

  assert.equal(climb.phase, "climb");
  assert.ok(top.runnerY < climb.runnerY);
  assert.equal(top.phase, "collect");
  assert.equal(top.focusEmoji, "🪙");
  assert.equal(descend.phase, "descend");
  assert.ok(descend.runnerY > top.runnerY);
});

test("crane scene cycles through lowering lifting carrying and dropping cargo", () => {
  assert.equal(getRaceScene(3, 1, "normal").phase, "lower");
  assert.equal(getRaceScene(3, 2, "normal").phase, "lift");
  assert.equal(getRaceScene(3, 3, "normal").phase, "carry");
  assert.equal(getRaceScene(3, 5, "normal").phase, "drop");
  assert.equal(getRaceScene(3, 2, "normal").cargoEmoji, "📦");
});

test("sky scene lifts the runner higher while flying", () => {
  const normal = getRaceScene(4, 3, "normal");
  const flying = getRaceScene(4, 3, "flying");

  assert.equal(flying.phase, "fly");
  assert.ok(flying.runnerY < normal.runnerY);
  assert.equal(flying.focusEmoji, "🪽");
});

test("field scene gives the runner horizontal motion across taps", () => {
  const first = getRaceScene(1, 1, "normal");
  const later = getRaceScene(1, 4, "normal");
  assert.notEqual(first.runnerX, later.runnerX);
  assert.equal(first.focusEmoji, "🥕");
});
