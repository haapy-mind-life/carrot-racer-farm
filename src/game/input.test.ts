import { test } from "node:test";
import assert from "node:assert/strict";
import { createInput, movementKey } from "./input.ts";
test("Korean keyboard layout uses physical WASD keys", () => {
  assert.equal(movementKey("ㅈ", "KeyW"), "w");
  assert.equal(movementKey("ArrowUp", "ArrowUp"), "arrowup");
});
test("releasing one finger does not release another finger or keyboard", () => {
  const i = createInput();
  i.pointers.set(1, "d");
  i.pointers.set(2, "w");
  i.keyboard.add("d");
  assert.deepEqual(i.direction(), { x: 1, y: -1 });
  i.pointers.delete(1);
  assert.equal(i.direction().x, 1);
  i.pointers.delete(2);
  assert.deepEqual(i.direction(), { x: 1, y: 0 });
  i.clear();
  assert.deepEqual(i.direction(), { x: 0, y: 0 });
});
