# Tasks: build order

These milestones run **strictly in order**, one per session. Every milestone ends in a reviewable, working state. The lead reviews each one, then commits it and (from M4 on) deploys it.

| # | Milestone | Playable result |
|---|---|---|
| M0 | Scaffold, PWA shell, deploy-ready | Title → placeholder screens; installable; offline |
| M1 | Data tables, GameState, save, core logic | Economy works in tests and the debug panel |
| M2 | Art kit and Gallery | Every Bayou character and prop animated in `?scene=gallery` |
| M3 | Hunt sandbox: level, Dex, controls, HUD | Fly around a Bayou level on a phone |
| M4 | Catch loop: **first playable** | Bait, harpoon, balloons, drone, catch → **first public deploy** |
| M5 | Base hub, factory, warehouse, orders | Full loop: hunt → juice → sell |
| M6 | Workshop, levels, world map, loadout | Upgrades change gameplay; map and unlocks |
| M7 | Ghost Town + Candy Press | Area 2 |
| M8 | Frost Peak + Toxic Plant + 2 machines | Areas 3 and 4 |
| M9 | Night hunts and boss hunts | Night mode, 4 bosses |
| M10 | Missions, dailies, login, achievements, Almanac | Meta progression |
| M11 | Power-up crates, gadgets, skins | New-feature set |
| M12 | Audio, game feel, settings | Sound, music, juice, export/import save |
| M13 | Tutorial, balance, performance, release polish | Release candidate |

---

## Prompts for the user to paste into the coding agent

**Start a milestone** (replace `M#`):
```
Read AGENTS.md and follow it exactly. Your task is M# in docs/TASKS.md. Before writing any code, read every doc section listed on that task's "Read" line. When you're done, append your report to docs/PROGRESS.md, set M# to "ready for review" on the status board, and stop. Don't commit.
```

**Fix review items**:
```
Read AGENTS.md. The lead reviewed M#, see the latest "M#, Review" in docs/PROGRESS.md. Fix every open item, re-run typecheck, test, and build, append a short "M#, Fix report" to docs/PROGRESS.md, and stop. Don't commit.
```

After each one, tell Claude: **"review M#"**.

---

## Global acceptance (applies to every milestone)

- [ ] `npm run typecheck`, `npm test`, and `npm run build` all pass with zero errors.
- [ ] The Chrome console shows no errors and no new warnings during normal play.
- [ ] Layout holds at **844×390, 1280×720, 1560×720, and 1024×768**: nothing clipped, overlapping, or off-screen, and no code assumes a width of 1280.
- [ ] Portrait shows the rotate overlay. Back in landscape, everything resumes correctly.
- [ ] Everything new works with touch **and** with mouse and keyboard.
- [ ] No network requests except same-origin. No new packages unless the task allows them.
- [ ] AGENTS.md rules hold: `logic/` and `state/` contain no Phaser or DOM code, tunables live in `data/`, there's no `any`, and no original-game IP is used.
- [ ] `?debug=1` and `?scene=` still work.
- [ ] The report is appended to `docs/PROGRESS.md`.

---

## M0: Scaffold, PWA shell, deploy-ready

**Goal**: a correctly configured empty game that installs as a landscape PWA, works offline, and scales properly on every screen shape. Every later milestone builds on this, so get the foundations exactly right.

**Read**: AGENTS.md (all) · ARCH §1, §2, §3, §4 (Boot and Title rows), §5, §13 (structure only), §15, §18 · GDD §18 · `README.md`

**Allowed packages**: install **all** packages in AGENTS §3 now, at their exact versions (`npm i -E`; dev dependencies where appropriate).

