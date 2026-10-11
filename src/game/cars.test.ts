import { test } from "node:test";
import assert from "node:assert/strict";
import { CAR_COUNT, CAR_KINDS, CARS, carById } from "./cars.ts";
test("exactly 100 discoverable vehicles from ten visually different body families", () => {
  assert.equal(CAR_COUNT, 100);
  assert.equal(CAR_KINDS.length, 10);
  assert.equal(new Set(CARS.map((c) => c.id)).size, 100);
  assert.equal(new Set(CARS.map((c) => c.name)).size, 100);
  assert.equal(new Set(CARS.map((c) => c.kind)).size, 10);
  assert.deepEqual(
    CARS.map((c) => c.number),
    Array.from({ length: 100 }, (_, i) => i + 1),
  );
});
test("vehicle lookup is stable and invalid IDs safely fall back to first vehicle", () => {
  for (const car of CARS) assert.equal(carById(car.id), car);
  assert.equal(carById("unknown"), CARS[0]);
});
