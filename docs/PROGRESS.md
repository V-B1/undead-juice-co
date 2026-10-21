# Progress log

The implementer appends a **Report** after each task (and a **Fix report** after each fix round). The lead appends a **Review**. Newest entries go at the bottom. Never edit or delete earlier entries.

## Status board

| Task | Status | Live build |
|---|---|---|
| M0 | approved | https://v-b1.github.io/undead-juice-co/ |
| M1 | not started | |
| M2 | not started | |
| M3 | not started | |
| M4 | not started | |
| M5 | not started | |
| M6 | not started | |
| M7 | not started | |
| M8 | not started | |
| M9 | not started | |
| M10 | not started | |
| M11 | not started | |
| M12 | not started | |
| M13 | not started | |

Statuses: `not started` → `in progress` → `ready for review` → `changes requested` | `approved` (the lead sets the last two).

## Templates

### Implementer report (copy this)
```
### M#, Report
- **Summary**: 2–4 lines on what now works.
- **Files**: added / changed (grouped by folder).
- **How to test**: exact URLs and steps (e.g. `/undead-juice-co/?scene=hunt&area=bayou&debug=1`, then …).
- **Acceptance**: every item from the task and from Global acceptance, each marked [x] or [ ], with a note if not met.
- **Deviations and assumptions**: anything that differs from the docs, and why.
- **Known issues**: anything unfinished or flaky.
- **Checks**: typecheck ✅/❌ · test ✅/❌ (N tests) · build ✅/❌ (JS size of main and phaser chunks)
```

### Lead review
```
### M#, Review
- **Verdict**: APPROVED | CHANGES REQUESTED
- **Items** (only if changes are requested): numbered, each with file:line, what's wrong, and what's expected.
- **Notes**: optional observations for later milestones.
```

---

## Log

<!-- Append below this line. -->

### M0, Report
- **Summary**: Added the root Vite/strict TypeScript scaffold, Phaser placeholder scenes, responsive camera and pointer diagnostics, DOM controls, platform hooks, and PWA configuration. Source implementation is available for review, but M0 does **not** meet the full definition of done: dependency installation is blocked by this environment, so the app has not been built or exercised in a browser.
- **Files**:
  - Root: `package.json`, `tsconfig.json`, `vite.config.ts`, `pwa-assets.config.ts`, `index.html`, `.prettierrc`, `.prettierignore`; extended the existing `.gitignore` and filled in `README.md` local instructions.
  - `src/`: `config.ts`, `main.ts`, and `data/balance.ts` with gravity only.
  - `src/scenes/`: Boot, Title, Base, Hunt, Gallery, a minimal Map placeholder, scene keys, and shared layout/transition helpers.
  - `src/platform/`: safe areas, orientation, fullscreen, haptics, visibility lifecycle events, browser back stack, and PWA update/offline notifications.
  - `src/ui/`: CSS variables/styles, element helper, Toast, and UiRoot skeleton with accessible DOM scene buttons.
  - `public/`: original vector zombie-hand/juice-bottle icon and `.nojekyll`. Generated PNGs are still missing.
  - `tests/`: 23 parameterized Vitest cases for URL parsing, plus working FakeClock and MemoryStorage helpers.
- **How to test** (requires dependency installation in a network-enabled environment):
  1. Run `npm install` to install the exact versions in `package.json` and generate `package-lock.json`, then `npm run icons`, `npm run typecheck`, `npm test`, and `npm run build`.
  2. Run `npm run dev`, open `http://localhost:5173/undead-juice-co/`, and use Tap to start → Go hunt → Back. Keyboard equivalents: Enter/Space on Title, Enter in Base, Escape in Hunt. Test four simultaneous fingers over the LAN URL on a phone.
  3. Open `http://localhost:5173/undead-juice-co/?scene=hunt&area=bayou&debug=1&seed=42`. Check pointer ids, FPS, live scale dimensions, the 1280×720 world frame, and green safe-area corner markers at 844×390, 1280×720, 1560×720, and 1024×768. Resize while viewing Hunt: camera zoom must equal live scale height / 720. Rotate to portrait and back.
  4. Open `http://localhost:5173/undead-juice-co/?scene=gallery` for the Gallery placeholder; `?scene=map` also has a placeholder. Hunt parses `area`, `night`, `boss`, and `seed` for later milestones.
  5. Run `npm run preview` and open `http://localhost:4173/undead-juice-co/`. Check manifest installability and service-worker activation in Chrome Application, wait for the offline-ready toast, then reload offline and confirm Lilita One still renders. Check the console and Network tab, then run `npm run format`.
