# Undead Juice Co.: Architecture

This document covers **how** the game is built. `GAME_DESIGN.md` (GDD) covers **what** it is. If they conflict on behavior, the GDD wins. If they conflict on code structure, this file wins.

---

## 1. Stack and the reasons for it

| Choice | Why |
|---|---|
| **Phaser 3.90** (Arcade Physics, WebGL with canvas fallback) | A mature 2D engine with multi-touch input, tweens, cameras, and particles. Phaser 3, not 4, because its API is stable and well documented. |
| **DOM overlay for menus** (vanilla TS and CSS) | Panels, lists, and scrolling are far easier and crisper in HTML on phones. The canvas handles gameplay and world visuals. The DOM handles menus and modals. |
| **TypeScript strict and Vite** | Fast dev loop and a typed data model. |
| **Procedural art (SVG to canvas atlas)** | No asset files and no licensing problems. Fully offline, and the files stay small. |
| **zzfx and WebAudio** | Synthesized SFX and music with no audio files. |
| **vite-plugin-pwa** | Installable, fullscreen, landscape, and offline. |
| **GitHub Pages via `gh-pages`** | Free hosting at `https://v-b1.github.io/undead-juice-co/`. The lead deploys from a local build. |

## 2. Folder layout

```
/
├─ AGENTS.md  CLAUDE.md  README.md
├─ docs/                      GAME_DESIGN · ARCHITECTURE · TASKS · PROGRESS
├─ index.html                 #game canvas parent, #ui overlay, #rotate overlay
├─ vite.config.ts             base path, PWA plugin, vendor chunk, vitest config
├─ pwa-assets.config.ts       icon generation from public/icon.svg
├─ tsconfig.json  .prettierrc
├─ public/                    icon.svg, .nojekyll, generated icons
├─ tests/                     vitest specs; mirrors src/logic and src/state
│  └─ helpers/                fakeClock.ts, memoryStorage.ts
└─ src/
   ├─ main.ts                 fonts → GameState → Phaser.Game → UiRoot → platform hooks
   ├─ config.ts               DESIGN_W/H, URL params, debug flags, debugLog()
   ├─ data/                   STATIC TABLES (no Phaser, no DOM)
   │  ├─ ids.ts               every id union type (§8.1)
   │  ├─ types.ts             definition interfaces (§8.2)
   │  ├─ balance.ts           hero, hunt, combo, and bait constants (GDD §6)
   │  ├─ zombies.ts bosses.ts areas.ts machines.ts products.ts upgrades.ts
   │  ├─ gadgets.ts powerups.ts skins.ts missions.ts daily.ts login.ts achievements.ts
   ├─ logic/                  PURE FUNCTIONS (no Phaser, no DOM): unit tested
   │  ├─ rng.ts               mulberry32 seeded RNG + helpers (pick, weighted, range)
   │  ├─ numbers.ts           niceRound, clamp, formatCoins
   │  ├─ economy.ts           upgradeCost, upgradeEffects, sellPrice (with mastery), overflowValue
   │  ├─ production.ts        job timing, progress, isDone, speedUpCost
   │  ├─ orders.ts            generateOrder, orderReward
   │  ├─ xp.ts                xpToNext, levelFromXp, levelRewards
   │  ├─ combo.ts             multiplier, window
   │  ├─ missions.ts          applyEvent → progress, isComplete (story + daily)
   │  ├─ achievements.ts  login.ts  almanac.ts
   │  ├─ levelgen.ts          seed + AreaDef → LevelLayout (pure data)
   │  └─ huntgen.ts           seed + area + mode → zombie spawn list
   ├─ state/                  PERSISTENT GAME STATE (no Phaser, no DOM)
   │  ├─ GameState.ts         the one source of truth; action methods; typed events
   │  ├─ saveSchema.ts        SaveData interface + defaultSave()
   │  ├─ save.ts              load / persist / export / import, plus corrupt-save recovery
   │  ├─ migrations.ts        ordered schema migrations
   │  ├─ clock.ts             Clock interface, realClock with debug offset
   │  ├─ emitter.ts           tiny typed event emitter
   │  └─ result.ts            Result type helpers
   ├─ art/                    PROCEDURAL ART
   │  ├─ palette.ts           colors, plus shade() and tint() helpers
   │  ├─ svg.ts               SVG building helpers (outlined shapes, gradients, eyes)
   │  ├─ parts/               zombieParts.ts heroParts.ts droneParts.ts props.ts icons.ts backgrounds.ts
   │  ├─ catalog.ts           the list of every sprite: name → svg string, width, height
   │  ├─ atlas.ts             rasterizes the catalog into atlas canvases → Phaser textures
   │  ├─ Rig.ts  rigDefs.ts  rigAnims.ts   paper-doll characters
   ├─ game/                   HUNT GAMEPLAY (Phaser)
   │  ├─ HuntContext.ts       what entities and behaviors may access (§10.2)
   │  ├─ huntEvents.ts        typed hunt-local events
   │  ├─ Level.ts  Parallax.ts  NightOverlay.ts
   │  ├─ Player.ts  Drone.ts  Zombie.ts  ZombieManager.ts  behaviors/*.ts
   │  ├─ Harpoon.ts  Balloon.ts  Bait.ts  Trap.ts  Projectile.ts  Coin.ts  Crate.ts  GasCloud.ts  GooPuddle.ts  Net.ts
   │  ├─ HuntDirector.ts      spawning, catches, combo, crates, end conditions
   │  ├─ Radar.ts             off-screen arrow data for the HUD
   │  └─ Fx.ts                particles, screen shake, number pop-ups (pooled)
   ├─ input/                  InputState.ts  TouchControls.ts  KeyboardControls.ts
   ├─ scenes/                 keys.ts  BootScene  TitleScene  BaseScene  WorldMapScene  HuntScene  HuntHudScene  GalleryScene
   ├─ ui/                     DOM UI
   │  ├─ dom.ts               h() element helper, icon() inline SVG helper
   │  ├─ styles.css           CSS variables, panel and button styles
   │  ├─ UiRoot.ts            panel stack, modal queue, toasts, back-button integration
   │  ├─ TopBar.ts  Dock.ts  Toast.ts  Modal.ts  Panel.ts
   │  ├─ panels/              Storage, Factory, Workshop, Orders, Almanac, Missions, Settings, Loadout, Summary, Pause
   │  └─ debug/DebugPanel.ts
   ├─ audio/                  AudioManager.ts  sfx.ts (zzfx presets)  music.ts (sequencer + patterns)
   └─ platform/               pwa.ts orientation.ts fullscreen.ts haptics.ts safeArea.ts backButton.ts lifecycle.ts
```

