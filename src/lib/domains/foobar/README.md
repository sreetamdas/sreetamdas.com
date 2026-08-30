# Foobar

A web-native scavenger hunt hidden across the site. The `/foobar` dashboard behaves like a
404 until the hidden entry point on `/about` flips persisted state; from there, players
complete achievements by poking at genuine browser and web-platform surfaces (headers, DNS
TXT records, service workers, print styles, the RSS feed, …).

Design history lives in `docs/superpowers/specs/2026-07-16-foobar-first-slice-design.md` and
`docs/superpowers/specs/2026-07-16-foobar-complete-follow-up-design.md`.

## Principles

- Anonymous localStorage play is the default; sign-in is optional and additive.
- Merges are lossless and forward-only: neither the browser nor D1 can erase the other's
  discoveries. `all_achievements` is always recomputed server-side, never trusted.
- Deleting a cloud save leaves a disabled server tombstone. Background writes cannot recreate
  it; the player must explicitly enable cloud saving again from the retained browser progress.
- Cloud lifecycle changes propagate between open tabs through a storage event; retryable failures
  identify the failed operation instead of collapsing every error into a generic status.
- Operational telemetry records lifecycle operation names only—never user IDs or progress.
- Every achievement has a four-step hint ladder, so devtools-centric puzzles stay accessible.
- Clues stay out of normal navigation and search indexing (`/foobar` is disallowed in
  `robots.txt`).

## File map

| File                                                         | Owns                                                                                                                                                        |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `catalog.ts`                                                 | Canonical achievement title/tier/hint/teaser metadata and clue-ID resolution. Pure data — everything else derives from it.                                  |
| `flags.tsx`                                                  | Routable slugs, icons, and dashboard descriptions per achievement.                                                                                          |
| `store.ts`                                                   | Zustand slice + `normalizeFoobarData`, which makes stale/malformed persisted state inert.                                                                   |
| `Pixel.tsx`                                                  | Site-wide instrumentation: visit tracking (`navigator`), Konami, 404, campfire completion, tab-visibility clue, service-worker registration, console clues. |
| `DashboardClient.tsx`                                        | The `/foobar` gate (`FoobarSchrodinger`), dashboard layout, local-only reset.                                                                               |
| `CloudProgressPanel.tsx` / `cloud-sync-*.ts`                 | Optional account-backed save UI: bootstrap merge, debounced D1 sync, stale-response invalidation, cross-tab lifecycle, explicit reset.                      |
| `cloud-progress.ts`                                          | Pure merge rules (client + server shared).                                                                                                                  |
| `cloud-progress.server.ts` / `cloud-progress.data.server.ts` | Server-function boundary and D1 persistence (`foobar_progress` table).                                                                                      |
| `certificate*.ts(x)`                                         | Public completion certificates keyed by unguessable token, plus OG image data.                                                                              |
| `sharedHunterPresence.ts`                                    | One hunter-flagged presence socket shared across components (campfire achievement).                                                                         |
| `helpers.ts`                                                 | Browser-only clue plumbing: console art, localStorage clue.                                                                                                 |
| `AchievementReveal.tsx`                                      | Transient visual acknowledgement queue for newly earned achievements; never persisted or replayed after hydration.                                          |
| `badges.tsx` / `FieldNotes.tsx` / `Entry.tsx`                | Dashboard presentation.                                                                                                                                     |

Routes: `src/routes/(main)/(foobar)/foobar/` (dashboard, `$slug` achievement pages,
`certificate/$token`) and `src/routes/(api)/api/foobar/` (cookie challenge, certificate OG
image). Static clue surfaces: `public/robots.txt`, `public/.well-known/security.txt`,
`public/foobar-sw.js`, `public/.well-known/foobar`, the generated RSS feed, and the site OG image's QR code.

## Adding an achievement

1. Add the entry (tier, hints, completion note, teaser) to `catalog.ts`.
2. Add its flag (slug, icon, description) to `FOOBAR_FLAGS` in `flags.tsx` — a `slug` makes
   `/foobar/<slug>` routable and auto-completes on visit; omit it for programmatic
   achievements (complete those via `completeFoobarFlag` and emit the analytics event).
3. Hide the actual clue in whatever surface the puzzle uses.
4. Note: new achievements intentionally reopen the endgame for previous finishers; their
   `completed_at`/certificate in D1 are preserved.

## Tests

Unit tests sit next to their sources (`*.test.ts`); Playwright coverage is in
`e2e/foobar.spec.ts`. The authenticated browser fixture is statically available only in
`VITE_CI=1` builds and uses an exact CI-only cookie; production builds cannot activate it.