- **Acceptance — M0**:
  - [ ] Dev server opens the required base URL; Title fills all four target sizes without scrollbars. Configured in source; Vite could not run.
  - [ ] Title → Base → Hunt, including simultaneous pointers. Implemented; mouse, keyboard, and real-phone touch playtests remain unverified.
  - [ ] Resize has no letterboxing, markers remain at safe corners, and zoom equals height / 720. Implemented with separate world/HUD cameras and resize listeners; browser verification remains outstanding.
  - [ ] Portrait overlay appears and clears on landscape. Implemented with pause/landscape events and loop sleep/wake; not browser-tested.
  - [ ] Build contains manifest, service worker, and generated icons; preview is installable and reloads offline with the font. Not met: build and icon generation could not run; no `dist/`, generated PNGs, or installation/offline verification.
  - [ ] Debug FPS and direct Gallery boot work. Implemented; runtime verification remains outstanding.
  - [ ] Every asset URL works under `/undead-juice-co/`. Base-relative references are configured; missing generated PNGs and unavailable build prevent verification.
- **Acceptance — Global**:
  - [ ] Typecheck, tests, and build all pass with zero errors. All three commands were attempted and failed because their executables are not installed.
  - [ ] Chrome console has no errors or new warnings. Not checked: no running app was available.
  - [ ] Layout holds at all four global sizes with no width assumption. Layout source uses live dimensions; browser checks remain outstanding.
  - [ ] Portrait → landscape resumes correctly. Implemented, not exercised.
  - [ ] New controls work with touch, mouse, and keyboard. DOM buttons and keyboard bindings are implemented; interaction checks remain outstanding.
  - [ ] Runtime requests are same-origin and package restrictions hold. Static review found no remote game asset URLs; dependency declarations match all eleven allowed exact versions. Runtime network verification remains outstanding.
  - [x] Code rules checked statically: no `any` type, suppressions, double assertions, stray `console.log`, TODO stubs, or original-game IP in source; tunable timings/radii are in config and gravity is in data. No logic/state implementation was introduced in M0.
  - [ ] Debug and scene hooks work. Parser behavior checked; visual hooks await runtime verification.
  - [x] Report appended and M0 status set to `ready for review`; no commit, push, or deploy.
- **Deviations and assumptions**:
  - Installation attempted with exact-version `npm install -E` commands. Registry requests failed with `EACCES`; retrying offline failed with `ENOTCACHED`. Read-only inspection of the existing cache confirmed that Phaser, Lilita One, zzfx, Workbox Window, Vite, VitePWA, the icon generator, and the pinned Prettier tarballs are unavailable locally. No versions were substituted and no additional dependencies were added.
  - Exact dependency pins are recorded in `package.json`; installation, `package-lock.json`, and generated PNGs must be completed when registry access is available.
  - Added a Map placeholder so the documented `?scene=map` hook has a valid route without implementing M6. GameState, art, tutorial, and audio behavior remain assigned to their later milestones.
  - Invalid/absent seeds become `undefined`; valid seeds are nonnegative safe integers, including zero. Unknown scenes/areas fall back to Title/Bayou, and flags require `1`.
  - Fullscreen targets `document.body` so the DOM UI and rotate overlay stay visible with the canvas. Hunt uses a second unzoomed camera for diagnostic HUD/pointers.
- **Known issues**: This is an unverified scaffold, not an approved/installable build. `npm run dev`, `npm run preview`, `npm run icons`, and `npm run format` were attempted but could not execute because Vite, the icon generator, and Prettier are missing. Browser testing at 844×390/1280×720 and the other global sizes, multi-touch testing, console/network inspection, fullscreen/orientation checks, and install/offline validation could not be performed. Generated PNG references will remain unresolved until `npm run icons` succeeds. Dependency-aware type errors and runtime problems may remain.
- **Checks**: typecheck ❌ (missing `tsc`) · test ❌ (0 of 23 Vitest cases executed; missing `vitest`) · build ❌ (missing `tsc`/Vite; main and Phaser JS chunk sizes unavailable). Supplemental checks: cached TypeScript **5.9.3** transpiled all 26 TS files with zero syntax diagnostics; strict standalone typechecking passed for config, balance, FakeClock, and MemoryStorage; **27** native Node assertions covering parser behavior passed; icon SVG parsed as XML; `.nojekyll` exists; `git diff --check` passed. These checks do not replace the required commands or browser QA. Temporary npm logs/compiler extraction are confined to ignored `.npm-cache/`.

