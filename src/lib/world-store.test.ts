import test from "node:test";
import assert from "node:assert/strict";
import { createWorldStore } from "./world-store.ts";

test("store keeps playable in-memory state when persistent writes fail", () => {
  const storage = {
    getItem: () => null,
    setItem: () => {
      throw new Error("blocked");
    },
  };
  const store = createWorldStore(() => storage);
  let seen = 0;
  const unsub = store.subscribe(() => seen++);
  const next = store.dispatch({ type: "plant", index: 0, crop: "radish" });
  assert.equal(next.plots[0].crop, "radish");
  assert.equal(store.getSnapshot().storageWarning, true);
  assert.equal(seen, 1);
  unsub();
});
