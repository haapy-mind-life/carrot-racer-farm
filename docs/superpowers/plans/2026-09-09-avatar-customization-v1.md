# Avatar Customization V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent 2D paper-doll avatar with 22 hair/top/bottom/shoes items that players can buy with existing game money, equip in a new `내 캐릭터` room, and see consistently on home and race screens.

**Architecture:** Keep avatar catalog and state transitions in a pure `avatar-system.ts` module so purchase/equip/migration behavior is testable without React. Extend the existing `GameState` persistence with an `avatar` field, then reuse one `AvatarCharacter` renderer on the customization, home, and race surfaces. Existing race scoring and the one-tap interaction remain untouched.

**Tech Stack:** React 19, TanStack Start/Router, TypeScript, Tailwind CSS 4, Node built-in test runner, localStorage.

**Spec:** `docs/superpowers/specs/2026-09-09-avatar-customization-v1-design.md`

## Global Constraints

- Reuse the existing `GameState.money` currency and `hyunjun-game-v1` localStorage key.
- Keep existing race scoring, rewards, obstacle, invincible, flying, stage, and 800-point finish behavior unchanged.
- Do not change `src/lib/race-engine.ts` unless a strictly necessary compatibility defect is discovered.
- Keep the existing warm rounded-card visual language and touch-friendly controls.
- Keep race interaction as one large tap/click surface.
- Preserve old save data and normalize missing/malformed avatar state.
- Do not manually edit generated TanStack route files.
- No force push, rebase, amend, or squash of published history; merge with a normal merge commit.

---

## File Map

- Create `src/lib/avatar-system.ts` — catalog, defaults, normalization, pure purchase/equip transitions.
- Create `src/lib/avatar-system.test.mjs` — TDD coverage for catalog, ownership, purchase, equip, migration, validation.
- Modify `src/lib/game-state.ts` — persist normalized avatar state and expose purchase/equip callbacks.
- Create `src/components/AvatarCharacter.tsx` — reusable layered paper-doll renderer.
- Create `src/routes/avatar.tsx` — `내 캐릭터` customization room.
- Modify `src/routes/index.tsx` — show current avatar and add customization activity card.
- Modify `src/routes/race.tsx` — render equipped avatar inside the existing race scene without touching race rules.

---

### Task 1: Pure Avatar Domain Model

**Files:**
- Create: `src/lib/avatar-system.test.mjs`
- Create: `src/lib/avatar-system.ts`

**Interfaces:**
- Produces `AvatarCategory = "hair" | "top" | "bottom" | "shoes"`.
- Produces `AvatarItem`, `AvatarState`, `AVATAR_ITEMS`, `DEFAULT_AVATAR`.
- Produces `normalizeAvatarState(input): AvatarState`.
- Produces `buyAvatarItem(state, money, itemId): AvatarActionResult`.
- Produces `equipAvatarItem(state, itemId): AvatarEquipResult`.
- Later tasks consume these exact names.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/avatar-system.test.mjs` with tests that import `./avatar-system.ts` and assert:

```js
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
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --experimental-strip-types --test src/lib/avatar-system.test.mjs
```

Expected: FAIL because `src/lib/avatar-system.ts` does not exist.

- [ ] **Step 3: Implement the minimal pure avatar module**

Create `src/lib/avatar-system.ts` with four categories, exactly 22 stable ids, at least two free items per category, immutable default state construction, normalization, purchase, and equip transitions. Paid prices should fit the existing game economy and stay modest for V1; use a progression such as 150/300/600/1200 for non-free choices rather than ticket-level prices.

The transition result shape must be:

```ts
export type AvatarActionResult = {
  ok: boolean;
  avatar: AvatarState;
  money: number;
  message: string;
};