### M0, Report (continued)
- **Summary**: Resumed M0 with network access, installed all eleven pinned packages, generated `package-lock.json` and the PWA icons, and completed the required typecheck, tests, production build, and formatting. Dev and preview servers start at the required base path; HTTP and static artifact checks pass. Browser playtesting remains unverified because Windows browser control stopped before it could safely identify Chrome's current URL. This entry supersedes the installation/build/icon blockers in the earlier report; it does not claim browser acceptance has passed.
- **Files**:
  - Root: added `package-lock.json` and project `.npmrc`; formatted the existing M0 scaffold/configs and updated README clean-install instructions.
  - `public/`: generated `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, and `favicon.ico` using the pinned generator and `minimal2023Preset`. Inspected the generated 512px icon visually.
  - `src/main.ts`: switched orientation/visibility handling to `game.pause()` / `game.resume()` so initial orientation checks cannot wake an unstarted loop or have their pause reset by loop startup.
  - `src/scenes/HuntScene.ts`: precomputed pointer id text and used an indexed loop to avoid allocating strings/iterators in the per-frame pointer diagnostic.
  - All M0 source/tests/configs were processed by the pinned Prettier. `dist/` and npm cache remain ignored. No M1 implementation was started.
- **How to test**:
  1. `npm ci`, `npm run icons`, `npm run typecheck`, `npm test`, `npm run build`, `npm run format`.
  2. `npm run dev` → `http://localhost:5173/undead-juice-co/` → Tap to start → Go hunt → Back. Keyboard: Enter/Space on Title, Enter in Base, Escape in Hunt. Test on a phone using the LAN URL printed by Vite.
  3. Open `http://localhost:5173/undead-juice-co/?scene=hunt&area=bayou&debug=1&seed=42`. Check four simultaneous pointers, FPS, safe-corner markers, and camera zoom = scale height / 720 at 844×390, 1280×720, 1560×720, and 1024×768, including live resize and portrait/landscape changes.
  4. Open `http://localhost:5173/undead-juice-co/?scene=gallery`; also test `title`, `base`, `map`, and Hunt `night=1` / `boss=1` fast paths.
  5. `npm run preview` → `http://localhost:4173/undead-juice-co/`. Verify the manifest and active service worker in Chrome Application, wait for the offline-ready toast, then reload offline and inspect the font. Check console errors/warnings and same-origin requests. The temporary dev/preview processes used for HTTP checks were stopped after verification.
- **Acceptance — M0**:
  - [ ] `npm run dev` starts at the correct URL (verified), but Title filling all four sizes without scrollbars still requires browser inspection.
  - [ ] Title → Base → Hunt and simultaneous pointer circles/ids: implemented; browser and real-phone playtests remain outstanding.
  - [ ] Resize, no letterboxing, safe-corner anchoring, and camera zoom: source reviewed against the installed Phaser 3 API; not exercised in a browser.
  - [ ] Portrait overlay and landscape recovery: implemented, including the startup pause correction; browser verification remains outstanding.
  - [ ] Build emits `manifest.webmanifest`, `sw.js`, and icons (verified). Manifest fields/icon dimensions and precaching of the font are checked. Chrome installability, service-worker activation, and an actual offline reload remain unverified.
  - [ ] Debug FPS and direct Gallery boot: parser tests pass and the corresponding dev URLs return 200; visual runtime checks remain outstanding.
  - [x] Asset URLs work under `/undead-juice-co/`: all 18 precache entries exist on disk and return 200 from preview, with PNG/font MIME checks; dev entry/module/fast-path requests also return 200.
