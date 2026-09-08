# Avatar Customization V1 Design

Date: 2026-09-09
Status: Design approved in chat; implementation pending written-spec review
Branch: `gpt/avatar-customization-v1`

## 1. Goal

Add a child-friendly 2D paper-doll avatar customization loop that feels native to the existing carrot-racer-farm game.

The new loop is:

`race / greenhouse -> earn money -> customize avatar -> buy/equip items -> use the same avatar at home and in race`

The feature must extend the current game rather than introduce a separate economy, separate visual language, or separate control model.

## 2. Existing-game compatibility contract

The implementation must preserve the current project conventions:

- Reuse the existing `GameState.money` currency and `hyunjun-game-v1` localStorage key.
- Keep existing race scoring, rewards, obstacle, invincible, flying, stage, and 800-point finish behavior unchanged.
- Do not change `src/lib/race-engine.ts` unless a strictly necessary compatibility defect is discovered.
- Keep the existing warm rounded-card visual language: `bg-card`, `bg-muted`, `bg-secondary`, `bg-accent`, large rounded corners, simple Korean labels, and touch-friendly controls.
- Keep the race interaction as one large tap/click surface. Avatar customization must not add gameplay controls inside the race.
- Reuse the current `HomeButton` navigation pattern.
- Preserve old save data. A save created before this feature must load with a valid default avatar.
- Do not manually edit generated TanStack route files.
- Preserve Lovable history: no force push, rebase, amend, or squash of published history. Merge with a normal merge commit.

## 3. Scope

V1 includes one fixed base character and four customizable equipment slots:

- Hair: 6 items
- Top: 6 items
- Bottom: 5 items
- Shoes: 5 items

Total: 22 catalog items.

Each category starts with at least two free owned choices. Remaining items are purchased permanently with existing game money.

V1 does not include:

- face/body/skin selection
- accessories such as glasses, hats, bags, pets
- randomized loot boxes
- real-money purchases
- avatar stats or gameplay power bonuses
- separate inventory pages
- separate avatar currency

## 4. Acquisition and equip rules

Each avatar item has:

- stable item id
- category
- Korean display name
- visual token used by the avatar renderer
- price
- `free` status derived from price `0`

Rules:

1. Free starter items are owned automatically.
2. Owned items can be equipped at any time.
3. An unowned paid item can be purchased only when `money >= price`.
4. Successful purchase deducts the exact price once and permanently adds the item to ownership.
5. Purchased items remain owned after equipping another item.
6. Unowned items cannot be equipped.
7. A successful purchase immediately equips the purchased item to reduce extra taps.
8. Insufficient funds leave money, ownership, and equipment unchanged and return a friendly result for the UI: `돈이 조금 더 필요해요!`.
9. Avatar items provide no score, reward, farming, invincibility, or flying advantage.

## 5. Save-state model

Extend the existing `GameState` with:

```ts
type AvatarState = {
  ownedItems: string[];
  equipped: {
    hair: string;
    top: string;
    bottom: string;
    shoes: string;
  };
};
```

The existing storage key remains `hyunjun-game-v1`.

`load()` must normalize older partial saves by creating a valid default `AvatarState` when `avatar` is absent or malformed. Existing `money`, plots, ticket state, and best run must be preserved.

The default equipped item for every slot must be included in the default owned set.

## 6. Code boundaries

### `src/lib/avatar-system.ts`

Pure avatar domain logic only:

- catalog and category types
- default avatar creation
- avatar-state normalization
- item lookup
- purchase result
- equip result

This file must not depend on React, browser APIs, TanStack Router, or localStorage.

### `src/lib/avatar-system.test.mjs`

Node tests for domain behavior.

Minimum coverage:

- catalog contains exactly 22 items with 6/6/5/5 category counts
- starter avatar owns valid free items
- all equipped defaults are owned
- successful purchase deducts money exactly once
- successful purchase owns and equips the item
- insufficient-money purchase is rejected without mutation
- already-owned purchase is not charged again
- unowned item cannot be equipped
- owned item can be equipped
- malformed/legacy avatar input normalizes safely

### `src/lib/game-state.ts`

Integrate avatar state into the existing persistence model and expose small callbacks such as:

- `buyAvatarItem(itemId)`
- `equipAvatarItem(itemId)`

