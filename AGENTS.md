# AGENTS.md: rules for the coding agent

You are the **implementer** on *Undead Juice Co.*, a landscape mobile web game (installable PWA) inspired by the gameplay of *Zombie Catchers*. A separate **lead** (Claude) wrote the plan. The lead reviews every task, commits, and deploys.

Your job: implement **exactly one task at a time** from `docs/TASKS.md`, to spec, then report back and stop.

---

## 1. Read before every task

1. This file, in full.
2. `docs/PROGRESS.md`: the latest **Review** for your task. If there are open review items, fixing them comes before anything else.
3. `docs/TASKS.md`: the "Global acceptance" list, plus your task section.
4. The sections of `docs/GAME_DESIGN.md` (GDD) and `docs/ARCHITECTURE.md` (ARCH) that your task lists under **Read**.

If the spec is ambiguous, take the simplest reading that fits the docs, build it, and list the assumption in your report. If the spec seems wrong or impossible, don't quietly diverge. Build the closest thing you can and flag it under **Deviations**.

## 2. Workflow

1. Implement the task. Stay inside its scope. Don't start the next task, and don't refactor or "improve" code the task doesn't touch.
2. Make these pass with zero errors: `npm run typecheck`, `npm test`, `npm run build`.
3. Run `npm run dev` and exercise what you built at phone-landscape sizes (devtools device mode at 844×390 and 1280×720). If you can't run a browser, say so in the report and list what you verified some other way.
4. Run `npm run format`.
5. Append your report to `docs/PROGRESS.md` using the template there, and set your task's row on the status board to `ready for review`.
6. Stop. **Never commit, push, or deploy.** Leave your changes uncommitted, because the lead reviews `git diff`.

## 3. Tech stack (pinned)

Don't change these versions. Don't add packages unless your task explicitly allows it. If you think you need a new dependency, build without it and explain in the report. The lead decides.

| Package | Version | Purpose |
|---|---|---|
| phaser | 3.90.0 | Game engine. **Phaser 3 API.** Do not use Phaser 4 APIs. |
| typescript | 5.9.3 | Strict mode |
| vite | 7.3.6 | Dev server and bundler |
| vitest | 4.1.11 | Unit tests (`tests/`) |
| vite-plugin-pwa | 1.3.0 | Manifest and service worker |
| workbox-window | 7.4.1 | Service worker update prompt (`virtual:pwa-register`) |
| @vite-pwa/assets-generator | 1.0.4 | PNG icons from `public/icon.svg` (dev dependency) |
| @fontsource/lilita-one | 5.3.0 | Display font, bundled so it works offline |
| zzfx | 1.4.0 | Synthesized sound effects |
| prettier | 3.9.9 | Formatting |
| gh-pages | 6.3.0 | Deploy. **The lead runs this, not you.** |

Install with exact versions (`npm i -E`). Commit `package-lock.json` changes along with your work (the lead commits them).

## 4. Code rules

- TypeScript `strict`. No `any`, `@ts-ignore`, `@ts-expect-error`, or `as unknown as X`.
- **Layering** (see ARCH §2):
  - `src/data/` holds static tables and types. No logic beyond small pure helpers.
  - `src/logic/` and `src/state/` are pure TypeScript. They **must not import Phaser or touch the DOM**, because they are unit tested.
  - `src/game/`, `src/scenes/`, and `src/input/` hold Phaser gameplay.
  - `src/ui/` holds the DOM menus. It reads and writes game data only through `GameState`.
  - `src/art/` holds procedural art. `src/audio/` holds synthesized audio. `src/platform/` handles the browser and device.
- Every **tunable number** (speeds, costs, timings, rewards, radii) lives in `src/data/` or `src/config.ts`. Gameplay code reads it from there. Layout pixel offsets in UI code are fine.
- Keep files under about 400 lines and split them by responsibility. One class per file for entities and panels.
- Naming: class files use `PascalCase.ts`, function modules use `camelCase.ts`. Data ids are `snake_case` string-literal unions (`'shambler'`, `'swamp_juice'`).
- Mutating `GameState` methods return `Result` objects (`{ ok: true } | { ok: false; reason }`). They never throw for game-rule failures.
- No stray `console.log`. Use `debugLog()` from `src/config.ts`, which does nothing unless `?debug=1`.
- No TODO stubs passed off as finished. Anything unfinished goes in the report under **Known issues**.
- Comments explain *why*, not *what*. Keep them short.

## 5. Game rules that are easy to get wrong

- **Original IP only.** Never use the name "Zombie Catchers", its characters (A.J., Bud), its zombie names, logos, UI text, or art. Use the names in the GDD. Our hero is **Dex**, our drone sidekick is **Bolt**, and the company is **Undead Juice Co.**
- **No external assets or network calls.** All art is generated in code (`src/art/`) and all sound is synthesized (`src/audio/`). No CDN links, web fonts from URLs, or image or audio files, except the generated PWA icons. The game must run fully offline after the first load.
- **Landscape, mobile first.** The design size is 1280×720 with `Phaser.Scale.EXPAND`, so the visible width varies (about 1280 to 1700) and the height can grow on tablets. Anchor HUD elements to screen edges with `this.scale.width/height`, and lay them out again on the `resize` event. **Never assume the width is 1280.** World scenes set camera zoom so that the world is always 720 tall (ARCH §5).
- **Touch.** Every control works with fingers, and multi-touch (moving and aiming at the same time) must work. HUD touch targets are at least 88 design px. DOM buttons are at least 44 CSS px. Nothing is hover-only. Desktop keyboard and mouse also work (it's how the lead tests quickly).
- **Safe areas.** HUD and DOM UI stay clear of notches and home bars, using `src/platform/safeArea.ts`.
- **Time.** Real-time timers (production, order refills, daily resets) store absolute timestamps from `clock.now()` (`src/state/clock.ts`). They never use `setTimeout` chains, so they survive reloads and keep progressing offline. Never assume the clock only moves forward: clamp negative deltas to 0.
- **Save.** All persistent state goes through `GameState` and `save.ts`. If you change the save shape, bump `schemaVersion` and add a migration with a test.
- **Hunts commit as they go.** Each catch is written to `GameState` when it happens, so a killed app never loses catches.
- **Performance.** Hold 60 fps on a mid-range Android phone. Pool harpoons, coins, particles, and projectiles. Avoid allocating in per-frame loops. Cap particles (ARCH §17).
- **No fail state.** The hero can't die. Getting hit means a short stun and a knockback.

## 6. Debug hooks (keep them working)

- `?debug=1` shows the FPS meter, Arcade physics bodies, and the debug panel (add coins and plutonium, fill storage, skip time +1h, unlock all, reset save).
- `?scene=<key>` boots straight into `gallery`, `title`, `base`, `map`, or `hunt`. Hunt also takes `&area=<id>&night=1&boss=1`.
- When you add something testable, give it a fast path through these hooks.

## 7. Definition of done

- Every acceptance item in the task is met, and you checked each one yourself.
- All "Global acceptance" items in `docs/TASKS.md` hold.
- Typecheck, tests, and build pass with zero errors. The browser console shows no errors and no new warnings.
- The report is in `docs/PROGRESS.md`, and your status board row says `ready for review`.
