# Hyunjun Town Hub redesign

Date: 2026-09-12
Status: approved design, implementation pending
Repository: `haapy-mind-life/carrot-racer-farm`

## 1. Goal

Replace the current card-menu home experience with a small, child-friendly 2D town hub where Hyunjun's avatar can walk to destinations by tapping the world. At the same time, remove mobile interactions that feel like keyboard/text/emoji selection UI and replace the current emoji-assembled avatar with a coherent layered character whose premium items visibly feel more desirable.

The redesign must keep the game's existing money, purchases, save-state, race progression, greenhouse economy, and child-friendly low-complexity interaction model.

## 2. Problems observed in the current implementation

### 2.1 Mobile interaction feels like text selection rather than a game

The main screens do not intentionally use text inputs, but the game surface currently allows normal browser selection/callout behavior. Long-press or touch interactions can therefore expose browser-level selection/context UI that feels like an unwanted keyboard or emoji/action overlay.

### 2.2 Avatar customization lacks product appeal

The current catalog stores one Unicode emoji per item and renders hair/top/bottom/shoes as stacked emoji glyphs. This makes expensive items look only marginally different from free items, and combinations do not read as a single designed outfit.

### 2.3 Home is a menu, not a world

The root route is currently a set of large cards linking to race, greenhouse, and avatar customization. The player does not move through space, visit a shop, return home, or experience destinations as locations in one game world.

## 3. Design principles

1. **Tap-first, no keyboard.** Core movement and destination access use taps/clicks only. No text entry is required for normal play.
2. **One obvious action at a time.** Avoid on-screen joysticks, D-pads, or multi-button movement controls.
3. **World before menus.** The root screen should feel like a place, not a launcher.
4. **Preserve proven systems.** Existing race engine, greenhouse state, avatar purchase/equip state, persistence, and money stay compatible.
5. **Premium must look premium.** Higher-priced appearance items need stronger silhouette, detailing, and set coherence.
6. **Child-friendly clarity.** Large destinations, forgiving hit areas, short labels, and immediate motion/feedback.

## 4. Target experience

When the game opens, Hyunjun's avatar stands in a compact town scene near his house. Visible destinations include:

- Home
- Style shop / wardrobe
- Race gate
- Greenhouse

The child taps a place or nearby ground. The avatar walks toward that point using a short animated transition. Tapping a destination causes the avatar to walk to its entrance first, then opens that activity. The interaction remains simple enough to use with one finger.

The world is intentionally compact rather than a large scrolling map. The first implementation should prioritize a readable single-screen or lightly scrolling town with only the existing major game destinations.

## 5. Navigation and movement model

### 5.1 World coordinate model

Represent the town using normalized 0-100 x/y coordinates so the same world logic can scale across common mobile and desktop sizes. Store each destination with:

- id
- label
- route
- destination x/y
- entrance x/y
- interaction radius

### 5.2 Tap movement

- Tapping walkable ground sets a movement target.
- The avatar transitions toward the target with CSS transform/position interpolation.
- Movement duration is derived from distance and clamped to a child-friendly minimum/maximum.
- A walking state adds a subtle step/bob animation.
- Rapid subsequent taps replace the prior movement target instead of queuing long paths.

### 5.3 Destination entry

- Tapping a building or activity marker sets the target to that destination's entrance.
- After the movement duration completes, navigate to the route.
- Do not instantly teleport into the activity.
- Destinations must have generous touch targets that are larger than their visible artwork.

### 5.4 No free-form obstacle/pathfinding in v1

The first version does not need A* or collision-aware pathfinding. The town layout should be designed so straight-line travel is visually plausible. If needed, movement can use one intermediate waypoint for major paths, but a general pathfinding subsystem is out of scope.

## 6. Mobile interaction hardening

Apply game-surface interaction rules so taps behave like game controls rather than selectable document text.

- `user-select: none` on interactive game surfaces.
- `-webkit-user-select: none` for Safari/WebView compatibility.
- `-webkit-touch-callout: none` where supported.
- `touch-action: manipulation` on buttons/game surfaces that do not require panning/zoom gestures.
- Prevent the browser context menu on the actual game world surface.
- Mark decorative artwork as non-draggable.
- Do not globally disable accessibility features on the entire document; scope these rules to game surfaces and keep semantic buttons/links keyboard-accessible on desktop.

This addresses browser callout/selection UI without depending on a hidden input workaround.

## 7. Avatar visual redesign

### 7.1 Replace emoji body-part rendering

`AvatarCharacter` should remain the reusable public component, but its visual implementation should become layered vector/CSS artwork instead of stacking Unicode glyphs.

The character will have stable geometry for:

- head/skin
- hair
- torso/top
- legs/bottom
- shoes
- optional power effects

Each equipment item maps to a visual style token or renderer variant, not an emoji.

### 7.2 Catalog compatibility

Keep the current item ids where practical so existing saved purchases remain valid. Extend `AvatarItem` with visual metadata such as:

- `styleKey`
- optional `setId`
- optional `rarity` or visual tier
- optional preview metadata

The old `visual` field can be removed only if migration/tests prove no persisted state depends on it. Because saved state stores item ids rather than emoji glyphs, visual migration should remain backward-compatible.

### 7.3 Outfit families