**Import rules.** `data` imports nothing from the app. `logic` imports only `data`. `state` imports `data` and `logic`. `ui` imports `state`, `logic`, `data`, `art/parts/icons`, `audio`, and `platform`. `game`, `scenes`, and `input` may import anything except `ui` panels; they open UI only through `UiRoot`'s public API. Nothing imports from `scenes` except `main.ts` and `scenes` themselves.

## 3. Runtime layers

```
┌──────────────────────── browser window (landscape) ────────────────────────┐
│  #ui  (DOM overlay: top bar, dock, panels, modals, toasts)  pointer-events  │
│        only on interactive children; everything else passes to the canvas  │
│  #game (Phaser canvas)                                                     │
│     Boot → Title → Base ⇄ WorldMap → Hunt + HuntHud (parallel) | Gallery   │
│  #rotate (portrait overlay)                                                │
└────────────────────────────────────────────────────────────────────────────┘
          ▲ reads / calls actions               ▲ subscribes to events
          └──────────── GameState (singleton) ──┘  → save.ts → localStorage
                         uses logic/* + data/*      clock.ts for time
```

`main.ts` creates **one** `GameState`, passes it to Phaser through `game.registry.set('state', state)`, and hands it to `UiRoot`. Nothing else constructs one, except tests.

## 4. Scenes and flow

| Key | Scene | Notes |
|---|---|---|
| `boot` | BootScene | Builds the art atlas (async), shows a progress bar, then routes to `config.startScene` (default `title`). |
| `title` | TitleScene | Logo, an animated zombie, "Tap to start". The first tap unlocks audio and requests fullscreen (§15). Routes to the tutorial on first run, otherwise to `base`. |
| `base` | BaseScene | The yard with tappable buildings, plus the DOM TopBar and Dock. Panels open over it. |
| `map` | WorldMapScene | Area nodes. Picking a mode opens the Loadout panel, which starts the hunt. |
| `hunt` | HuntScene | The world, physics, and entities. It launches `hunt-hud` in parallel. |
| `hunt-hud` | HuntHudScene | Fixed-screen HUD and **touch controls**. Writes to the shared `InputState`. |
| `gallery` | GalleryScene | Debug-only art review: every rig, animation, prop, and background (`?scene=gallery`). |

Scene start data for a hunt:
```ts
interface HuntStart {
  area: AreaId;
  mode: 'day' | 'night' | 'boss' | 'tutorial';
  loadout: { brainBait: number; glowBait: number; goldenBait: number; traps: number; gadget: GadgetId | null };
  seed: number;
}
```
Transitions use a 200 ms camera fade. While the Hunt is running, the Base and Map scenes are **stopped**, not just slept, to save memory.

