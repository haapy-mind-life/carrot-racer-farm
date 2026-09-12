# Hyunjun Town Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the root screen into a tap-to-walk town and replace emoji-stacked avatar clothing with coherent layered vector outfits while preserving saves, economy, race, and greenhouse behavior.

**Architecture:** Add a pure `town-world.ts` domain module for coordinates, destinations, and movement duration, then render that model in a focused `TownWorld` React component. Keep existing avatar item ids and persistence, but extend catalog entries with stable style metadata consumed by a rewritten `AvatarCharacter` SVG/CSS renderer and the style-shop previews.

**Tech Stack:** React 19, TanStack Start/Router, TypeScript 5.8, Tailwind CSS 4, Node built-in test runner, localStorage.

**Spec:** `docs/superpowers/specs/2026-09-12-hyunjun-town-hub-design.md`

## Global Constraints

- Tap-first interaction; no text input, joystick, or D-pad for core play.
- Keep `GameState.money`, avatar purchases/equipment, save compatibility, race rules, greenhouse rules, and ticket semantics intact.
- Preserve existing avatar item ids wherever practical so old saves keep owned/equipped state.
- Do not manually edit `src/routeTree.gen.ts`.
- Scope `user-select`, touch-callout, and context-menu suppression to game surfaces rather than the whole document.
- Respect `prefers-reduced-motion`.
- No force push, rebase, amend, or squash of published history; repository is Lovable-connected.

---

## File Map

- Create `src/lib/town-world.ts` — pure normalized-coordinate destinations and movement helpers.
- Create `src/lib/town-world.test.mjs` — TDD coverage for world math and destination contracts.
- Modify `src/lib/avatar-system.ts` — add `styleKey`, `setId`, and visual tier metadata while keeping ids/economy stable.
- Modify `src/lib/avatar-system.test.mjs` — validate style keys, set consistency, and save compatibility.
- Rewrite `src/components/AvatarCharacter.tsx` — layered vector/CSS character renderer with existing public props.
- Create `src/components/TownWorld.tsx` — world scene, tap movement, safe delayed navigation, semantic destination hit areas.
- Rewrite `src/routes/index.tsx` — compact HUD plus `TownWorld`, removing launcher cards.
- Modify `src/routes/avatar.tsx` — item cards render worn previews and coordinated outfit guidance without emoji category buttons.
- Modify `src/styles.css` — scoped `.game-surface` touch/callout/selection hardening and movement/reduced-motion styles.

---

### Task 1: Pure Town World Domain

**Files:**
- Create: `src/lib/town-world.test.mjs`
- Create: `src/lib/town-world.ts`

**Interfaces:**
- Produces `TownPoint = { x: number; y: number }`.
- Produces `TownDestinationId = "home" | "style" | "race" | "greenhouse"`.
- Produces `TownDestination = { id, label, route, position, entrance, interactionRadius }`.
- Produces `TOWN_DESTINATIONS`, `clampTownPoint`, `townDistance`, `movementDurationMs`, `getTownDestination`.

- [ ] **Step 1: Write failing tests**

Create `src/lib/town-world.test.mjs`:

```js
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
```

- [ ] **Step 2: Run RED**

```bash
node --experimental-strip-types --test src/lib/town-world.test.mjs
```

Expected: FAIL because `town-world.ts` does not exist.

- [ ] **Step 3: Implement minimal world helpers**

Create `src/lib/town-world.ts` with this shape:

```ts
export type TownPoint = { x: number; y: number };
export type TownDestinationId = "home" | "style" | "race" | "greenhouse";

export type TownDestination = {
  id: TownDestinationId;
  label: string;
  route: "/" | "/avatar" | "/race" | "/greenhouse";
  position: TownPoint;
  entrance: TownPoint;
  interactionRadius: number;
};

export const TOWN_DESTINATIONS: TownDestination[] = [
  { id: "home", label: "우리 집", route: "/", position: { x: 18, y: 27 }, entrance: { x: 25, y: 48 }, interactionRadius: 10 },
  { id: "style", label: "스타일 숍", route: "/avatar", position: { x: 76, y: 25 }, entrance: { x: 72, y: 48 }, interactionRadius: 10 },
  { id: "race", label: "레이싱장", route: "/race", position: { x: 82, y: 70 }, entrance: { x: 70, y: 72 }, interactionRadius: 11 },
  { id: "greenhouse", label: "식물하우스", route: "/greenhouse", position: { x: 19, y: 73 }, entrance: { x: 30, y: 72 }, interactionRadius: 11 },
];

export function clampTownPoint(point: TownPoint): TownPoint {
  return { x: Math.max(0, Math.min(100, point.x)), y: Math.max(0, Math.min(100, point.y)) };
}

export function townDistance(from: TownPoint, to: TownPoint) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

export function movementDurationMs(distance: number) {
  return Math.round(Math.max(180, Math.min(900, 180 + distance * 11)));
}

export function getTownDestination(id: TownDestinationId) {
  return TOWN_DESTINATIONS.find((item) => item.id === id)!;
}
```

- [ ] **Step 4: Run GREEN**

