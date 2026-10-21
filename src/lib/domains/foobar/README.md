# Foobar

A web-native scavenger hunt hidden across the site. The `/foobar` dashboard behaves like a
404 until the hidden entry point on `/about` flips persisted state; from there, players
complete achievements by poking at genuine browser and web-platform surfaces (headers, DNS
TXT records, service workers, print styles, the RSS feed, …).

The original design docs were removed from the repo in `963f204a`; read them with
`git show 963f204a^:docs/superpowers/specs/2026-07-16-foobar-first-slice-design.md` (and
`…-foobar-complete-follow-up-design.md`).

## Principles

- Anonymous localStorage play is the default; sign-in is optional and additive.
- Merges are lossless and forward-only: neither the browser nor D1 can erase the other's
  discoveries. `all_achievements` is always recomputed server-side, never trusted.
- Individual discoveries are still self-reported by the browser, so certificates and the
  Finishers list are an honour system; nothing here should gate anything valuable.
- The hunt ends with a final puzzle. Finishing every required achievement in a tier reveals that
  tier's word (`FOOBAR_PUZZLE_TIER_WORDS`); in tier order the words spell the reward address for
  `completed`. That address only awards once every puzzle tier is finished, and
  `normalizeFoobarData` drops a `completed` claim that skips a tier.
- `completed_at` is when the player actually finished: the latest required completion clue,
  clamped to the server's clock. The Finishers list has no ranks and only includes saves that
  solved the final puzzle; earlier finishers keep their certificate but drop off the list until
  they solve it.
- Deleting a cloud save leaves a disabled server tombstone. Background writes cannot recreate
  it; the player must explicitly enable cloud saving again from the retained browser progress.
- Cloud lifecycle changes propagate between open tabs through a storage event; retryable failures
  identify the failed operation instead of collapsing every error into a generic status.
- Operational telemetry records lifecycle operation names only—never user IDs or progress.
- Every achievement has a four-step hint ladder, so devtools-centric puzzles stay accessible.
- Reward pages use meaningful word addresses. The catalogue is still public, so this stops
  guessing rather than verifying a player.
- Clues stay out of normal navigation and search indexing (`/foobar` is disallowed in
  `robots.txt`).
- Stars follow Advent of Code: gold for a discovery found without opening any of its hints,
  silver once a hint was opened (`getFoobarStar`). Certificates expose only the per-discovery
  star, never the hint log or its timestamps.

## Look

An unlocked `/foobar` is an Advent of Code style page in the Karma palette, all Iosevka, and
dark-only. `data-foobar-karma` on `<html>` forces the palette (global.css); an early head
script sets it before first paint when stored progress is unlocked or the page is a
certificate, `useFoobarKarma` owns it while a Foobar surface is mounted, and `Pixel.tsx`
clears it on any route outside `/foobar`. A locked `/foobar` keeps the visitor's theme, since it
must look like a normal 404.

The centrepiece is the ASCII mountain (`mountain.ts`): one row per achievement, generated from
the catalogue with a fixed seed, summit first and Basecamp at the foot, so difficulty reads as
altitude. Progress only colours it: a found row lights in its tier's Karma colour with its star,
and `@` marks the next unfound discovery. Adding an achievement makes the mountain taller.

## File map

| File                                                         | Owns                                                                                                                                                        |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `catalog.ts`                                                 | Canonical achievement title/tier/hint/teaser metadata and clue-ID resolution. Pure data — everything else derives from it.                                  |
| `codes.ts`                                                   | Reward addresses and path construction, kept free of React for scripts and tests.                                                                           |
| `flags.tsx`                                                  | Routable slugs (derived from `codes.ts`), icons, and dashboard descriptions per achievement.                                                                |
| `store.ts`                                                   | Zustand slice + `normalizeFoobarData`, which makes stale/malformed persisted state inert.                                                                   |
| `Pixel.tsx`                                                  | Site-wide instrumentation: visit tracking (`navigator`), Konami, 404, campfire completion, tab-visibility clue, service-worker registration, console clues. |
| `DashboardClient.tsx`                                        | The `/foobar` gate (`FoobarSchrodinger`), dashboard layout, local-only reset.                                                                               |
| `CloudProgressPanel.tsx` / `cloud-sync-*.ts`                 | Optional account-backed save UI: bootstrap merge, debounced D1 sync, stale-response invalidation, cross-tab lifecycle, explicit reset.                      |
| `cloud-progress.ts`                                          | Pure merge rules (client + server shared).                                                                                                                  |
| `cloud-progress.server.ts` / `cloud-progress.data.server.ts` | Server-function boundary and D1 persistence (`foobar_progress` table).                                                                                      |
| `certificate*.ts(x)`                                         | Public completion certificates keyed by unguessable token, plus OG image data.                                                                              |
| `sharedHunterPresence.ts`                                    | One hunter-flagged presence socket shared across components (campfire achievement).                                                                         |
| `helpers.ts`                                                 | Browser-only clue plumbing: console art, localStorage clue.                                                                                                 |
| `AchievementReveal.tsx`                                      | Transient visual acknowledgement queue for newly earned achievements; never persisted or replayed after hydration. Always drawn in Karma.                   |
| `mountain.ts` / `MountainArt.tsx`                            | The generated ASCII mountain and its progress-coloured rendering (dashboard rows are the field-entry buttons; the certificate draws it static).             |
| `EntryArticle.tsx` / `FieldNotes.tsx` / `Entry.tsx`          | Dashboard presentation: the open field entry (hints, developing hint 4, star) and the `tail foobar.log` field notes.                                        |
| `karma.ts` / `useFoobarKarma.ts` / `Bracketed.tsx`           | Tier colours, the dark-only document flag and its early script, and AoC style `[links]` with the brackets kept out of accessible names.                     |
| `certificate-card.ts` / `fonts/`                             | The share card HTML for workers-og and the Iosevka TTFs it needs (satori cannot read woff2; provenance in `.config/iosevka-build-plan.toml`).               |

Routes: `src/routes/(main)/(foobar)/foobar/` (dashboard, `$slug` achievement pages,
`certificate/$token`) and `src/routes/(api)/api/foobar/` (cookie challenge, certificate OG
image). Static clue surfaces: `public/robots.txt`, `public/.well-known/security.txt`,
`public/foobar-sw.js`, `public/.well-known/foobar`, the generated RSS feed, and the
Foobar-only social card (`public/og-foobar.png`).

## Adding an achievement

1. Add the entry (tier, hints, completion note, teaser) to `catalog.ts`.
2. If the achievement has a reward page, add its address to `codes.ts`, then add its flag to
   `FOOBAR_FLAGS` in `flags.tsx` — a `slug` makes `/foobar/<address>` routable and
   auto-completes on visit; omit it for programmatic achievements (complete those via
   `completeFoobarFlag` and emit the analytics event).
3. Hide the actual clue in whatever surface the puzzle uses.
4. Note: new achievements intentionally reopen the endgame for previous finishers; their
   `completed_at`/certificate in D1 are preserved.

## Tests

Unit tests sit next to their sources (`*.test.ts`); Playwright coverage is in
`e2e/foobar.spec.ts`. The authenticated browser fixture is statically available only in
`VITE_CI=1` builds and uses an exact CI-only cookie; production builds cannot activate it.
