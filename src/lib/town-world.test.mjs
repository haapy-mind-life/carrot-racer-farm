import test from "node:test";
import assert from "node:assert/strict";
import {
  TOWN_DESTINATIONS,
  clampTownPoint,
  getTownDestination,
  movementDurationMs,
  townDistance,
} from "./town-world.ts";

test("town points clamp to normalized 0-100 coordinates", () => {
  assert.deepEqual(clampTownPoint({ x: -5, y: 130 }), { x: 0, y: 100 });
});

test("distance uses Euclidean normalized coordinates", () => {
  assert.equal(townDistance({ x: 10, y: 20 }, { x: 13, y: 24 }), 5);
});

test("movement duration is distance based and bounded", () => {
  assert.equal(movementDurationMs(0), 180);
  assert.equal(movementDurationMs(1000), 900);
  assert.ok(movementDurationMs(40) > movementDurationMs(10));
});

test("town exposes exactly the four approved destinations", () => {
  assert.deepEqual(TOWN_DESTINATIONS.map((item) => item.id), ["home", "style", "race", "greenhouse"]);
});

test("destination lookup returns its entrance coordinate", () => {
  const race = getTownDestination("race");
  assert.equal(race.route, "/race");
  assert.notDeepEqual(race.position, race.entrance);
  assert.ok(race.interactionRadius >= 8);
});
