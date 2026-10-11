import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FOOD_MENU,
  LIFE_MAPS,
  LIFE_SPOTS,
  SEA_TREASURES,
  foodById,
  nextFoodOrder,
  nearSpot,
  nearbyTreasure,
  stepLifePlayer,
} from "./life-world.ts";

test("all requested foods and visually giant pizza variants exist", () => {
  for (const name of ["돈까스", "김치", "피자", "콜라", "대왕 피자", "초대형 황금 피자"])
    assert.ok(
      FOOD_MENU.some((food) => food.name === name),
      name,
    );
  assert.equal(new Set(FOOD_MENU.map((food) => food.id)).size, FOOD_MENU.length);
  assert.ok(foodById("giant-pizza")!.size > foodById("pizza")!.size);
  assert.ok(foodById("gold-pizza")!.size > foodById("giant-pizza")!.size);
  assert.equal(foodById("not-food"), undefined);
});
test("valid distinct repeating customer requests and no hidden sale on creation", () => {
  const first = nextFoodOrder(0, "order-1");
  const second = nextFoodOrder(1, "order-2");
  assert.notEqual(first.foodId, second.foodId);
  assert.equal(first.phase, "offered");
  assert.equal(nextFoodOrder(FOOD_MENU.length, "order-3").foodId, first.foodId);
});
test("new world areas have room for a mansion, coast and an extended ocean", () => {
  assert.ok(LIFE_MAPS.coast.width > 3500);
  assert.ok(LIFE_MAPS.mansion.width > 2000);
  assert.ok(LIFE_MAPS["deep-sea"].width > LIFE_MAPS.mansion.width);
  assert.ok(nearSpot(LIFE_SPOTS.foodTruck, LIFE_SPOTS.foodTruck));
  assert.equal(nearSpot(LIFE_SPOTS.foodTruck, LIFE_SPOTS.foodCustomer), false);
});
test("on-foot coast remains on land; submarine remains within deep sea", () => {
  const shore = stepLifePlayer("coast", { x: 3298, y: 1500 }, { x: 1, y: 0 }, 1);
  assert.equal(shore.x, 3300);
  const sea = stepLifePlayer("deep-sea", { x: 4160, y: 1500 }, { x: 1, y: 0 }, 1);
  assert.equal(sea.x, LIFE_MAPS["deep-sea"].width - 45);
  const home = stepLifePlayer("mansion", LIFE_SPOTS.mansionInside, { x: -100, y: -100 }, 100);
  assert.ok(home.x >= 45 && home.y >= 45);
});
test("underwater treasure sites can be discovered individually", () => {
  assert.equal(new Set(SEA_TREASURES.map((site) => site.id)).size, 3);
  for (const site of SEA_TREASURES) assert.equal(nearbyTreasure(site)?.id, site.id);
  assert.equal(nearbyTreasure({ x: 400, y: 970 }), null);
});