**Build**
1. A Vite + TypeScript project **in the repo root** (not a subfolder). `package.json`: `"name": "undead-juice-co"`, `"private": true`, `"type": "module"`, `"engines": { "node": ">=20" }`, and the scripts exactly as in ARCH §18.
2. `tsconfig.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noImplicitOverride`, `isolatedModules`, `moduleResolution: "bundler"`, `target: "ES2022"`, `types: ["vite/client", "vite-plugin-pwa/client"]`, and include `src`, `tests`, and the root config files.
3. `.prettierrc` (`singleQuote`, `printWidth: 110`, `trailingComma: "all"`) and a `.prettierignore` covering `dist`, `node_modules`, `package-lock.json`, `docs`, `*.md`, `public`.
4. `index.html` per ARCH §15, containing `#game`, `#ui`, and `#rotate` (a "Rotate your phone" message with an inline SVG phone icon and a rotate arrow). Link the favicon and apple-touch-icon.
5. `src/config.ts`: `DESIGN_W = 1280`, `DESIGN_H = 720`, a **pure** `parseParams(search: string)` that returns `{ debug, scene, area, night, boss, seed }`, the parsed `config` object, and `debugLog()`.
6. `src/main.ts`: import `@fontsource/lilita-one`, `await document.fonts.load('48px "Lilita One"')`, create the Phaser game with the exact config from ARCH §5, then mount `UiRoot` and start the platform hooks.
7. Scenes:
   - **BootScene**: a progress bar shown for at least 300 ms, creates the `px` 1×1 transparent texture, then routes to `config.startScene`.
   - **TitleScene**: the title "Undead Juice Co." in Lilita One, the subtitle "Catch 'em. Juice 'em. Sell 'em.", a pulsing "Tap to start". The tap requests fullscreen (ARCH §15) and goes to Base.
   - **BaseScene** (placeholder): a "Go hunt" button that goes to Hunt.
   - **HuntScene** (placeholder): a **multi-touch test** that draws a circle and its id under each active pointer (up to 4), plus a **safe-frame test** that outlines the 1280×720 design area, prints the live `scale.width × scale.height` and the camera zoom, and shows four corner markers anchored to the screen edges (inset by the safe area). Include a "Back" button. Apply the camera zoom rule (ARCH §5) and re-layout on `resize`.
   - **GalleryScene** (placeholder text).
   - Register scene keys in `scenes/keys.ts`.
8. `platform/`: `safeArea.ts`, `orientation.ts` (overlay and pause event), `fullscreen.ts`, `haptics.ts`, `pwa.ts` (update and offline toasts), `lifecycle.ts` (a visibility event emitter), `backButton.ts` (a minimal history stack helper).
9. `ui/`: `styles.css` with the CSS variables from GDD §19, `dom.ts` (`h()`), `Toast.ts`, and a `UiRoot.ts` skeleton exposing `toast(text, opts?)`.
10. Debug: with `?debug=1`, show an FPS meter in a corner, and enable `arcade.debug` in the physics config (Arcade physics enabled with gravity y 1600 from `data/balance.ts`; create that file now with just the gravity constant).
11. PWA: configure `vite-plugin-pwa` per ARCH §18. Create `public/icon.svg`, an **original** app icon: a cartoon green zombie hand gripping a juice bottle with a straw, on a `#1a1226` rounded square with a coin-yellow rim. Add `pwa-assets.config.ts` using the `minimal2023Preset`, run `npm run icons`, and leave the generated PNGs in `public/` (the lead commits them). Add `public/.nojekyll`.
12. Tests: `tests/config.test.ts` for `parseParams`, plus empty `tests/helpers/` files for `fakeClock.ts` and `memoryStorage.ts` with a minimal working implementation.
13. `README.md`: fill in the "Run it locally" section.

**Acceptance**
- [ ] `npm run dev` opens `http://localhost:5173/undead-juice-co/`. The Title fills the screen with no scrollbars at all four global sizes.
- [ ] Title → tap → Base → Go hunt → the pointer test shows several simultaneous pointers (the lead checks on a real phone over LAN with `npm run dev`).
- [ ] When the window is resized, the safe-frame test shows no letterboxing, the corner markers stay in the corners, and the zoom equals `height / 720`.
- [ ] Portrait shows the rotate overlay, and it disappears in landscape.
- [ ] `npm run build` → `dist/` contains `manifest.webmanifest`, `sw.js`, and the icons. On `npm run preview`, Chrome's Application tab shows a valid manifest (no errors, installable), an active service worker, and the app reloads **offline** (with Lilita One still rendering).
- [ ] `?debug=1` shows FPS. `?scene=gallery` boots straight into the Gallery.
- [ ] Every asset URL works under `/undead-juice-co/`.

