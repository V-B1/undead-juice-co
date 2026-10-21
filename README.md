# Undead Juice Co.

A landscape mobile web game, installable as an app (PWA). Hunt goofy zombies with balloon harpoons and a jetpack, squeeze them into juice, sell it, upgrade your gear, and unlock new areas.

Its gameplay is inspired by *Zombie Catchers*. All names, characters, art, and audio are original.

- **Play**: https://v-b1.github.io/undead-juice-co/ (updated after every approved milestone; it's playable from M4). On a phone, open the link and choose "Add to Home Screen" or "Install app".
- **Design**: [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Build plan**: [docs/TASKS.md](docs/TASKS.md) · **Progress**: [docs/PROGRESS.md](docs/PROGRESS.md)
- **Rules for the coding agent**: [AGENTS.md](AGENTS.md)

## Run it locally

Use Node.js 20.19+ (or 22.12+) and npm. From the repository root:

```sh
npm ci
npm run dev
```

The project `.npmrc` enables legacy peer resolution to avoid an npm 10 resolver crash and keep clean installs consistent with the lockfile. All direct dependency versions remain pinned.

Open <http://localhost:5173/undead-juice-co/>. Vite's terminal output also lists a LAN URL for phone testing on the same Wi-Fi. Use landscape; portrait displays the rotate overlay. Tap **Tap to start**, then **Go hunt** to open the M0 multi-touch and safe-frame test. Keyboard: Enter/Space starts, Enter in the yard opens Hunt, Escape in Hunt returns.

Fast paths: `?scene=hunt&area=bayou&debug=1&seed=42` shows pointer ids, dimensions, camera zoom, safe corners, and FPS; `?scene=gallery` opens the placeholder Gallery. `title`, `base`, and `map` are also supported. `night=1` and `boss=1` are parsed for later milestones.

```sh
npm run typecheck
npm test
npm run build
npm run preview
npm run format
```

Preview serves <http://localhost:4173/undead-juice-co/>. Open it online once and wait for **Ready to play offline**, then reload offline to check the installed shell and bundled Lilita One font. Service workers require HTTPS or localhost; ordinary HTTP LAN access supports gameplay testing, but not PWA installation. Check layouts at 844×390, 1280×720, 1560×720, and 1024×768.

Edit `public/icon.svg` and run `npm run icons` to regenerate the PWA PNGs. The deploy command is reserved for the lead; implementers leave changes uncommitted for review.