Run the same Node test. Expected: 5 pass, 0 fail.

- [ ] **Step 5: Type-check domain module**

```bash
npx tsc src/lib/town-world.ts --noEmit --strict --target ES2022 --module ESNext --moduleResolution Bundler --skipLibCheck
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```text
Add tested town movement model
```

---

### Task 2: Upgrade Avatar Catalog Metadata Without Breaking Saves

**Files:**
- Modify: `src/lib/avatar-system.test.mjs`
- Modify: `src/lib/avatar-system.ts`

**Interfaces:**
- Extend `AvatarItem` with `styleKey: string`, `setId: "everyday" | "sport" | "street" | "hero"`, `tier: 1 | 2 | 3 | 4`.
- Keep all existing `id`, `category`, `name`, and `price` values compatible with persisted state.
- `AvatarCharacter` later consumes `getAvatarItem(...).styleKey`.

- [ ] **Step 1: Add failing metadata tests**

Append:

```js
test("every avatar item has a renderable style key and coordinated set", () => {
  const sets = new Set(["everyday", "sport", "street", "hero"]);
  for (const item of AVATAR_ITEMS) {
    assert.equal(typeof item.styleKey, "string");
    assert.ok(item.styleKey.length > 0);
    assert.ok(sets.has(item.setId));
    assert.ok([1, 2, 3, 4].includes(item.tier));
  }
});

test("legacy equipped ids still normalize unchanged", () => {
  const legacy = {
    ownedItems: ["hair-crown", "top-hero", "bottom-gold", "shoes-rocket"],
    equipped: { hair: "hair-crown", top: "top-hero", bottom: "bottom-gold", shoes: "shoes-rocket" },
  };
  assert.deepEqual(normalizeAvatarState(legacy).equipped, legacy.equipped);
});

test("premium items have premium visual tiers", () => {
  for (const item of AVATAR_ITEMS.filter((entry) => entry.price >= 900)) assert.ok(item.tier >= 3);
});
```

- [ ] **Step 2: Run RED**

```bash
node --experimental-strip-types --test src/lib/avatar-system.test.mjs
```

Expected: metadata assertions fail.

- [ ] **Step 3: Add metadata to all 22 existing items**

Use stable keys such as `hair-short`, `hair-swoop`, `hair-spike`, `hair-blue`, `hair-star`, `hair-crown`; `top-basic`, `top-green`, `top-red`, `top-hoodie`, `top-rainbow`, `top-hero`; equivalent bottom/shoes keys. Assign free/basic pieces to everyday/sport tiers 1-2, hoodie/jeans to street tier 2-3, crown/hero/gold/rocket to hero tier 4. Do not rename persisted ids.

- [ ] **Step 4: Run GREEN**

Expected: all avatar tests pass.

- [ ] **Step 5: Commit**

```text
Add coordinated avatar style metadata
```

---

### Task 3: Replace Emoji Avatar With Layered Vector Character

**Files:**
- Rewrite: `src/components/AvatarCharacter.tsx`

**Interfaces:**
- Preserve props exactly: `equipped`, optional `size`, `power`, `className`.
- Consume catalog `styleKey` values.
- Produce no Unicode glyph as the primary hair/top/bottom/shoes representation.

- [ ] **Step 1: Preserve the external component contract**

Keep:

```ts
type AvatarCharacterProps = {
  equipped: AvatarState["equipped"];
  size?: "sm" | "md" | "lg";
  power?: "normal" | "invincible" | "flying";
  className?: string;
};
```

- [ ] **Step 2: Implement layered SVG/CSS shapes**

Render one SVG viewBox such as `0 0 120 180` with stable groups for shadow, legs/shoes, torso/top, head, hair, and power effects. Use small switch/helper functions keyed by `styleKey` to choose fills, paths, jackets/hoods, stripes, capes, crowns, boots, and rocket-shoe accents. Keep face geometry constant so mixed items still read as one character.

Required fallback pattern:

```ts
function styleKeyFor(equipped: AvatarState["equipped"], category: keyof AvatarState["equipped"]) {
  return (getAvatarItem(equipped[category]) ?? getAvatarItem(DEFAULT_AVATAR.equipped[category])!).styleKey;
}
```

Use SVG decorative nodes with `aria-hidden="true"`; keep the wrapping element `role="img" aria-label="꾸민 캐릭터"`.

- [ ] **Step 3: Verify TypeScript/build catches renderer errors**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```text
Replace emoji avatar with layered character art
```

---

### Task 4: Upgrade Style Shop To Worn Previews

**Files:**
- Modify: `src/routes/avatar.tsx`

**Interfaces:**
- Use `AvatarCharacter` for each candidate preview.
- Preserve `buyAvatarItem` / `equipAvatarItem` behavior and messages.

- [ ] **Step 1: Remove emoji-led category/item rendering**

Change category data to labels only and replace each `item.visual` display with a preview-equipped state:

```ts
const previewEquipped = { ...state.avatar.equipped, [item.category]: item.id };
<AvatarCharacter equipped={previewEquipped} size="sm" />
```

- [ ] **Step 2: Add coordinated set cues without new economy rules**

Show `item.setId` as friendly Korean labels such as `데일리`, `스포츠`, `스트리트`, `히어로`; display a subtle `추천 조합` row derived from the four sets but do not create bundle purchasing.

- [ ] **Step 3: Keep status hierarchy explicit**

Each card must still show one of `입는 중`, `가지고 있어요`, `무료`, or formatted price. Keep minimum touch size large and use equipped border/background as before.

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```text
Show wearable previews in style shop
```

---

### Task 5: Build Tap-To-Walk Town Hub And Mobile Interaction Hardening

**Files:**
- Create: `src/components/TownWorld.tsx`
- Rewrite: `src/routes/index.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- `TownWorld` props: `{ equipped: AvatarState["equipped"]; onNavigate: (route: "/avatar" | "/race" | "/greenhouse") => void }`.
- Consume `TOWN_DESTINATIONS`, `clampTownPoint`, `townDistance`, `movementDurationMs`.