## 5. Scale, coordinates, and the camera

```ts
scale: {
  mode: Phaser.Scale.EXPAND, parent: 'game',
  width: 1280, height: 720, autoCenter: Phaser.Scale.CENTER_BOTH,
}
input: { activePointers: 4 }   // multi-touch: joystick + aim + a button + spare
render: { antialias: true, roundPixels: false }
```
- **Design units** are game pixels. The visible game size is `scale.width × scale.height`. One of them equals the design value and the other is larger (wide phones get more width, tablets get more height).
- **World scenes** (Hunt, Base, Map) set `camera.setZoom(scale.height / 720)` and recompute it on `resize`. That keeps the world exactly 720 tall on every device. Wide phones see more level horizontally.
- **The HUD scene** uses no zoom. It lays itself out from `scale.width/height`, with edges inset by the safe area (§15) converted to game px: `gamePx = cssPx × scale.width / canvas.clientWidth`.
- **The hunt world**: x runs from 0 to `area.width`, y from 0 to 720. The ground baseline is around y 600, Dex's ceiling is y 80, and camera bounds are `(0, 0, width, 720)`. The camera follows Dex with lerp 0.12 and a deadzone 160 px wide.
- **Depth layers** (`game/depth.ts`):
  `SKY 0 · FAR 10 · MID 20 · BURIED 30 · GROUND 40 · PROPS 45 · TRAPS 48 · ZOMBIES 50 · PLAYER 60 · DRONE 65 · PROJECTILES 70 · FX 80 · NIGHT 90`
  Zombies that are BURIED or EMERGING sit at `BURIED`, behind the ground, so they visibly rise out of it. They move to `ZOMBIES` once fully up.

## 6. GameState, events, and save

```ts
class GameState {
  constructor(deps: { storage: KeyValueStorage; clock: Clock });
  readonly events: Emitter<StateEvents>;
  get data(): Readonly<SaveData>;            // read-only view; never mutate directly
  // currencies / xp
  addCoins(n: number, source: CoinSource): void;
  spend(cost: { coins?: number; plutonium?: number }): Result<'not_enough_coins' | 'not_enough_plutonium'>;
  addPlutonium(n: number): void;
  addXp(n: number): void;                     // emits 'levelUp' per level gained and pays level rewards
  // hunt
  recordCatch(c: CatchRecord): { stored: boolean; overflowCoins: number };
  finishHunt(h: HuntSummary): void;
  // factory / economy
  startJob(machine: MachineId, slot: number, product: ProductId): Result<'busy' | 'missing_inputs' | 'locked'>;
  collectJob(machine: MachineId, slot: number): Result<'not_ready' | 'empty'>;
  collectAll(): number;
  speedUpJob(machine: MachineId, slot: number): Result<'not_enough_plutonium' | 'empty' | 'already_done'>;
  sell(product: ProductId, qty: number): Result<'not_enough_stock'>;
  buyUpgrade(id: UpgradeId): Result<'maxed' | 'not_enough_coins'>;
  buyMachine(id: MachineId): Result<'locked' | 'owned' | 'not_enough_coins'>;
  buyMachineSlot(id: MachineId): Result<'maxed' | 'not_owned' | 'not_enough_coins'>;
  unlockArea(id: AreaId): Result<'level_too_low' | 'not_enough_coins' | 'owned'>;
  // orders, meta, cosmetics, settings (added by their milestones)
  fulfillOrder(slot: number): Result<'missing_products' | 'empty'>;
  declineOrder(slot: number): Result<'empty'>;
  refreshOrders(): Result<'not_enough_plutonium'>;
  tick(): void;                               // timestamp-driven housekeeping: refill orders, daily reset
  // persistence
  save(): void;                               // debounced 1 s internally; flushSave() for an immediate write
  flushSave(): void;
  exportCode(): string;  importCode(code: string): Result<'invalid_code'>;
  reset(): void;
}
```
- **Events** (`StateEvents`): `coins`, `plutonium`, `xp`, `levelUp`, `storage`, `products`, `jobs`, `upgrades`, `machines`, `areas`, `orders`, `missions`, `achievements`, `almanac`, `settings`, `toast`. UI subscribes to the ones it shows.
- **Every action** that changes progress also calls `this.track(event: GameEvent)` internally. That updates story, daily, and achievement progress through the pure `logic/missions.ts` and `logic/achievements.ts`.
  ```ts
  type GameEvent =
    | { t: 'catch'; zombie: ZombieId | BossId; area: AreaId; night: boolean; via: 'harpoon' | 'trap' | 'net'; combo: number }
    | { t: 'produce'; product: ProductId; qty: number }
    | { t: 'sell'; product: ProductId; qty: number; coins: number }
    | { t: 'order' } | { t: 'combo'; value: number } | { t: 'hunt'; area: AreaId; mode: HuntStart['mode'] }
    | { t: 'upgrade'; id: UpgradeId; level: number } | { t: 'machine'; id: MachineId }
    | { t: 'level'; level: number } | { t: 'area'; id: AreaId } | { t: 'coinsEarned'; amount: number };
  ```
