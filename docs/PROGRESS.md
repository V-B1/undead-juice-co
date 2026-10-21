# Progress log

The implementer appends a **Report** after each task (and a **Fix report** after each fix round). The lead appends a **Review**. Newest entries go at the bottom. Never edit or delete earlier entries.

## Status board

| Task | Status | Live build |
|---|---|---|
| M0 | not started | |
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
