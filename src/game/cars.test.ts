import { test } from "node:test";
import assert from "node:assert/strict";
import { CAR_COUNT, CAR_KINDS, CARS, carById } from "./cars.ts";
test("120 discoverable vehicles preserve 100 originals and add two distinct families", () => {
  assert.equal(CAR_COUNT, 120);
  assert.equal(CAR_KINDS.length, 12);
  assert.equal(new Set(CARS.map((c) => c.id)).size, 120);
  assert.equal(new Set(CARS.map((c) => c.name)).size, 120);
  assert.equal(new Set(CARS.map((c) => c.kind)).size, 12);
  assert.deepEqual(
    CARS.map((c) => c.number),
    Array.from({ length: 120 }, (_, i) => i + 1),
  );
});
test("vehicle lookup is stable and invalid IDs safely fall back to first vehicle", () => {
  for (const car of CARS) assert.equal(carById(car.id), car);
  assert.equal(carById("unknown"), CARS[0]);
});