- **Save**: key `ujc.save`, JSON. Writes are debounced 1 s and flushed on `visibilitychange: hidden` and `pagehide`.
  - On load, parse the save, run migrations up to `CURRENT_SCHEMA`, and deep-merge it onto `defaultSave()` so new fields get their defaults.
  - **Corrupt save**: keep the raw string under `ujc.save.corrupt.<timestamp>`, start fresh, and show a toast. Never crash.
  - **Export code**: `"UJC1:" + base64(utf8 JSON) + ":" + checksum` (a simple 32-bit FNV-1a in hex). Import checks the prefix and checksum and runs migrations.

### 6.1 SaveData (schema v1, extended by later milestones through migrations)
```ts
interface SaveData {
  schemaVersion: number;
  createdAt: number; lastSeenAt: number;
  coins: number; plutonium: number; xp: number;            // level is derived from xp
  storage: Partial<Record<ZombieId, number>>;
  products: Partial<Record<ProductId, number>>;
  upgrades: Record<UpgradeId, number>;                     // levels, start 1
  machines: Partial<Record<MachineId, { slots: (Job | null)[] }>>;   // present = owned
  areas: Partial<Record<AreaId, { catches: number; bossCaught: boolean; nightHunts: number }>>; // present = unlocked
  orders: { slots: (Order | { refillAt: number })[] };
  almanac: Partial<Record<ZombieId | BossId, number>>;     // catch counts
  consumables: { glowBait: number };
  gadgets: { owned: GadgetId[]; equipped: GadgetId | null };
  skins: { owned: SkinId[]; equipped: SkinId };
  missions: { storyIndex: number; storyProgress: number; daily: { day: string; list: DailyMissionState[]; chestClaimed: boolean } };
  login: { lastClaimDay: string | null; streakDay: number };
  achievements: Partial<Record<AchievementId, { progress: number; claimed: boolean }>>;
  stats: { totalCatches: number; trapCatches: number; huntsPlayed: number; bestCombo: number; coinsEarned: number; productsMade: number; ordersDone: number };
  settings: { sfx: boolean; music: boolean; haptics: boolean; leftHanded: boolean; aimAssist: boolean; screenShake: boolean };
  tutorial: { step: number; done: boolean };
}
interface Job { product: ProductId; startedAt: number; durationMs: number }
interface Order { id: string; lines: { product: ProductId; qty: number }[]; coins: number; xp: number; plutonium: number }
```

## 7. Time and offline progress
- `interface Clock { now(): number }`. `realClock.now()` returns `Date.now() + debugOffsetMs`. `?debug=1` exposes "skip +1h", which raises the offset.
- Everything real-time is stored as an absolute timestamp: a job is done when `now ≥ startedAt + durationMs`, an order slot refills when `now ≥ refillAt`, and the day key is the local `YYYY-MM-DD` of `now`.
- There's no simulation loop. On boot and on returning to the app, `GameState.tick()` handles refills and the daily reset. If the player was away for more than 2 minutes, `UiRoot` shows **Welcome back**, listing the jobs that finished and the orders that refilled while they were gone.
- Clock rollback (the device time moved backwards): never award anything negative, and never let a job's progress go below 0. Clamp.

## 8. Data model

### 8.1 Ids (`data/ids.ts`)
```ts
export const AREA_IDS = ['bayou', 'ghost_town', 'frost_peak', 'toxic_plant'] as const;
export type AreaId = (typeof AREA_IDS)[number];
// The same pattern for: ZombieId (21 from GDD §7.1), BossId (4), MachineId (4), ProductId (27),
// UpgradeId (7), GadgetId (3), PowerUpId (4), SkinId (6), AchievementId, BaitId = 'brain' | 'glow' | 'golden'.
```

