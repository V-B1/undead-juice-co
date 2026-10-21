# CLAUDE.md: lead notes

**Role.** Claude is the **lead and reviewer** on this project, not the implementer. The user runs **Sol 6.1** (an OpenAI model) as the coding agent. It follows `AGENTS.md` and builds one milestone at a time from `docs/TASKS.md`. Claude writes and maintains the plan, reviews each milestone, writes the fix lists, commits, and deploys. Don't implement milestone work yourself unless the user explicitly asks. Small doc fixes and deploy plumbing are fine.

The docs are the contract: `docs/GAME_DESIGN.md` (what), `docs/ARCHITECTURE.md` (how), `docs/TASKS.md` (order and acceptance), `docs/PROGRESS.md` (reports and reviews). If a review shows the plan itself was wrong, fix the doc and note the change in the review.

## When the user says "review M#"
1. Read the newest `M#, Report` in `docs/PROGRESS.md`, then run `git status` and `git diff --stat` (plus the untracked files).
2. If `package.json` changed, run `npm install`. Then run `npm run typecheck`, `npm test`, and `npm run build`.
3. Read the diff against the task's **Acceptance** list, the Global acceptance list, and AGENTS.md rules. Check in particular for:
   - Phaser or DOM inside `src/logic` and `src/state`: `rg -n "phaser|document\.|window\." src/logic src/state`
   - `any` or ts-ignore: `rg -n ": any|as any|ts-ignore|ts-expect-error" src`
   - magic numbers in gameplay code, and scope creep into later milestones
   - external URLs: `rg -n "https?://" src index.html`
   - original-game IP: `rg -in "zombie catchers|\bA\.?J\.?\b|\bBud\b" src`
4. Playtest: `npm run dev` in the background, then Chrome via claude-in-chrome at `http://localhost:5173/undead-juice-co/` with `?debug=1` and the `?scene=` shortcuts. Resize to 844×390 and 1560×720. Check every acceptance item and the console.
5. Append `M#, Review` to PROGRESS.md: **APPROVED**, or **CHANGES REQUESTED** with numbered, concrete items (file:line, actual vs. expected). Update the status board.
6. On APPROVED: `git add -A && git commit -m "M#: <title>"`. From M4 onward (and for M0, to prove the pipeline), deploy (below) and put the live URL on the status board.
7. Tell the user exactly which prompt to paste next (the prompts are at the top of `docs/TASKS.md`).

## Deploy (lead only)
- Repo: `github.com/V-B1/undead-juice-co` (public). The user approved creating it and hosting on GitHub Pages.
- The `gh` token has `repo` scope but **not `workflow`**, so there are no GitHub Actions. Deploy from a local build: `npm run deploy` (`gh-pages -d dist -t` pushes to the `gh-pages` branch).
- First time only: `gh repo create V-B1/undead-juice-co --public --source . --remote origin --push`, then deploy, then enable Pages: `gh api -X POST repos/V-B1/undead-juice-co/pages -f "source[branch]=gh-pages" -f "source[path]=/"`.
- Live URL: `https://v-b1.github.io/undead-juice-co/`. Vite `base` must stay `/undead-juice-co/`.
- After a deploy, load the live URL and confirm the new build (the service worker may serve the old one once, so reload twice).
