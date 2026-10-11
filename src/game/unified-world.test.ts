import { test } from "node:test";
import assert from "node:assert/strict";
import { MAP, stepPlayer } from "./adventure.ts";
import {
  COAST,
  OCEAN,
  HOUSE_TIERS,
  nearWorld,
  stepSubmarine,
  OCEAN_DISCOVERIES,
} from "./unified-world.ts";
test("old village and new coast share same continuous map", () => {
  assert.equal(MAP.width, 10200);
  assert.ok(COAST.truck.x > 5600 && COAST.truck.x < OCEAN.start);
  const next = stepPlayer({ x: 5570, y: 950 }, { x: 1, y: 0 }, 0.05);
  assert.ok(next.x > 5570);
  assert.equal(stepPlayer({ x: 24, y: 950 }, { x: -1, y: 0 }, 0.05).x, 24);
});
test("sea is real wide area with submarine constrained to ocean", () => {
  assert.ok(OCEAN.end - OCEAN.start > 2500);
  assert.equal(stepSubmarine({ x: OCEAN.end, y: 100 }, { x: 1, y: 0 }, 1).x, OCEAN.end);
  assert.equal(
    stepSubmarine({ x: OCEAN.start + 50, y: 100 }, { x: -1, y: 0 }, 1).x,
    OCEAN.start + 38,
  );
  for (const d of OCEAN_DISCOVERIES) assert.ok(d.x > OCEAN.start && d.x < OCEAN.end);
});
test("house upgrades have stable monotone progression", () => {
  assert.deepEqual(
    HOUSE_TIERS.map((t) => t.cost),
    [0, 100, 350, 850],
  );
  assert.ok(nearWorld(COAST.truck, COAST.truck));
});