### 8.2 Definitions (`data/types.ts`)
```ts
type Behavior =
  | { kind: 'flee'; escapeMs: number }
  | { kind: 'leap'; cooldownMs: number; jumpVelocity: number; triggerRadius: number }
  | { kind: 'throw'; projectile: 'trash' | 'snowball'; cooldownMs: number; range: number }
  | { kind: 'fly'; altitude: number; amplitude: number }
  | { kind: 'roll' }
  | { kind: 'phase'; visibleMs: number; hiddenMs: number }
  | { kind: 'slide'; accel: number; turnMs: number }
  | { kind: 'blink'; everyMs: number; distance: number }
  | { kind: 'split'; into: ZombieId; count: number }
  | { kind: 'gasOnHit'; radius: number; slow: number; durationMs: number }
  | { kind: 'shieldFront' }
  // boss-only
  | { kind: 'summon'; zombie: ZombieId; everyMs: number; max: number }
  | { kind: 'shakeOff'; everyMs: number; count: number }
  | { kind: 'barrage'; projectile: 'trash' | 'snowball'; count: number; everyMs: number }
  | { kind: 'slam'; everyMs: number; radius: number }
  | { kind: 'gasTrail'; everyMs: number };

interface ZombieLook {
  body: 'round' | 'skinny' | 'bulky' | 'blob' | 'sheet' | 'robot' | 'furry' | 'crystal';
  head: 'round' | 'egg' | 'square' | 'frog' | 'skull' | 'none';
  legs: 'short' | 'long' | 'frog' | 'none';
  accessory?: 'shirt' | 'sneakers' | 'mud' | 'wings' | 'sack' | 'plates' | 'bandana' | 'skates' | 'beanie' | 'horns'
            | 'seam' | 'antenna' | 'gasmask' | 'shield' | 'veins' | 'crown' | 'sheriff_hat' | 'icicles' | 'slime';
  palette: { skin: string; cloth: string; accent: string };
  glow?: string;              // night zombies: glow color (also used for the night light)
  translucent?: boolean;      // specter, phantom
}

interface ZombieDef {
  id: ZombieId; name: string; area: AreaId; night: boolean; spawnOnly?: boolean;
  hp: number; speed: number; noticeRadius: number; xp: number; coins: number;
  bait: BaitId; behaviors: Behavior[]; scale: number; look: ZombieLook; blurb: string;
}
interface BossDef extends Omit<ZombieDef, 'id' | 'night' | 'spawnOnly'> {
  id: BossId; firstReward: Reward; repeatReward: Reward;
}
interface Reward { coins?: number; plutonium?: number; skin?: SkinId }

interface AreaDef {
  id: AreaId; name: string; order: number; unlock: { coins: number; level: number };
  width: number; zombiesPerHunt: [number, number];
  spawnWeights: Partial<Record<ZombieId, number>>; nightZombie: ZombieId; boss: BossId; bossUnlockCatches: number;
  terrain: { stepHeights: number[]; platformsPerScreen: [number, number]; hazard: 'water' | 'ice' | 'toxic' | 'none'; hazardsPerScreen: number };
  palette: Record<'skyTop' | 'skyBottom' | 'far' | 'mid' | 'groundTop' | 'dirt' | 'hazard', string>;
}
interface MachineDef { id: MachineId; name: string; requiresArea: AreaId; cost: number; slotCosts: [number, number] }
interface ProductDef {
  id: ProductId; name: string; machine: MachineId; inputs: Partial<Record<ZombieId, number>>;
  outQty: number; timeMs: number; price: number; icon: 'bottle' | 'candy' | 'cup' | 'snack';
}
interface UpgradeDef<E> { id: UpgradeId; name: string; maxLevel: number; baseCost: number; growth: number; effect: (level: number) => E }
interface GadgetDef { id: GadgetId; name: string; level: number; cost: number; charges: number }
interface MissionDef { id: string; text: string; goal: MissionGoal; reward: Reward }   // MissionGoal: a discriminated union matching GameEvent kinds plus state checks
```
Product **ingredient order matters**: the first key in `inputs` is the "main" zombie, used for mastery bonuses and icon tint. Write the inputs in GDD order.

## 9. Pure logic (`logic/`): the functions the tests cover
- `niceRound(x)`, `upgradeCost(def, toLevel)`, `upgradeEffects(levels)` (returns one flat `GearStats` object for a hunt).
- `jobProgress(job, now) → 0..1`, `isJobDone`, `speedUpCost(job, now)`.
- `generateOrder(rng, ownedMachines, level) → Order`, `orderReward(lines)`.
- `xpToNext(level)`, `levelFromXp(xp) → { level, intoLevel, needed }`.
- `comboMultiplier(combo)`.
- `applyMissionEvent(def, progress, event, stateView) → progress`, `isMissionDone`.
- `generateLevel(seed, area) → LevelLayout`, guaranteeing: step height ≤ 120, mounds ≥ 450 px apart and ≥ 800 px from the start, every mound on a ground segment, platforms reachable.
- `generateSpawns(seed, area, mode, count) → ZombieId[]`.
- `rng`: mulberry32. **Never use `Math.random()`** in logic. Gameplay may use the hunt's seeded RNG.