- **Acceptance — Global**:
  - [x] `npm run typecheck`, `npm test`, and `npm run build` pass with zero errors.
  - [ ] Chrome console has no errors/new warnings: unavailable for inspection.
  - [ ] Layout holds at all four global sizes: live dimensions are used in source, but visual checks were not performed.
  - [ ] Portrait → landscape resumes correctly: source implemented; not playtested.
  - [ ] Touch, mouse, and keyboard controls: implemented; browser interaction checks were not performed.
  - [ ] Same-origin runtime requests: asset references and HTTP serving were checked, but browser Network inspection remains outstanding. All eleven direct dependencies match their exact approved versions in both package files, with no additional direct packages.
  - [x] Static AGENTS rules hold: strict typecheck passes; no forbidden types/suppressions, double assertions, stray `console.log`, TODO stubs, remote game assets, or original-game IP in source/tests. No logic/state modules were introduced. Gameplay tunables remain in config/data.
  - [ ] Debug and scene hooks: all 23 parser tests pass; visual runtime verification remains outstanding.
  - [x] Report appended; M0 remains `ready for review`; changes are uncommitted and nothing was pushed or deployed.
- **Deviations and assumptions**:
  - npm 10.9.7's default resolver crashed with `Cannot read properties of null (reading 'edgesOut')` while resolving optional peer dependencies. Installation succeeded with `--legacy-peer-deps`. Added project `.npmrc` with `legacy-peer-deps=true` so `npm ci` uses the same resolution as the lockfile; a normal `npm ci --dry-run --ignore-scripts --no-audit --no-fund` then passed. All specified versions remain unchanged.
  - The browser connector returned no enabled browsers. The computer-use skill's Windows interface found Chrome, but its window-selection call returned: "Computer Use has been stopped for this turn because it could not determine the current browser URL on Windows with enough confidence to enforce policy." No further browser input was attempted. As AGENTS §2 permits when a browser cannot be exercised, alternate verification used real npm checks, local HTTP responses, manifest/icon inspection, installed Phaser source review, and service-worker precache inspection.
  - The earlier report's scene/seed assumptions and later-milestone deferrals remain unchanged.
- **Known issues**: Browser layout, console warnings/errors, touch/fullscreen behavior, orientation recovery, update/offline toasts, installation, and offline reload still need lead playtesting. npm reported six high-severity dependency audit findings during installation; no audit fix or version substitutions were made because the stack is pinned. No dependency/build/icon/format blocker remains.
- **Checks**: typecheck ✅ · test ✅ (**23 tests**, 1 file) · build ✅ (**main: 13,853 bytes / 5.68 kB gzip; Phaser: 1,208,050 bytes / 332.16 kB gzip; Workbox-window helper: 5,748 bytes**). Icons ✅ · format ✅ · clean-install dry run ✅ · exact dependency-pin check ✅ · `git diff --check` ✅. Dev: **5** checked URLs returned 200; preview: **21** checked URLs returned 200, covering all **18** precache entries. Browser QA: **not completed**, for the reason above.

### M0, Review
- **Verdict**: CHANGES REQUESTED (4 small items). The scaffold is solid and nearly everything passed in the browser. Don't redo the checks listed under **Verified by lead**.
- **Verified by lead** (Chrome, dev + preview):
  - typecheck ✅ · 23 tests ✅ · build ✅ · prettier ✅ · `npm audit --omit=dev` 0 vulnerabilities (the 6 high findings are dev-only tools, which is acceptable).
  - Title → Base → Hunt → Back works with mouse and with keyboard (Enter / Enter / Esc).
  - Layout: 844×390 gives 1556.6×720 at zoom 1. 1560×720 gives 1560×720. 1024×768 gives 1280×960 at zoom 1.333. Every size shows no letterboxing, with corner markers inset correctly and the frame centered.
  - Portrait shows the overlay. Starting in portrait and then going landscape boots and runs correctly.
  - Preview: the manifest is valid and installable, the service worker is active (scope `/undead-juice-co/`), all icons return 200, and with the server **stopped** a reload is served from the service worker with Lilita One rendering.
  - Network: only same-origin requests.
