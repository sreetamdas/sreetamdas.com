# Foobar Complete Follow-up Implementation Plan

**Goal:** Implement every explicitly requested Foobar follow-up on `dev`, with granular commits and
staging proof.

**Design:** `docs/superpowers/specs/2026-07-16-foobar-complete-follow-up-design.md`

## Task 1: Repair existing achievement reachability

- Add failing behavior tests for the immutable store regression, Konami sequence, Easter egg
  completion, devtools marker, and missing programmatic analytics.
- Implement a TanStack Hotkeys sequence listener and mount it site-wide after unlock.
- Complete Easter egg from the existing disguised social link.
- Render the inert `data-foobar` devtools marker.
- Audit/add missing Plausible events.
- Commit: `fix(foobar): restore hidden achievement triggers`

## Task 2: Expand the catalogue and visible map

- Add the seven new achievements (`campfire` plus six web-surface flags), tiers, icons, completion
  notes, four hints, and locked teasers.
- Update completion rules to include required non-route achievements and recompute stale endgame
  state during normalization.
- Render teasers without consuming hint progress.
- Commit: `feat(foobar): expand the achievement map`

## Task 3: Add static/browser-surface clues

- Add robots/security, print, RSS, cookie API, service-worker, and QR/OG-image clues with focused
  tests.
- Register the service worker only for unlocked players.
- Regenerate the RSS feed and OG image, retaining only intentional generated assets.
- Commit static/browser pieces in independently revertible commits when practical.

## Task 4: Add the campfire presence achievement

- Extend the presence protocol and Durable Object attachment/counts with hunter presence.
- Keep existing viewer clients backwards compatible.
- Add a Foobar hunter client hook/status and atomic completion/analytics at two hunters.
- Run unit and worker-runtime tests.
- Commit: `feat(foobar): add multiplayer campfire achievement`

## Task 5: Add Better Auth progress sync and finishers

- Add D1 schema/migration and pure local/remote merge behavior with tests.
- Add authenticated server functions/data access for load, merge-upsert, public toggle, aggregate
  count, leaderboard, and reset.
- Add dashboard cloud-save UI using existing OAuth routes; localStorage remains anonymous default.
- Commit migration/data, server API, and UI as separate logical units.

## Task 6: Add completion certificates and generated OG images

- Create stable certificate tokens for completed signed-in users.
- Add certificate data loader, public route, share/copy UI, and dynamic PNG endpoint.
- Add route/meta/data tests and not-found behavior.
- Commit: `feat(foobar): add shareable completion certificates`

## Task 7: Final verification and staging

- Run formatter/autofix and inspect every change.
- Run unit, worker, typecheck, build, Foobar Playwright, and lint suites.
- Apply the D1 migration to staging, push `dev`, and poll Cloudflare staging.
- Verify all static/API/browser clues, two-browser campfire, anonymous and signed-out sync UI,
  certificate/OG behavior available without credentials, 390x844 layout, and `/about`.
- Record exact commands, commits, URLs, statuses, and any credential-bound verification limits.