```ts
interface LevelLayout {
  width: number;
  segments: { x: number; w: number; y: number }[];            // ground tops
  platforms: { x: number; y: number; w: number }[];           // one-way
  hazards: { x: number; w: number; kind: 'water' | 'ice' | 'toxic' }[];
  mounds: { x: number; y: number }[];                         // candidate burial spots
  props: { x: number; y: number; kind: string; layer: 'back' | 'front' }[];
  start: { x: number; y: number };
}
```

## 10. Hunt architecture

### 10.1 Systems and update order
`HuntScene.update(time, delta)` runs, in order:
1. `input.snapshot()`: freeze this frame's `InputState`.
2. `player.update`: movement, jetpack, firing, bait, trap, gadget.
3. `zombieManager.update`: the state machine and behaviors.
4. Harpoons, projectiles, gas, goo, and nets update. Overlap checks run in the physics callbacks.
5. `drone.update`: the grab queue.
6. Coins and crates.
7. `director.update`: combo timer, crate timer, end conditions.
8. `nightOverlay.update` (night only), `radar.update`.
9. HUD sync happens through hunt events (the HUD never polls GameState every frame).

Delta is clamped to 50 ms. **Slow-mo** multiplies zombie and zombie-projectile delta only.

### 10.2 HuntContext: what entities may touch
```ts
interface HuntContext {
  rng: Rng; time: number; zombieTimeScale: number;
  player: { x: number; y: number; vx: number; grounded: boolean; facing: 1 | -1 };
  level: { groundYAt(x: number): number; nearestValidGroundX(x: number): number; width: number };
  spawnProjectile(kind: 'trash' | 'snowball', from: Vec2, target: Vec2): void;
  spawnGas(x: number, y: number, radius: number, slow: number, ms: number): void;
  spawnZombie(id: ZombieId, x: number, y: number, state: ZombieState): Zombie;
  events: HuntEvents;   // typed emitter
  gear: GearStats;      // from upgrades
}
```

### 10.3 Physics proxy + visual rig (use this pattern for every actor)
Arcade bodies on Containers are fiddly, so every actor is **two objects**:
- `proxy`: `scene.physics.add.image(x, y, 'px')` (a 1×1 transparent texture), invisible, with `body.setSize(w, h)` for the hitbox. Physics, collisions, and overlaps all use the proxy.
- `rig`: a `Rig` container (art). After the physics step (`scene.events.on('postupdate')` or at the end of `update`), the rig is placed at the proxy's bottom-center.

Ground segments and platforms form one **static group**. Platforms are one-way: their bodies have `checkCollision.down = left = right = false`. Flyers have `body.allowGravity = false`.

### 10.4 Zombies
- `Zombie` owns the common state machine (GDD §6.5): `BURIED | EMERGING | SEEK_BAIT | EATING | ALERT | FLEE | BURROWING | LIFTING | GRABBED`, plus its balloons (with pop timers), slow multipliers, and facing.
- Each `Behavior` in its def maps to an implementation from `behaviors/index.ts`:
  ```ts
  interface BehaviorImpl {
    init?(z: Zombie, ctx: HuntContext): void;
    update?(z: Zombie, dtMs: number, ctx: HuntContext): void;        // runs every frame while not BURIED / LIFTING / GRABBED
    onHit?(z: Zombie, hit: HitInfo, ctx: HuntContext): 'deflect' | 'split' | void;
    onState?(z: Zombie, from: ZombieState, to: ZombieState, ctx: HuntContext): void;
  }
  ```
  `flee` lives in the core (every zombie that runs uses it). Leap, throw, fly, roll, phase, slide, blink, split, gasOnHit, shieldFront, and the boss behaviors are each their own file. Bosses are `Zombie`s with boss flags.
- `ZombieManager` holds active zombies and resolves lures: when bait lands, it takes the nearest matching BURIED zombies within the lure radius, at most 2 (golden bait: 5 within 600 px).

### 10.5 Catch pipeline
A dart hits → `zombie.onHit` → balloons get added → balloons ≥ hp → `LIFTING` → `drone.enqueue(z)` → grab finishes → `director.onCatch(z, via)`, which:
1. calls `state.recordCatch(...)`, committing it right away (storage or overflow coins, almanac, stats, missions),
2. updates the combo, spawns the coin burst, adds XP through the state,
3. emits `catch` on the hunt events (HUD counter, toasts),
4. checks whether the area is cleared.

Traps and nets skip the balloon step: they go straight to `LIFTING` with net art instead of balloons.