- **Accepted deviations**: `.npmrc` `legacy-peer-deps=true` (npm 10.9.7 resolver crash), the Map placeholder, fullscreen targeting `document.body` (good call: it keeps the DOM UI visible), and `game.pause()/resume()`.
- **Items**:
  1. **Uncaught promise rejection on Title.** The console shows `TypeError: not granted` (an EXCEPTION) whenever the browser refuses fullscreen. It reproduces with both a tap and Enter.
     - Cause: Phaser 3.90's `startFullscreen()` drops the promise that `requestFullscreen` returns (`node_modules/phaser/src/scale/ScaleManager.js:1346`).
     - Fix `src/platform/fullscreen.ts`: call `document.body.requestFullscreen({ navigationUI: 'hide' })` yourself, then `.then(() => lockLandscape())` and `.catch(() => {})`. Keep the iOS, standalone, and already-fullscreen guards, and use `document.fullscreenEnabled` for availability. Signature: `requestFullscreen(): void`.
     - Also in `src/scenes/TitleScene.ts`: start on canvas **`pointerup`**, not `pointerdown`. On Android, Phaser's pointerdown comes from `touchstart`, which is **not** a user-activation event, so fullscreen would always be refused on phones. (Phaser's own docs for `startFullscreen` say to use pointerup.) The DOM button's `click` path is fine.
  2. **The dev server doubles the base path for the icons.** In `npm run dev`, `index.html` requests `/undead-juice-co/undead-juice-co/icon.svg` and `…/apple-touch-icon-180x180.png`, and both return the HTML page. The production build is correct. Fix `index.html`: use root-absolute `href="/icon.svg"` and `href="/apple-touch-icon-180x180.png"` (Vite adds the base in both dev and build). Check both the dev HTML and `dist/index.html`.
  3. `src/scenes/HuntScene.ts`: the metrics label prints the raw fractional width (`1556.5574013844068 × 720`). Round it for display (keep the real value for layout).
  4. `vite.config.ts`: remove `server: { open: base }`. Auto-opening a browser isn't in the spec and gets in the way of headless runs. README already gives the URL.
- **Notes for M1+**: all dependencies are installed now, so later milestones need no network. Real-phone multi-touch and Android fullscreen get checked on a phone after the first deploy.

### M0, Fix report
- **Summary**: Fixed all four items in the latest M0 review. Changes remain uncommitted; M0 is `ready for review`.
- **Items fixed**:
  - [x] `src/platform/fullscreen.ts` now exposes `requestFullscreen(): void`, uses the native body fullscreen promise with `navigationUI: 'hide'`, locks landscape after success, and catches refusal. iOS, standalone, already-fullscreen, and `document.fullscreenEnabled` guards are preserved. Title calls the new signature and starts on canvas `pointerup`; the DOM click and keyboard paths remain available.
  - [x] `index.html` uses `/icon.svg` and `/apple-touch-icon-180x180.png`. Both the served dev HTML and `dist/index.html` contain exactly one `/undead-juice-co/` prefix; both dev icon requests return 200 with image MIME types.
  - [x] Hunt metrics round width/height only for display; layout and zoom still use the original values.
  - [x] Removed `server.open` from `vite.config.ts`; resolved Vite config confirms `server.open === false`. README now says to open the URL manually.
- **Verification**: Added seven focused tests in `tests/fullscreen.test.ts`: denied fullscreen without an unhandled rejection, landscape lock only after success, and all five guard scenarios. Ran `npm run dev` for the targeted HTML/icon HTTP checks, then stopped that server. The lead's completed layout, navigation, PWA/offline, network, and audit checks were not repeated. No interactive browser retest was performed this round; focused fullscreen verification used mocked browser APIs, and real-phone checks remain with the lead as noted in the review.
- **How to test**: At `http://localhost:5173/undead-juice-co/`, release a canvas tap or press Enter with fullscreen refused: Base should still open without an unhandled rejection. Confirm both icon links have one base prefix. At `?scene=hunt&debug=1`, a fractional live width should display as an integer.
- **Deviations / known issues**: None beyond the review's requested native fullscreen approach; no dependencies changed.
- **Checks**: typecheck ✅ · test ✅ (**30 tests**) · build ✅ (**main 13,905 bytes; Phaser 1,208,050 bytes**) · format ✅ · `git diff --check` ✅.

### M0, Review (round 2)
- **Verdict**: APPROVED
- **Verified**:
  - typecheck ✅ · 30 tests ✅ · build ✅ · prettier ✅.
  - Chrome: a canvas tap on Title goes to Base with **no console errors**, even though fullscreen is refused in the test browser.
  - Dev icon links resolve once to `/undead-juice-co/icon.svg` (200 `image/svg+xml`) and `/undead-juice-co/apple-touch-icon-180x180.png` (200 `image/png`), and `dist/index.html` matches.
  - Code: fullscreen uses the native promise with a catch, Title starts on `pointerup`, the metrics label is rounded, `server.open` is removed, and the new `tests/fullscreen.test.ts` is a good addition.
- **Next**: committed as M0 and deployed to GitHub Pages. Real-phone multi-touch and Android fullscreen get checked by the user on the live URL. The implementer proceeds to **M1**.