Organize the catalog into coordinated visual families. Initial examples:

- Everyday: soft neutral/green basics
- Sport: energetic athletic shapes
- Street: hoodie, layered top, denim/cargo styling
- Hero: premium, bold silhouette and accent detailing

Items can still be bought individually, but matching pieces should look intentionally compatible. Premium prices should correspond to visibly richer shapes/details rather than simple color swaps.

### 7.4 Shop preview

The customization route becomes a style shop / wardrobe.

- Keep category tabs: hair, top, bottom, shoes.
- Remove category emoji from the primary UI.
- Item cards show a small rendered character preview wearing that candidate item together with the player's currently equipped other pieces.
- Owned/equipped/price status remains clear.
- Buying an item still equips it immediately unless tests or existing behavior indicate otherwise.
- Include a few recommended full-look chips/cards if this can be implemented without introducing a separate bundle-purchase economy.

## 8. Root route redesign

Replace the existing three-card home launcher with the town hub while retaining essential economy visibility.

### Required root-screen elements

- Current money in a compact HUD.
- Hyunjun avatar rendered from the persisted equipped state.
- House, style shop, race destination, greenhouse destination.
- Tap-to-walk behavior.
- Short contextual hint such as "가고 싶은 곳을 눌러봐!" rather than multiple instructional paragraphs.
- Ticket/progress information should not dominate the world. If retained, show it as a compact HUD/status element.

### Existing ticket behavior

Do not remove or rewrite ticket economy rules as part of this redesign unless the current state contract makes the new hub impossible. Preserve `hasTicket`, `buyTicket`, and related progress semantics. The hub may reposition the ticket purchase/status UI, but this project is not an economy redesign.

## 9. Race and greenhouse integration

The race and greenhouse remain separate routes for this iteration.

- Enter them by walking to their destinations in the town.
- Keep their existing gameplay mechanics intact unless a regression fix is needed for the new avatar renderer.
- Continue using `AvatarCharacter` in race scenes so the player's outfit follows them into gameplay.
- Keep Home/back navigation functional; returning should land in the town hub.

## 10. Accessibility and resilience

- Destination hit areas should be semantic buttons or links where possible.
- All route transitions remain available to keyboard users on desktop.
- The avatar has a useful accessible label without exposing decorative SVG internals.
- Reduced-motion users should get shortened or disabled movement animation via `prefers-reduced-motion`.
- Navigation-after-animation must not fire after the component unmounts.
- Repeated taps must cancel/replace pending destination timers safely.

## 11. Testing strategy

Use TDD for new domain behavior before UI wiring.

### Domain tests

Add a small town/world module with tests for:

- coordinate clamping/normalization
- distance calculation
- movement duration bounds
- destination lookup
- destination target = entrance coordinate
- replacement/cancellation semantics represented in any pure state transition logic

Extend avatar-system tests for:

- old saved item ids still normalize correctly
- catalog items expose valid style keys
- starter equipment remains valid
- premium/set metadata is internally consistent

### UI/build verification

At minimum:

- TypeScript/Vite production build passes.
- Existing race-engine, race-scene, and avatar-system tests continue to pass.
- New town tests pass.
- Lint passes or any pre-existing lint debt is explicitly distinguished from new errors.
- Inspect changed routes/components for mobile touch behavior, semantic controls, and no accidental text inputs.

## 12. Expected files/components

Likely changes/additions:

- `src/routes/index.tsx` — town hub root screen
- `src/routes/avatar.tsx` — style shop presentation
- `src/components/AvatarCharacter.tsx` — layered vector character
- `src/components/TownWorld.tsx` or similarly focused component — world rendering and movement
- `src/lib/avatar-system.ts` — visual metadata and outfit family data
- `src/lib/town-world.ts` — pure world/destination/movement helpers
- `src/lib/town-world.test.mjs` — TDD coverage
- `src/lib/avatar-system.test.mjs` — catalog/migration assertions
- `src/styles.css` — scoped touch/callout/selection and movement styles

Avoid unrelated refactors and avoid changing race/greenhouse domain rules.

## 13. Non-goals

Not part of this iteration:

- multiplayer or NPC systems
- inventory drag-and-drop
- joystick/D-pad controls
- keyboard-driven mobile gameplay
- large open-world scrolling maps
- general pathfinding/collision engine
- new currencies or monetization systems
- rebalancing race or greenhouse economy
- replacing the framework/router

## 14. Acceptance criteria

The implementation is complete when all of the following are true:

1. Opening `/` shows a town/world, not a grid of activity cards.
2. Hyunjun's equipped avatar is visible in the town.
3. Tapping a destination visibly moves the avatar to it before route navigation.
4. Normal game taps/long presses do not expose distracting text-selection/context-callout behavior on the game world.
5. Avatar customization no longer relies on emoji glyphs as the primary visual representation of hair/clothes/shoes.
6. Item previews show coherent worn appearance, and higher-priced items have visibly richer design.
7. Existing saved avatar item ids continue to load without losing owned/equipped state.
8. Race and greenhouse mechanics still function and use the updated avatar renderer where applicable.
9. New world/avatar domain tests pass, existing domain tests pass, and production build succeeds.
10. Changes are delivered through a feature branch and pull request without rewriting published history, respecting the repository's Lovable integration contract.