The existing money operations, greenhouse behavior, ticket behavior, and race recording must remain intact.

### `src/components/AvatarCharacter.tsx`

Reusable visual renderer for the same equipped avatar across surfaces.

Rendering approach: layered React/CSS paper doll. The component receives equipped item ids plus an optional race power visual state.

The component must be usable in at least three sizes:

- compact home preview
- large customization-room preview
- race-stage preview

Race power is visual only:

- normal: ordinary avatar
- invincible: sparkle/glow treatment
- flying: wings/elevated treatment

### `src/routes/avatar.tsx`

A dedicated `내 캐릭터` room.

Layout:

- current money visible near the top
- large live avatar preview
- four simple category tabs: `머리 | 상의 | 하의 | 신발`
- item cards showing visual, name, and price/owned/equipped state
- one tap on owned item equips it
- one tap on affordable unowned item buys and equips it
- insufficient-money feedback appears inline without a modal

The page should use the same rounded cards, spacing, typography, and soft color tokens as the existing home/race/greenhouse pages.

### `src/routes/index.tsx`

Add `내 캐릭터` as a third primary home activity card and show the currently equipped avatar on the home screen.

The existing race and greenhouse cards remain recognizable and keep their current purposes.

### `src/routes/race.tsx`

Replace the generic runner emoji inside the stage scene with `AvatarCharacter`, keeping the existing stage scene model and the single large tap button.

The avatar is presentation only. `race-engine.ts` remains the source of truth for score, money, events, power duration, and finish behavior.

## 7. UX behavior

The experience should feel suitable for a child:

- immediate visual feedback after every equip
- no confirmation dialogs for low-risk in-game-money purchases
- no nested inventory management
- no delete/sell flow in V1
- large tap targets
- simple Korean labels
- visible ownership state
- visible price before purchase
- friendly insufficient-money message

Customization should feel like another room in the same cozy game, not a shop application attached to it.

## 8. Visual consistency

Do not introduce a new design system.

Prefer existing semantic utility classes and tokens already used by the project, including card, muted, secondary, accent, foreground, border, and sky treatments. New avatar-specific CSS should be narrowly scoped to paper-doll positioning and layer composition.

The avatar itself should be intentionally simple in V1. Item visuals may use CSS shapes, emoji-like visual tokens, or small inline elements, but the data/renderer boundary must allow later replacement with SVG/PNG assets without changing save-state ids or purchase logic.

## 9. Error handling and resilience

- Invalid stored avatar ids are replaced with safe category defaults during normalization.
- Duplicate ownership ids are deduplicated.
- Unknown item ids passed to buy/equip return a rejected result and do not mutate state.
- Negative or non-finite price behavior is impossible from the static catalog and should be guarded by catalog validation tests.
- localStorage failures continue to follow the existing game-state behavior and must not crash the UI.

## 10. TDD workflow

Implementation order:

1. Write avatar-domain tests first and observe RED.
2. Implement minimal `avatar-system.ts` until GREEN.
3. Refactor while keeping domain tests green.
4. Add integration tests/targeted checks for save migration and game-state callbacks where practical.
5. Implement `AvatarCharacter` and `/avatar` UI.
6. Integrate home preview and race rendering without changing race rules.
7. Run fresh domain tests and TypeScript checks.
8. Run broader project checks/build when dependencies and environment permit.
9. Open PR, inspect changed filenames and full diff, and review for accidental race/economy regressions.
10. Merge with `merge` method only after verification and verify `main` HEAD.

## 11. Acceptance criteria

The feature is complete when:

- A player can open `내 캐릭터` from home.
- The player sees one fixed base character with hair/top/bottom/shoes layers.
- Exactly 22 V1 items are available in the required category counts.
- Free starter choices can be equipped immediately.
- Paid items use the same money earned by race/greenhouse.
- Purchase ownership persists across reloads.
- Equipped appearance persists across reloads.
- The same appearance is visible in customization, home, and race.
- Race remains one-tap and existing scoring/reward mechanics are unchanged.
- A legacy `hyunjun-game-v1` save loads without losing existing progress.
- Tests and checks described in the PR are freshly verified before merge.
- Final integration is a normal merge commit on `main`, preserving Lovable history.