export type AvatarEquipResult = {
  ok: boolean;
  avatar: AvatarState;
  message: string;
};
```

Purchase behavior:

```ts
if (!item) return { ok: false, avatar: state, money, message: "아이템을 찾을 수 없어요." };
if (state.ownedItems.includes(item.id)) {
  const equipped = equipAvatarItem(state, item.id);
  return { ok: equipped.ok, avatar: equipped.avatar, money, message: equipped.message };
}
if (money < item.price) return { ok: false, avatar: state, money, message: "돈이 조금 더 필요해요!" };
return {
  ok: true,
  avatar: { ownedItems: [...state.ownedItems, item.id], equipped: { ...state.equipped, [item.category]: item.id } },
  money: money - item.price,
  message: `${item.name} 구입! 바로 입었어요.`,
};
```

- [ ] **Step 4: Run the avatar tests and verify GREEN**

Run the same Node test command. Expected: 8 tests pass, 0 fail.

- [ ] **Step 5: Run strict TypeScript check for the pure module**

Run:

```bash
npx tsc src/lib/avatar-system.ts --noEmit --strict --target ES2022 --module ESNext --moduleResolution Bundler --skipLibCheck
```

Expected: exit 0.

- [ ] **Step 6: Commit the domain model**

Commit message:

```text
Add tested avatar catalog and state transitions
```

---

### Task 2: Persist Avatar State in Existing Game State

**Files:**
- Modify: `src/lib/game-state.ts`
- Test: `src/lib/avatar-system.test.mjs`

**Interfaces:**
- Consumes `AvatarState`, `DEFAULT_AVATAR`, `normalizeAvatarState`, pure buy/equip helpers.
- Produces `GameState.avatar: AvatarState`.
- Produces `useGame().buyAvatarItem(itemId)` and `useGame().equipAvatarItem(itemId)` callbacks returning a user-facing message string.

- [ ] **Step 1: Add a migration-focused failing domain test**

Extend `avatar-system.test.mjs` to verify `normalizeAvatarState(undefined)` creates a deep-valid default and does not share mutable arrays with `DEFAULT_AVATAR`:

```js
test("missing legacy avatar becomes an independent valid default", () => {
  const normalized = normalizeAvatarState(undefined);
  assert.deepEqual(normalized, DEFAULT_AVATAR);
  assert.notEqual(normalized.ownedItems, DEFAULT_AVATAR.ownedItems);
});
```

- [ ] **Step 2: Run and verify RED if the current implementation returns shared state**

Expected: either RED for shared ownership array or, if Task 1 already defensively clones, GREEN. In the latter case, keep the test as migration evidence and proceed without changing production solely to manufacture a failure.

- [ ] **Step 3: Extend `GameState` without changing the storage key**

Import avatar helpers and add:

```ts
avatar: AvatarState;
```

to `GameState`. Add a cloned `DEFAULT_AVATAR` to `initialState`.

In `load()`, keep existing money/plots/ticket/bestRun normalization and add:

```ts
avatar: normalizeAvatarState(parsed.avatar),
```

Do not rename `STORAGE_KEY` from `hyunjun-game-v1`.

- [ ] **Step 4: Add purchase/equip callbacks**

Inside `useGame`, add callbacks that run the pure transitions inside `setState`:

```ts
const buyAvatarItem = useCallback((itemId: string) => {
  let message = "";
  setState((s) => {
    const result = purchaseAvatarItem(s.avatar, s.money, itemId);
    message = result.message;
    return result.ok ? { ...s, money: result.money, avatar: result.avatar } : s;
  });
  return message;
}, []);
```

Avoid a name collision by importing the pure helper with an alias, e.g. `buyAvatarItem as purchaseAvatarItem` and `equipAvatarItem as applyAvatarEquip`.

Expose both callbacks from `useGame()`.

- [ ] **Step 5: Re-run avatar tests and targeted TypeScript checks**

Run avatar tests, then:

```bash
npx tsc src/lib/avatar-system.ts src/lib/game-state.ts --noEmit --noCheck --jsx react-jsx --module ESNext --target ES2022 --moduleResolution Bundler --allowImportingTsExtensions
```

Expected: tests green; syntax/type-transpile check exits 0.

- [ ] **Step 6: Commit persistence integration**

Commit message:

```text
Persist avatar purchases and equipment in game state
```

---

### Task 3: Reusable Paper-Doll Renderer

**Files:**
- Create: `src/components/AvatarCharacter.tsx`

**Interfaces:**
- Consumes `AvatarState["equipped"]`.
- Props:

```ts
type AvatarCharacterProps = {
  equipped: AvatarState["equipped"];
  size?: "sm" | "md" | "lg";
  power?: "normal" | "invincible" | "flying";
  className?: string;
};
```

- Produces one renderer reusable on home, avatar room, and race.

- [ ] **Step 1: Add render metadata to avatar catalog if needed**

Each `AvatarItem` must carry a small stable `visual` token appropriate to its category. Keep ids independent from visuals so SVG/PNG can replace these later.

- [ ] **Step 2: Implement `AvatarCharacter` using layered absolute-positioned elements**

Use a fixed internal canvas with simple child-friendly layers:

```text
base body/face
shoes
bottom
Top
hair
power overlay
```

Use catalog lookup by equipped id. Ensure missing ids fall back safely to defaults rather than throwing.

`power="invincible"` adds a sparkle/glow treatment; `power="flying"` adds wings. These are presentation-only.

- [ ] **Step 3: Run syntax/type-transpile check**

```bash
npx tsc src/lib/avatar-system.ts src/components/AvatarCharacter.tsx --noEmit --noCheck --jsx react-jsx --module ESNext --target ES2022 --moduleResolution Bundler --allowImportingTsExtensions
```

Expected: exit 0.

- [ ] **Step 4: Commit renderer**

Commit message:

```text
Add reusable layered avatar renderer
```

---

### Task 4: Add `내 캐릭터` Room and Home Integration

**Files:**
- Create: `src/routes/avatar.tsx`
- Modify: `src/routes/index.tsx`

**Interfaces:**
- Consumes `AVATAR_ITEMS`, `AvatarCategory`, `AvatarCharacter`, and new `useGame` callbacks.
- Produces route `/avatar` with category tabs and immediate buy/equip interaction.

- [ ] **Step 1: Implement the customization room in the existing visual language**

Use the same `max-w-3xl`, rounded card, border, card/muted/secondary/accent token pattern already present in home/race.

State:

```ts
const [category, setCategory] = useState<AvatarCategory>("hair");
const [message, setMessage] = useState("머리부터 골라볼까요?");
```

Interaction rule for an item card:

```ts
if (owned) setMessage(equipAvatarItem(item.id));
else setMessage(buyAvatarItem(item.id));
```

Display states: `입는 중`, `가지고 있어요`, `무료`, or formatted won price. No modal, delete, sell, or nested inventory.

- [ ] **Step 2: Add current avatar preview and third activity card to home**

Keep race and greenhouse cards intact. Add a third `Link to="/avatar"` with the same card treatment and copy emphasizing dressing up with earned money. Add a compact avatar preview near the money/ticket area without removing existing progress UI.

- [ ] **Step 3: Run route syntax/type-transpile check**

```bash
npx tsc src/lib/avatar-system.ts src/components/AvatarCharacter.tsx src/routes/avatar.tsx src/routes/index.tsx --noEmit --noCheck --jsx react-jsx --module ESNext --target ES2022 --moduleResolution Bundler --allowImportingTsExtensions
```

Expected: exit 0.

- [ ] **Step 4: Commit room and home integration**

Commit message:

```text
Add avatar customization room and home entry
```

---

### Task 5: Show Equipped Avatar in Existing One-Tap Race

**Files:**
- Modify: `src/routes/race.tsx`
- Do not modify: `src/lib/race-engine.ts`

**Interfaces:**
- `StageScene` gains `equipped: AvatarState["equipped"]` and passes existing `power` to `AvatarCharacter`.
- Existing `getRaceScene`, `advanceRace`, scoring, events, money, and finish flow stay unchanged.

- [ ] **Step 1: Replace only the runner rendering inside `StageScene`**

Remove the generic runner emoji from the moving runner element and render:

```tsx
<AvatarCharacter equipped={equipped} size="sm" power={power} />
```

Keep its parent positioned by `scene.runnerX` / `scene.runnerY` so ladder, crane, field, and sky motion remain driven by the existing scene model.

- [ ] **Step 2: Pass the saved avatar from `RacePage`**

Call:

```tsx
<StageScene stageId={stage.id} step={race.step} power={race.power} equipped={game.avatar.equipped} />
```

Do not add any new click/tap handlers.

- [ ] **Step 3: Run regression tests**

Run:

```bash
node --experimental-strip-types --test src/lib/race-engine.test.mjs src/lib/race-scene.test.mjs src/lib/avatar-system.test.mjs
```

Expected: all existing race tests plus avatar tests pass, 0 failures.

- [ ] **Step 4: Run targeted TypeScript checks**

Run strict pure-domain checks and noCheck route checks. If project dependencies are available, also run `npm run build`. If build cannot run because the execution environment lacks the private repository dependency installation context, report that limitation explicitly and do not claim a build pass.

- [ ] **Step 5: Commit race integration**

Commit message:

```text
Use customized avatar in race scenes
```

---

### Task 6: Final Verification, Review, and Merge

**Files:**
- No new functional files unless review finds a defect.

**Interfaces:**
- Final branch must contain spec + plan + implementation only, with no generated route file edits.

- [ ] **Step 1: Fresh verification**

Run from a clean reconstructed workspace or checked-out branch:

```bash
node --experimental-strip-types --test src/lib/race-engine.test.mjs src/lib/race-scene.test.mjs src/lib/avatar-system.test.mjs
```

Then run TypeScript checks over `avatar-system.ts`, `game-state.ts`, `AvatarCharacter.tsx`, `avatar.tsx`, `index.tsx`, and `race.tsx`.

- [ ] **Step 2: Inspect branch diff against main**

Confirm expected files only:

```text
docs/superpowers/specs/2026-09-09-avatar-customization-v1-design.md
docs/superpowers/plans/2026-09-09-avatar-customization-v1.md
src/lib/avatar-system.ts
src/lib/avatar-system.test.mjs
src/lib/game-state.ts
src/components/AvatarCharacter.tsx
src/routes/avatar.tsx
src/routes/index.tsx
src/routes/race.tsx
```

No `routeTree.gen.ts` and no `race-engine.ts` changes.

- [ ] **Step 3: Open PR and perform full diff review**

Review specifically for:

- accidental alternate currency
- double-charging purchases
- mutable default-state references
- loss of legacy save fields
- race-engine behavior changes
- new race controls
- inconsistent home/race styling
- invalid item ids reaching renderer

Fix any Critical or Important issue before merge and re-run fresh verification after fixes.

- [ ] **Step 4: Merge with a normal merge commit**

Use GitHub merge method `merge` with the expected PR head SHA. Do not squash or rebase.

- [ ] **Step 5: Verify final `main` HEAD and merge signature**

Fetch `main` after merge and confirm the new merge commit is HEAD and has the feature branch as a parent.