### 10.6 Hunt events (`huntEvents.ts`)
`catch`, `combo`, `ammo` (bait, traps, gadget charges), `reload` (progress 0..1), `fuel` (0..1), `stun`, `radar` (an array of arrows), `crate`, `powerup`, `boss` (balloons/hp), `remaining` (zombies left), `end`.

## 11. Input
- `InputState` belongs to HuntScene: `{ moveX: -1..1, thrust: boolean, aim: { active, angle, power }, fire: boolean (edge), bait: BaitId | null (edge), trap: boolean (edge), gadget: boolean (edge) }`.
- **TouchControls** live in HuntHudScene (fixed screen) and write to `InputState`.
  - Left zone: a floating joystick. It claims a pointer on `pointerdown` inside the zone and tracks that pointer **by id** until `pointerup` or `pointerupoutside`. Dead zone 12%. Thrust when `y < −0.45`.
  - Right zone: the aim stick. Same claiming by pointer id. Dragging over 20 px sets the aim. Releasing fires. A tap under 20 px fires at the aim-assist target or straight ahead.
  - Buttons: interactive game objects. Their `pointerdown` handler calls `event.stopPropagation()` so a press on a button never starts the aim stick.
  - Left-handed setting: mirror the zones and buttons.
- **KeyboardControls**: active on desktop alongside touch. They feed the same `InputState`, with the mouse aiming relative to Dex.
- Aim angles are screen-space. The world camera only zooms and scrolls (it never rotates), so the HUD's angle applies unchanged in the world.

## 12. Art pipeline
1. `art/parts/*` export functions that return **SVG strings** (`<svg viewBox=… width=… height=…>`), built with `svg.ts` helpers: `outlined(path, fill)`, `shadeFill(color)`, `eye(x, y, r)`, `gradientRect(…)`. Every outline is `#1f1430` at 4 px (`stroke-linejoin: round`).
2. `art/catalog.ts` lists every sprite: `{ name, svg, w, h }`. Names follow these rules: `z_<zombie>_<part>`, `boss_<boss>_<part>`, `hero_<skin>_<part>`, `drone_<part>`, `prop_<name>`, `fx_<name>`, `icon_<name>`, and backgrounds as `bg_<area>_<layer>`.
3. `art/atlas.ts` (in BootScene): for each entry, build an `Image` from `data:image/svg+xml;charset=utf-8,<encoded>`, `await img.decode()`, and draw it into 2048×2048 atlas canvases with a simple shelf packer (2 px padding). Register each canvas with `textures.addCanvas('atlasN', canvas)` and each sprite as a frame (`texture.add(name, 0, x, y, w, h)`). Keep a `name → atlasKey` map and use `art(scene, x, y, name)` / `frameOf(name)` everywhere. **Backgrounds** (tileable, 1024 × layer height) are standalone canvas textures because TileSprite needs a whole texture. Report progress to the Boot progress bar.
4. **Rigs**: `RigDef = { parts: { name: string; frame: string; x: number; y: number; ox: number; oy: number; depth: number }[] }`, where the origin (0,0) is between the feet. `Rig extends Phaser.GameObjects.Container` with `play(anim)`, `setFacing(±1)`, `lookAt(dx, dy)` (moves the pupils), `flash(color, ms)`, and `setNet(on)`. Animations in `rigAnims.ts` are tween recipes per part name (idle, walk, run, eat, alert, struggle, float, emerge, burrow, fly, stunned). Switching an animation stops the old tweens and resets part transforms.
5. The DOM reuses `parts/icons.ts` SVG strings through `icon(name)` in `ui/dom.ts`. They're trusted static strings, so `innerHTML` is fine for them only.

