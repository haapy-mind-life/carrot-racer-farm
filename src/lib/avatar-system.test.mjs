import test from "node:test";
import assert from "node:assert/strict";
import {
  AVATAR_ITEMS,
  DEFAULT_AVATAR,
  buyAvatarItem,
  equipAvatarItem,
  normalizeAvatarState,
} from "./avatar-system.ts";

test("catalog has exactly 22 items in 6/6/5/5 categories", () => {
  assert.equal(AVATAR_ITEMS.length, 22);
  const count = (category) => AVATAR_ITEMS.filter((item) => item.category === category).length;
  assert.equal(count("hair"), 6);
  assert.equal(count("top"), 6);
  assert.equal(count("bottom"), 5);
  assert.equal(count("shoes"), 5);
});

test("default avatar owns every equipped starter and starter prices are free", () => {
  for (const id of Object.values(DEFAULT_AVATAR.equipped)) {
    assert.ok(DEFAULT_AVATAR.ownedItems.includes(id));
    assert.equal(AVATAR_ITEMS.find((item) => item.id === id)?.price, 0);
  }
});

test("successful purchase charges once, owns and equips item", () => {
  const paid = AVATAR_ITEMS.find((item) => item.price > 0);
  assert.ok(paid);
  const result = buyAvatarItem(DEFAULT_AVATAR, paid.price + 100, paid.id);
  assert.equal(result.ok, true);
  assert.equal(result.money, 100);
  assert.ok(result.avatar.ownedItems.includes(paid.id));
  assert.equal(result.avatar.equipped[paid.category], paid.id);
});

test("insufficient purchase does not mutate money or avatar", () => {
  const paid = AVATAR_ITEMS.find((item) => item.price > 0);
  assert.ok(paid);
  const result = buyAvatarItem(DEFAULT_AVATAR, paid.price - 1, paid.id);
  assert.equal(result.ok, false);
  assert.equal(result.money, paid.price - 1);
  assert.deepEqual(result.avatar, DEFAULT_AVATAR);
  assert.equal(result.message, "돈이 조금 더 필요해요!");
});

test("buying an already owned item never charges again", () => {
  const owned = DEFAULT_AVATAR.ownedItems[0];
  const result = buyAvatarItem(DEFAULT_AVATAR, 1234, owned);
  assert.equal(result.ok, true);
  assert.equal(result.money, 1234);
});

test("unowned item cannot equip but owned item can", () => {
  const paid = AVATAR_ITEMS.find((item) => item.price > 0);
  assert.ok(paid);
  assert.equal(equipAvatarItem(DEFAULT_AVATAR, paid.id).ok, false);
  const owned = DEFAULT_AVATAR.ownedItems[1];
  assert.equal(equipAvatarItem(DEFAULT_AVATAR, owned).ok, true);
});

test("legacy or malformed avatar normalizes to valid owned equipped ids", () => {
  const normalized = normalizeAvatarState({ ownedItems: ["bad", "hair-short", "hair-short"], equipped: { hair: "bad" } });
  assert.equal(new Set(normalized.ownedItems).size, normalized.ownedItems.length);
  for (const id of Object.values(normalized.equipped)) {
    assert.ok(normalized.ownedItems.includes(id));
    assert.ok(AVATAR_ITEMS.some((item) => item.id === id));
  }
});

test("catalog ids are unique and prices are finite non-negative numbers", () => {
  assert.equal(new Set(AVATAR_ITEMS.map((item) => item.id)).size, AVATAR_ITEMS.length);
  for (const item of AVATAR_ITEMS) {
    assert.ok(Number.isFinite(item.price));
    assert.ok(item.price >= 0);
  }
});

test("missing legacy avatar becomes an independent valid default", () => {
  const normalized = normalizeAvatarState(undefined);
  assert.deepEqual(normalized, DEFAULT_AVATAR);
  assert.notEqual(normalized.ownedItems, DEFAULT_AVATAR.ownedItems);
});