**Out of scope**: real data, art, gameplay, and menus.

---

## M1: Data tables, GameState, save, core logic

**Goal**: the entire non-visual brain of the game (data, rules, persistence), fully unit tested. Nothing visual except a debug panel.

**Read**: GDD §6.9–§6.12, §7, §8, §10, §11, §12, §15.1 · ARCH §2, §6, §7, §8, §9, §16

**Build**
1. `data/ids.ts` and `data/types.ts` exactly per ARCH §8.
2. Data tables transcribed **exactly** from the GDD: `zombies.ts` (all 21, with a `look` that fits the GDD Look column and your own funny one-line `blurb` for each), `bosses.ts` (4), `areas.ts` (4, with GDD §8 palettes and terrain params of your choosing that respect step height ≤ 120; add `playable: boolean`, true only for bayou), `machines.ts`, `products.ts` (27, with ingredient order as in the GDD), `upgrades.ts` (7, with effect functions), and `balance.ts` (every constant from GDD §6: hero, bait, lure, balloons, harpoon flight, drone, trap, stun, combo, overflow, hunt-end bonus).
3. `logic/`: `rng.ts`, `numbers.ts` (`niceRound`, `formatCoins` → `999`, `1,234`, `12.3K`, `1.2M`), `economy.ts`, `production.ts`, `orders.ts`, `xp.ts`, `combo.ts`, per ARCH §9.
4. `state/`: `emitter.ts`, `result.ts`, `clock.ts`, `saveSchema.ts` (**the full v1 `SaveData` from ARCH §6.1**, every field with a default, so later milestones mostly don't need migrations), `save.ts`, `migrations.ts` (the framework, plus a test-only v0 → v1 example), and `GameState.ts` with every method listed in ARCH §6 (`track()` is an internal no-op hook for now; M10 fills it in).
5. Starting state per GDD §11. Orders: 3 generated at first launch.
6. `ui/debug/DebugPanel.ts` (only with `?debug=1`): **+1,000 coins**, **+50 plutonium**, **+500 XP**, **fill storage** (random unlocked zombies up to capacity), **skip time +1h**, **skip time −1h** (rollback test), **reset save**. Also expose `window.__state` in debug only.
7. Tests (vitest) covering everything in ARCH §16 that exists so far. Include these exact expectations:
   - `upgradeCost` for levels 2..max:
     harpoon `[150,260,430,740,1250,2150,3600,6150,10500]` · jetpack `[120,200,330,540,890,1450,2400,4000,6600]` · armor `[300,600,1200,2400]` · bait_bag `[100,180,320,580,1050]` · trap_kit `[200,380,720,1350]` · drone `[250,450,810,1450]` · storage `[200,300,450,680,1000,1500,2300,3400,5150]`
   - `xpToNext(1..10)` = `[40,113,208,320,447,588,741,905,1080,1265]`. Total XP to reach level 5 is 681, and level 10 is 4442.
   - `comboMultiplier(1)=1`, `(3)=1.5`, `(9)=3`, `(20)=3`.
   - Jobs: progress is correct across a simulated offline gap, and clamped at 0 when the clock moves backwards.
   - The same seed always produces the same order.
   - Save round-trip, corrupt JSON recovery, export → import round-trip, and a tampered code being rejected.
   - `recordCatch` on full storage returns overflow coins (50% of the cheapest product using that zombie).

**Acceptance**
- [ ] At least 40 meaningful assertions, all passing. Every table matches the GDD (spot-checked by the lead).
- [ ] With `?debug=1`, the debug panel buttons work and changes survive a reload.
- [ ] Corrupting `localStorage['ujc.save']` by hand and reloading starts a fresh game with a toast and no crash.
- [ ] `logic/` and `state/` have zero imports of `phaser` or DOM globals (the lead greps for them).

**Out of scope**: missions, achievements, gadgets, skins, and their data (M10 and M11). Visual UI beyond the debug panel.

---

## M2: Art kit and Gallery

**Goal**: the procedural art pipeline and every Bayou-era visual, reviewable in isolation. The look of the whole game is set here, so take care.

**Read**: GDD §3, §7.1 (Bayou rows and the Look column), §8 (Bayou palette), §19 · ARCH §5, §12

**Build**
1. `art/palette.ts`, `art/svg.ts`, `art/catalog.ts`, `art/atlas.ts` (shelf packer, 2 px padding, progress callback, build time measured), wired into BootScene's progress bar.
2. **Dex** (classic skin) rig parts: head (goggles, hair), torso (jumpsuit), backpack jetpack plus a separate flame part, upper and lower arms, the harpoon gun (attached to the front arm, rotatable to an aim angle), and legs.
3. **Bolt** rig: round body, big eye with a separate pupil, side thrusters, suction nozzle, plus an `fx_beam` suction beam.
4. **Zombie part system** driven by `ZombieLook`. Implement every body, head, legs, and accessory variant needed by the 5 Bayou zombies (shambler, sprinter, mudlurker, hopper, glowbug). Structure it so later areas can add variants without touching the existing ones.
5. Props: mound (idle and bubbling frames), brain bait, glow bait, trap (open and sprung), net, balloon (5 colors), harpoon dart, coin (2 shine frames), crate, "!" alert, particles (dirt, splash, sparkle, puff), landing pad, dead tree, lily pad, hanging moss, log platform, Bayou ground top edge and a ground fill tile.
6. Bayou backgrounds: sky (720 tall vertical gradient, with sun or moon), far layer and mid layer (tileable, 1024 wide).
7. UI icons (`parts/icons.ts`, reused by DOM and HUD): coin, plutonium, brain bait, glow bait, trap, gadget, pause, flag, settings, storage, factory, workshop, orders, almanac, missions, hunt, map, lock, check, star, sound-on, sound-off, music, back, close, plus, timer.
8. `Rig.ts`, `rigDefs.ts`, and `rigAnims.ts` per ARCH §12. Zombie animations: idle, walk, run, eat, alert, struggle, float, emerge, burrow, fly. Dex animations: idle, run, fly (flame on), throw, stunned, plus `aimAt(angle)` for the gun arm.
9. **GalleryScene**: a grid of every rig. Tapping a rig cycles its animations, with a label showing the current one. Add a facing toggle, a `lookAt` that follows the pointer, a props strip, a Bayou parallax preview that auto-scrolls, and a label with the atlas page count and build time in ms. The debug panel gets an **Icons** button that shows every DOM icon.

**Acceptance**
- [ ] `?scene=gallery` shows Dex, Bolt, all 5 Bayou zombies, every prop, and the Bayou parallax. Every animation plays smoothly, with no gaps or detached parts at the joints, and the feet stay on the baseline.
- [ ] Matches GDD §19: `#1f1430` outline, about 4 px thick, shade and highlight on fills, googly eyes whose pupils follow `lookAt`.
- [ ] The 5 zombies are clearly distinct by silhouette and color at 50% scale.
- [ ] Every sprite comes from atlas pages, not individual textures. Atlas build takes under 1.5 s with Chrome at 6× CPU throttle (report the number).
- [ ] The lead will do a visual review here. Expect a round of art feedback.

**Out of scope**: gameplay, other areas' art, and the base, machine, and product art (M5).

---

## M3: Hunt sandbox: level, Dex, controls, HUD shell

**Goal**: flying Dex around a generated Bayou level on a phone feels great.

**Read**: GDD §5, §6.1, §6.2, §8 (Bayou) · ARCH §4, §5, §10.1, §10.3, §11, §15

**Build**
1. `logic/levelgen.ts` per ARCH §9, with tests that run **200 seeds per area** and check every invariant.
2. `game/Level.ts`: a static group from the layout, ground drawing (fill tile plus top-edge sprites), one-way log platforms, water hazards with an animated surface, props in the back and front layers. `game/Parallax.ts`.
3. `game/Player.ts` (physics proxy + rig): acceleration and run speed, gravity, jetpack thrust and fuel with regen (values from `balance.ts`, gear from `gearStats(upgrades)`), water slow, ceiling, facing, landing squash, jetpack flame particles, and a fuel arc above the head.
4. A landing pad at the start, with Bolt following Dex (simple follow for now).
5. Camera per ARCH §5 (zoom rule, follow lerp, deadzone, bounds).
6. `input/`: `InputState`, `TouchControls` (floating joystick, aim stick that rotates Dex's gun and draws the dotted trajectory preview, and bait, trap, and gadget buttons with placeholder counts), and `KeyboardControls`.
7. `HuntHudScene`: pause (top-left), a catches counter placeholder, the return flag (top-right), and button placement per GDD §5. Re-layout on `resize`, keep clear of safe areas, and support left-handed mirroring (read from settings; add a debug toggle for testing).
8. The **Pause** DOM panel: Resume, Quit hunt (→ Base). Auto-pause on `visibilitychange: hidden` and on going portrait.
9. `?scene=hunt&area=bayou[&seed=N]` starts here directly.

**Acceptance**
- [ ] Moving across the full 5200 px level runs at a steady 60 fps on desktop at 4× CPU throttle. The parallax reads correctly.
- [ ] Every step can be jetpacked over. Platforms can be passed through from below and stood on from above. Dex can't leave the level or fly above the ceiling.
- [ ] **Multi-touch**: moving with the left thumb while aiming with the right works at the same time (the lead tests on a phone).
- [ ] The joystick appears where the thumb lands, the dead zone feels right, releasing stops Dex, and pushing up fires the jetpack.
- [ ] Pressing a button never starts the aim stick.
- [ ] Keyboard and mouse work. The HUD is correct at all global sizes and in left-handed mode.
- [ ] Levelgen tests pass for 200 seeds.

**Out of scope**: zombies, firing projectiles, bait, and catching (M4).

---

## M4: Catch loop (first playable)

**Goal**: the core fantasy. Find, lure, harpoon, lift, catch, and get rewarded. This is the most important milestone, and it should feel juicy.

**Read**: GDD §6 (all), §7.1–§7.2 (shambler, sprinter, mudlurker, hopper; leave glowbug for M9), §10.2 (overflow) · ARCH §6 (`recordCatch`), §10 (all)

**Build**
1. `logic/huntgen.ts` plus tests (weights respected over 10k draws, within ±3%).
2. `Zombie.ts` (the core state machine from GDD §6.5, with emerging from behind the ground layer), `ZombieManager.ts`, the core `flee` behavior (including burrow-and-rebury), and `behaviors/leap.ts`.
3. Mounds that bubble when Dex is within 400 px.
4. `Bait.ts`: throw arc, landing, pile lifetime, and lure resolution (≤ 2 nearest matching zombies within 240 px). Counts come from gear.
5. `Harpoon.ts` (pooled darts with gravity and max flight), aim assist, a reload ring on the HUD, and `Balloon.ts` (attaches to the zombie rig with a string, has a pop timer and slow effect, stacks neatly). LIFTING.
6. `Drone.ts`: follows Dex, grab queue, suction beam, shrink-into-nozzle, return.
7. `Trap.ts`: place, arm, catch (net art).
8. `Coin.ts` burst and homing. Combo (`logic/combo`) with a HUD combo meter. `state.recordCatch` plus XP through the state. Overflow toast.
9. `Radar.ts` edge arrows (buried within radar range, plus emerged zombies off-screen).
10. `Fx.ts`: dirt burst, balloon pop, sparkle, coin number pop-ups, screen shake (respects the setting).
11. `HuntDirector.ts`: places spawns on levelgen mounds, handles catches, the AREA CLEARED banner with the +20% bonus, the return flag (with a confirm modal), and the **Summary** DOM panel per GDD §6.10 (no missions section yet). Hunt again uses a new seed.
12. HUD: remaining `n/total`, bait and trap counts, reload ring, combo meter.
13. Debug panel: **spawn test zombie** (a shambler with hp 3, near Dex) for testing multiple balloons, and **show gear stats**.

**Acceptance**
- [ ] The full loop works: arrow → mound → bait → emerge (from behind the ground) → eat → shoot → balloons → lift → Bolt grabs → coins fly to Dex → storage increases (check with `__state`).
- [ ] Shamblers flee slowly, Sprinters are fast, Mudlurkers burrow after 4 s and can be lured again, and Hoppers leap away from incoming darts.
- [ ] Balloons pop after 4 s each. The hp 3 test zombie needs 3 balloons that stay up at the same time.
- [ ] Traps catch ground zombies. Bait counts and trap counts go down and are shown.
- [ ] The combo grows on catches within 5 s, and the multiplier and its effect on coins are visible.
- [ ] Clearing the area shows the banner, then the summary, with correct totals. Hunt again works. Quitting halfway keeps the catches.
- [ ] Storage overflow sells the zombie and shows a toast.
- [ ] With 8 zombies plus effects, it holds 60 fps on desktop at 4× throttle (the lead also tests on a phone).
- [ ] **After approval, the lead deploys the first public build.**

**Out of scope**: the base and factory UI (M5), upgrades and map (M6), audio (M12).

---

## M5: Base hub, factory, warehouse, selling, orders

**Goal**: the economy half of the loop, and a base that feels like home.

**Read**: GDD §10, §11, §18, §19 · ARCH §4, §6, §7, §13, §15 (`backButton`, `lifecycle`)

**Build**
1. Art: the yard background (1600 wide), landing pad with Bolt, storage silo, factory shed, workshop garage, orders board, almanac crate and book, art for all 4 machines (only owned ones show), and product icons (bottle, candy, cup, snack, tinted by main zombie).
2. **BaseScene**: drag to pan when the screen is narrower than 1600, tappable buildings with press feedback, a "ready" bubble over the factory when any job is done, the Juicer animated while working, and an idle Bolt.
3. DOM: **TopBar** (coins and plutonium with count-up animation, level and XP bar, storage `n/cap`), **Dock** (GDD §10.1), and toasts.
4. Panels:
   - **Storage**: a Zombies tab, and a Warehouse tab with Sell 1 and Sell all.
   - **Factory**: machines with their slots. An empty slot opens the recipe picker (inputs as have/need, output, time, price). A running slot shows a progress bar, time remaining, and speed-up (with plutonium cost and a confirm). A done slot shows Collect. Also: Collect all, buy machine, and buy slot (showing requirements).
   - **Orders**: 3 slots (lines as have/need, reward, Fulfill, Decline, refill countdown) and Refresh all (2 plutonium).
5. `state.tick()` every second while visible. A **Welcome back** modal per ARCH §7.
6. Android back closes the top panel. The Hunt summary's **Base** button returns here. Dock "Hunt" starts a Bayou day hunt directly (the map comes in M6).

**Acceptance**
- [ ] Loop: hunt → storage → start jobs → close the tab, wait (or debug +1h), reopen → Welcome back → collect → sell or fulfill an order → coins go up.
- [ ] Timers are right after a reload, after skip +1h, and after skip −1h (no negatives, no NaN).
- [ ] Speed-up charges the right plutonium. Fulfill checks stock. Refill countdowns are correct.
- [ ] At 844×390 every panel fits, scrolls by touch, and every button is at least 44 px.
- [ ] The back button closes panels. The numbers in the TopBar always match the state.

---

## M6: Workshop, levels, world map, loadout

**Goal**: progression that you can feel.

**Read**: GDD §8 (World map), §11, §12, §15.1, §18 · ARCH §4, §10.2, §13

**Build**
1. **Workshop** panel, Upgrades tab: all 7 upgrades with level, current → next effect in plain words ("Reload 1.20 s → 1.12 s"), cost, Buy, and a MAXED state.
2. Gear wiring: everything in GDD §12 changes gameplay (reload, dart speed, balloons per hit, fuel, thrust, bait per hunt, traps per hunt, radar range, drone speed, storage capacity, and stun duration, which is stored now and used once projectiles exist).
3. **Level-up** modal with rewards (GDD §15.1). The TopBar's level bar animates.
4. **WorldMapScene**: a map illustration (a winding path through 4 area vignettes) with nodes showing the lock state and requirements. **Unlock** (coins + level, with a confirm). **Day** opens the Loadout. **Night** and **Boss** buttons appear locked with their requirement text (M9 builds them). Areas with `playable: false` show "Coming soon".
5. **Loadout** panel: area and mode, brain bait count, trap count, a Start button. (Glow bait and gadget selection get added in M9 and M11.)
6. The Dock's Hunt button now opens the Map.

**Acceptance**
- [ ] Buying each upgrade changes gameplay in a measurable way (the debug gear-stats readout matches GDD §12 at every level).
- [ ] Costs match the M1 tables. The level-up modal fires once per level with the right rewards (including +5 plutonium at every 5th level).
- [ ] Unlocking an area persists after a reload. Requirements are enforced.

---

## M7: Ghost Town + Candy Press

**Read**: GDD §6.8, §6.12, §7 (ghost_town rows; throw, roll, fly; hp > 1), §8, §10.3–§10.4 · ARCH §10.4, §12

**Build**
1. Art: Ghost Town backgrounds and props (boardwalk and rooftop platforms, barrels, cacti, tumbleweed, water tower), the tosser, bruiser, dustrunner, and specter looks with their new variants, a trash projectile, Dex's stunned look, the Candy Press, and candy icons.
2. Behaviors: `throw` (a pooled `Projectile`, stun from gear `stunMs`, knockback, stunned animation, haptic), `roll`, `fly` (altitude bob, comes down to eat, ignores traps).
3. Terrain for Ghost Town. The previous-area mix in huntgen (15%).
4. The Candy Press can be bought, and mixed recipes work. Set `playable: true`.

**Acceptance**
- [ ] Each new type behaves per GDD §7. Stun works, and higher Armor levels shorten it.
- [ ] Specters need jetpack height or upward aim. Bruisers visibly stack 3 balloons.
- [ ] Ghost Town looks clearly different from Bayou. Two-input recipes work. Performance holds.

---

## M8: Frost Peak + Toxic Plant (+ Slush Blender, Snack Lab)

**Read**: GDD §6.2 (ice, toxic), §7 (frost and toxic rows; slide, blink, split, gasOnHit, shieldFront), §8, §10 · ARCH §10

**Build**
1. Art for both areas (backgrounds, props, the skater, snowballer, yeti, frostwisp, splitter, splitling, blinker, bloater, and mecha), a snowball projectile, a gas cloud, both machines, and their product icons.
2. Behaviors: `slide`, `blink` (with its tell), `split` (spawns splitlings; the whole-catch rule), `gasOnHit` with `GasCloud`, `shieldFront` (clang effect, angle rule).
3. Hazards: ice (low friction for Dex), toxic puddles (slow). The snowball hit shows a frozen stun look.
4. Both machines can be bought. Both areas `playable: true`.

**Acceptance**
- [ ] Every type behaves per GDD. A whole Splitter can be caught with balloonsPerHit ≥ 2 or with a trap.
- [ ] The shield deflects frontal hits and accepts hits from behind or above.
- [ ] Ice and toxic feel different. All recipes work.

---

## M9: Night hunts and boss hunts

**Read**: GDD §6.4, §6.12, §7.3, §8 (map buttons), §9 · ARCH §5 (depth), §10

**Build**
1. `NightOverlay`: a RenderTexture of darkness with erased lights for Dex, bait piles, glowing zombies, and coins, plus a night tint on the backgrounds.
2. Night zombies with art: glowbug, phantom (`phase`), aurora, and ghoul. Glow bait as a consumable (bought in Loadout for 60 coins). Long-press the bait button to choose the bait type.
3. Night composition, ×1.5 coins and XP, and a `nightHunts` stat.
4. **Bosses**: a 2-screen arena layout, 4 boss rigs (about 2.5× scale), behaviors (`summon`, `shakeOff`, `barrage`, `slam` with a shockwave that doesn't hurt an airborne Dex, `gasTrail`), a boss bar on the HUD, trap and net immunity, a catch cinematic (brief slow-mo, zoom, Bolt straining), first and repeat rewards. Catching a boss unlocks that area's night. The boss unlocks at 25 area catches.
5. The map's Night and Boss buttons now work.

**Acceptance**
- [ ] Night is dark but readable, and holds 60 fps at 4× throttle.
- [ ] Each boss can be caught with reasonable upgrades (the lead tests with debug gear). Rewards and unlocks are correct.

---

## M10: Missions, dailies, login streak, achievements, Almanac

**Read**: GDD §15 (all) · ARCH §6 (`track`, `GameEvent`), §9

**Build**
1. Data: `missions.ts` (30 story missions), `daily.ts`, `login.ts`, `achievements.ts`.
2. Pure logic with tests: mission progress counted from activation, state-check missions, the daily reset at local midnight, streak with missed-day reset, achievements, and Almanac mastery tiers.
3. `GameState.track()` wired to every `GameEvent` source.
4. UI: a **Missions** panel (story card with a Bolt bubble and Claim; dailies with the bonus chest; achievements with Claim; login calendar), the daily-login modal, the **Almanac** panel (grid with silhouettes, detail page, mastery tier, the products that use each zombie), the mastery bonus applied to sell prices and orders, mission ticks on the hunt Summary, and a Bolt mission bubble on the Base.

**Acceptance**
- [ ] Progress, claims, and resets are all correct, including after debug time skips. Mastery bonuses are visible and applied. Tests cover the logic.

---

## M11: Power-up crates, gadgets, skins

**Read**: GDD §13, §14, §16 · ARCH §10

**Build**
1. Crates (Bolt airdrop, opened by touch or dart) with the 4 power-ups, HUD timers, and visuals (blue tint for slow-mo, golden coins, a rapid-fire muzzle effect).
2. Gadgets: tranq dart, sticky goo, and net launcher (art and effects). A Workshop **Gadgets** tab (level gates, buy), gadget select in Loadout, and the HUD gadget button with charges.
3. Skins: 6 Dex variants (palette plus hat). A Workshop **Skins** tab (preview, buy with plutonium, equip). The equipped skin is used everywhere. The Gallery shows all skins.

**Acceptance**
- [ ] Everything matches the GDD numbers. Nets catch hp ≤ 2 instantly and give heavier zombies +2 balloons. Bosses are immune to nets.

---

## M12: Audio, game feel, settings

**Read**: GDD §17, §19 (juice), §20 · ARCH §14, §15

**Build**
1. `AudioManager`, every SFX in GDD §20, the music sequencer with 4 tracks, hooked up across gameplay and UI.
2. A feel pass: squash and stretch, landing dust, a 40 ms hit-stop on catch, button press animations, and panel open and close transitions (respecting reduced motion and the shake setting). Haptics hooks.
3. **Settings** panel: every toggle in GDD §17, export (copy to clipboard with a select-text fallback), import (textarea → validate → confirm → reload), reset (typing RESET), and credits.

**Acceptance**
- [ ] No audio before the first tap. Nothing plays while muted or while the tab is hidden. The jetpack loop never stutters.
- [ ] Settings persist. Exporting and then importing in a fresh browser profile restores the save exactly.

---

## M13: Tutorial, balance, performance, release polish

**Read**: GDD §21, §22 · ARCH §17 · AGENTS §5

**Build**
1. The tutorial per GDD §21: hunt mode `tutorial`, HUD hint overlays, Bolt bubbles, DOM spotlights for the base steps, Skip, and resuming after a reload.
2. `tests/balance.report.test.ts` (runs only when `BALANCE=1`): prints a table of the estimated time to each area unlock from average hunt yields, for the lead's tuning.
3. A performance pass to ARCH §17 budgets: verify the pools, measure and report draw calls, boot time, and fps at 4× throttle. Build area atlases lazily if boot exceeds budget.
4. PWA polish: an install button in Settings (Android `beforeinstallprompt`; iOS "Share → Add to Home Screen" instructions), and update and offline-ready toasts checked.
5. Run a final QA checklist yourself and include it in the report.

**Acceptance**
- [ ] A new player can finish the tutorial on a phone without help.
- [ ] Boot to Title takes under 3 s on a mid-range phone (the lead tests). No console errors over a 30-minute session.
- [ ] The PWA installs and plays offline.
