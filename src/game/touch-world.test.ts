import { test } from "node:test";
import assert from "node:assert/strict";
import { MAP, stepPlayer, isWalkable } from "./adventure.ts";
import { migrateSave, reduceWorld } from "../lib/world-model.ts";

test("world area doubles and east and west join", () => {
  assert.equal(MAP.width * MAP.height, 2800 * 1800 * 2);
  const east = stepPlayer({ x: MAP.width - 1, y: 850 }, { x: 1, y: 0 }, 0.05);
  assert.ok(east.x < 20);
  const west = stepPlayer({ x: 1, y: 850 }, { x: -1, y: 0 }, 0.05);
  assert.ok(west.x > MAP.width - 20);
  assert.ok(isWalkable(east) && isWalkable(west));
});
test("new constellation records migrate and pay only once", () => {
  const old = migrateSave({ money: 123, miniBest: { treasure: 4 } });
  assert.equal(old.miniBest.constellation, 0);
  const action = {
    type: "settle-mini" as const,
    id: "draw-1",
    game: "constellation" as const,
    score: 6,
  };
  const next = reduceWorld(old, action);
  assert.equal(next.money, 147);
  assert.equal(next.miniBest.treasure, 4);
  assert.equal(next.miniBest.constellation, 6);
  assert.deepEqual(reduceWorld(next, action), next);
});