- [ ] **Step 1: Implement safe movement state in `TownWorld`**

Use a start point around `{ x: 42, y: 58 }`. On world click, convert `clientX/clientY` using the world bounding rectangle into normalized coordinates, clamp, cancel any pending navigation timer, and set the new target. Destination button clicks stop propagation and target the destination entrance.

Core timer discipline:

```ts
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const clearPending = () => {
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = null;
};
useEffect(() => clearPending, []);
```

For destination taps, calculate distance, set movement target, then invoke `onNavigate(route)` after `movementDurationMs(distance)` unless route is `/`.

- [ ] **Step 2: Render a compact town, not cards**

Create visual zones for house, shop, race gate, greenhouse, paths, grass, trees, and small decorative props using CSS/div/SVG shapes. Destination controls are semantic `button type="button"` elements with generous absolute hit areas and concise visible labels.

Place `AvatarCharacter` absolutely at target coordinates with CSS transitions and a `.town-avatar--walking` class while movement is active.

- [ ] **Step 3: Replace root launcher with HUD + `TownWorld`**

Use TanStack `useNavigate` in `src/routes/index.tsx`. Keep current money, ticket progress/status, and ticket purchase available in compact HUD/panel form, but remove the three activity cards. Render hint copy `가고 싶은 곳을 눌러봐!`.

- [ ] **Step 4: Add scoped touch hardening**

Add to `src/styles.css`:

```css
.game-surface {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

.game-surface button,
.game-surface [role="button"] {
  touch-action: manipulation;
}

.game-surface img,
.game-surface svg {
  -webkit-user-drag: none;
}

@media (prefers-reduced-motion: reduce) {
  .town-avatar {
    transition-duration: 1ms !important;
    animation: none !important;
  }
}
```

On the town world root, add `onContextMenu={(event) => event.preventDefault()}` rather than disabling context menus globally.

- [ ] **Step 5: Run full domain regression tests**

```bash
node --experimental-strip-types --test src/lib/*.test.mjs
```

Expected: all town/avatar/race/race-scene tests pass.

- [ ] **Step 6: Run lint**

```bash
npm run lint
```

Expected: exit 0, or document clearly if failures are pre-existing and prove no new lint errors were introduced.

- [ ] **Step 7: Run production build**

```bash
npm run build
```

Expected: exit 0.

- [ ] **Step 8: Inspect for forbidden inputs and emoji-avatar remnants**

```bash
grep -R "<input\|<textarea\|item.visual" -n src/routes/index.tsx src/routes/avatar.tsx src/components/TownWorld.tsx src/components/AvatarCharacter.tsx
```

Expected: no text input/textarea and no `item.visual` usage in the redesigned avatar/shop/town surfaces.

- [ ] **Step 9: Commit integration**

```text
Turn home into tap-to-walk Hyunjun town
```

---

### Task 6: Final Verification, Review, PR, And Merge

**Files:**
- No new functional files unless verification exposes defects.

**Interfaces:**
- Final branch must remain compatible with Lovable published history.

- [ ] **Step 1: Run final verification from a clean working tree**

```bash
node --experimental-strip-types --test src/lib/*.test.mjs
npm run lint
npm run build
git status --short
```

Expected: tests/build pass and no unintended working-tree changes remain.

- [ ] **Step 2: Review the final diff against the spec**

Confirm all 10 acceptance criteria in `docs/superpowers/specs/2026-09-12-hyunjun-town-hub-design.md` are represented and no race/greenhouse domain rules were changed.

- [ ] **Step 3: Push branch and open PR**

PR title:

```text
Turn home into Hyunjun town hub
```

PR body must summarize town movement, avatar redesign, mobile-callout hardening, persistence compatibility, and exact test/build evidence.

- [ ] **Step 4: Check CI and review feedback**

Do not merge while required checks or actionable review threads are unresolved.

- [ ] **Step 5: Merge with normal merge commit**

Use GitHub merge method `merge`; do not squash/rebase published history.

- [ ] **Step 6: Verify merged main**

Confirm `main` contains the merge commit and the changed files expected from this plan.