## 13. DOM UI
- `#ui` covers the screen with `pointer-events: none`. Its interactive children set `pointer-events: auto`. A panel's backdrop blocks the canvas while it's open.
- `h(tag, props, ...children)` builds elements. There's no framework.
- `Panel` (base class): `open()`, `close()`, `render()`. It subscribes to the relevant `state.events` on open and unsubscribes on close, re-rendering only what changed (it's fine to re-render one panel section in full).
- `UiRoot` keeps a **panel stack** and a **modal queue**: welcome-back, then daily login, then level-up and area-unlocked, then confirms. Toasts stack at the top-center and expire after 2.5 s. Opening a panel calls `history.pushState`, and `popstate` closes the top one (Android back).
- **CSS**: variables in `:root` (colors from GDD §19). Use `100dvh`. Panels max out at 920 px wide. Scroll areas use `overflow-y: auto; touch-action: pan-y; overscroll-behavior: contain`. Headings and numbers use Lilita One, body text uses `system-ui`. Buttons press down by 2 px on `:active`. Respect `prefers-reduced-motion` and the screen-shake setting.
- Never `innerHTML` user-provided strings (the save import code). Only the static icon SVGs.

## 14. Audio
- `AudioManager` (singleton): `unlock()` on the first user gesture (resumes the zzfx AudioContext). `sfx(name, { volume?, pitch? })` plays a zzfx preset from `sfx.ts`. `playMusic(track)` and `stopMusic()` drive a small lookahead step sequencer in `music.ts` (25 ms timer, 100 ms scheduling window) using oscillators and noise on the same context. Mute flags come from settings.
- It suspends on `visibilitychange: hidden` and resumes on visible if not muted.
- The jetpack loop is a single sustained node, started and stopped, never re-triggered every frame.

## 15. Platform
- `index.html` viewport: `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`. Also `theme-color`, `apple-mobile-web-app-capable`, and `apple-mobile-web-app-status-bar-style`.
- `html, body`: `margin 0; overflow hidden; overscroll-behavior none; touch-action none; background #1a1226; position fixed; inset 0`. Prevent `gesturestart` and double-tap zoom.
- `safeArea.ts`: reads `env(safe-area-inset-*)` through a hidden probe element and exposes `insets()` plus a change event.
- `orientation.ts`: `matchMedia('(orientation: portrait)')` shows `#rotate` and emits `pause`. Try `screen.orientation.lock('landscape')` after going fullscreen, and ignore errors.
- `fullscreen.ts`: on the Title tap, call `scale.startFullscreen()`, except on iOS or when already running standalone (`display-mode: fullscreen/standalone`).
- `haptics.ts`: `vibrate(pattern)` gated by the setting and feature detection. Catch is 20 ms, stun 60 ms, level-up `[30, 40, 30]`.
- `lifecycle.ts`: on `visibilitychange`, save, pause the hunt (open the Pause panel), and suspend audio. On return, run `state.tick()` and the welcome-back check.
- `pwa.ts`: `registerSW({ onNeedRefresh, onOfflineReady })` from `virtual:pwa-register`. On need-refresh, show a toast with an **Update** button (`updateSW(true)`). On offline-ready, toast "Ready to play offline".

## 16. Testing
- **Vitest**, node environment, files in `tests/**/*.test.ts`. Use `tests/helpers/fakeClock.ts` (a settable `now`) and `memoryStorage.ts`.
- Required coverage, added with each milestone: niceRound and upgrade costs (they match the GDD §12 tables), level XP curve, combo multiplier, job timing including offline and clock rollback, orders (deterministic with a seed, rewards follow the formula), save round-trip, migration from every older schema, corrupt-save recovery, export/import round-trip and tamper detection, mission and achievement progress, level-generation invariants (run 200 seeds per area), spawn-generation weights.
- Scenes aren't unit tested. The lead playtests them in Chrome (mobile emulation) during review.

## 17. Performance budgets
- 60 fps target on a mid-range Android device. Stay under 150 draw calls (atlas batching keeps this easy), with at most 14 zombies (including summons) and at most 200 live particles.
- Pools: harpoon darts (20), coins (60), projectiles (20), particles (per emitter), damage and number pop-ups (20).
- Don't create closures, arrays, or vectors in per-frame loops. Reuse scratch `Phaser.Math.Vector2`s.
- The initial JS should stay under 2 MB uncompressed (Phaser is about 1.2 MB in its own vendor chunk). Atlas build time at boot should stay under 1.5 s on a mid-range phone.

## 18. Build and deploy
- `vite.config.ts`: `base: '/undead-juice-co/'`. Configure VitePWA as follows:
  - `registerType: 'prompt'`
  - manifest: `name: 'Undead Juice Co.'`, `short_name: 'Undead Juice'`, `display: 'fullscreen'`, `orientation: 'landscape'`, `start_url` and `scope` equal to the base, `background_color` and `theme_color` `#1a1226`, plus the generated icons (192, 512, and a 512 maskable)
  - workbox: `globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,webmanifest}']`, `maximumFileSizeToCacheInBytes: 5 * 1024 * 1024`
  - `build.rollupOptions.output.manualChunks: { phaser: ['phaser'] }`
- Scripts:
  ```json
  "dev": "vite --host", "build": "tsc --noEmit && vite build", "preview": "vite preview --host",
  "typecheck": "tsc --noEmit", "test": "vitest run", "format": "prettier --write .",
  "icons": "pwa-assets-generator", "deploy": "npm run build && gh-pages -d dist -t"
  ```
- **Deploy is lead-only**: the `gh-pages` branch of `github.com/V-B1/undead-juice-co`, with GitHub Pages serving from that branch. `public/.nojekyll` must exist.
