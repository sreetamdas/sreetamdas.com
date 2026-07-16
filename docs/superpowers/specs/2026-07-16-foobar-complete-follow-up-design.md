# Foobar Complete Follow-up Design

Date: 2026-07-16
Status: Approved by explicit user direction
Scope: Every follow-up item listed after the first Foobar slice

## Summary

Finish the Foobar game as a real, web-native scavenger hunt. Repair unreachable achievements,
preserve anonymous local play, add optional account-backed progress and public completion signals,
reuse the existing presence Durable Object for a multiplayer moment, provide a shareable completion
certificate, and add six clues hidden in genuine browser/web surfaces.

The live tree is authoritative. Earlier uncommitted Cloudflare Foobar experiments are not prior art.

## Product principles

- Anonymous localStorage remains the default; sign-in is optional and additive.
- A signed-in merge never loses valid progress from either the browser or D1.
- Every achievement has an accessible hint path even when its primary solution uses developer tools.
- Infrastructure creates a story moment; it is not presented as vendor homework.
- New clues stay out of normal navigation and search indexing.
- Completion and analytics are idempotent.

## 1. Reachability and instrumentation repairs

### Immutable store

Retain the first-slice immutable partial update and array-replacement regression test. No Lodash
merge is allowed at the Zustand or persistence boundary.

### Konami

Mount a site-wide sequence listener while Foobar is unlocked. Use the installed
`@tanstack/hotkeys` `SequenceManager` for:

`ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight B A`

The first successful sequence records the Plausible flag event and completes `konami` atomically.
The listener ignores form controls and unregisters on cleanup.

### Easter egg

The disguised Reddit social link on `/about` is the canonical trigger. It currently emits analytics
but does not update progress. Make that interaction call the same atomic completion action, guarded
against duplicates.

### Devtools clue

Replace the null `XMarksTheSpot` component with an inert DOM marker carrying
`data-foobar="/foobar/devtools"`. Keep it out of the accessibility tree and visual layout while
remaining inspectable in Elements/React DevTools.

### Analytics

Audit every non-route completion. `unlocked` already emits from the hidden X; retain it. Add missing
events for 404, Konami, Easter egg, presence, and any programmatic new completion. Route-based flags
continue emitting in `FoobarSchrodinger`.

## 2. Dashboard map

Keep the first-slice tier layout and muted silhouettes. Add a short non-spoiling teaser for every
locked achievement, separate from the persisted hint ladder and completed description. The first
hint remains an explicit reveal rather than being silently consumed by the teaser.

## 3. Optional account-backed progress

### Persisted model

Add `foobar_progress` keyed by Better Auth user ID:

- `progress_json`: normalized local-compatible Foobar state;
- `completed_at`: server-owned first full-completion timestamp;
- `public_profile`: opt-in leaderboard visibility;
- `certificate_id`: random, unique share token created on first full completion;
- created/updated timestamps.

### Merge semantics

Merge local and remote data deterministically on sign-in and again on every server write:

- booleans use logical OR;
- visited pages and completed achievements use stable first-seen union;
- clue IDs are unique; a real timestamp wins over `null`, otherwise the earliest timestamp wins;
- malformed/unknown values are removed by the existing normalizer;
- `all_achievements` is recomputed from the current required catalogue, never trusted from a client.

The merged result replaces local state once, then later local changes are debounced to D1. A stale
browser cannot erase newer server progress because the server merges before upsert.

### UI and public data

The dashboard shows:

- signed out: “Sign in to save progress” with existing Google/Cloudflare login routes;
- signed in: sync status, account name, public-profile toggle, and certificate link when eligible;
- everyone: aggregate finisher count and an opt-in top-20 completion list ordered by completion time.

Only name and completion time appear on the public list. The aggregate count includes private
finishers; certificate URLs are unguessable bearer links.

## 4. Campfire presence achievement

Extend the existing global presence protocol with an optional hunter marker and a `hunters` count.
The Durable Object still deduplicates by client ID. A Foobar-unlocked browser opens a hunter-marked
connection; when at least two distinct hunters are active, each receives the count and completes the
non-route `campfire` achievement.

The dashboard presents connection/count status, and hints explain that another hunter must be
present. Existing global live-viewer behavior remains compatible.

## 5. Shareable completion certificate

Signed-in completion creates a stable certificate token. `/foobar/certificate/$token` renders a
public certificate with player name, completion time, achievement count, and “Browser Goblin
Supreme” title. Unknown tokens return 404.

The route exposes a generated certificate Open Graph image at
`/api/foobar/certificate/$token/og.png`. The image is rendered at request time from verified D1 data;
no client-supplied name or completion claims are trusted. The page offers native share/copy-link
controls with a plain-link fallback.

## 6. Web-surface achievements

Each item is a normal required achievement with four hints and a completion note. Visiting the
discovered `/foobar/<slug>` route completes it.

### `paper-trail` — Site Archaeology

Place a comment in `robots.txt` and a matching note in `/.well-known/security.txt` pointing to
`/foobar/paper-trail`. Keep `/foobar` disallowed.

### `print-preview` — Browser Goblin

Render an otherwise hidden dashboard note that becomes visible only under `@media print`, pointing
to `/foobar/print-preview`.

### `feed-reader` — Site Archaeology

Inject a stable XML comment into the generated RSS feed pointing to `/foobar/feed-reader`.

### `cookie-jar` — Protocol / Web Weirdness

`/api/foobar/cookie` plants a scoped `foobar-cookie=sealed` cookie and explains that the value must
be changed to `open-sesame`. A request with the edited cookie reveals `/foobar/cookie-jar`.

### `service-worker` — Protocol / Web Weirdness

After Foobar unlock, register `/foobar-sw.js`. The worker intercepts only
`/foobar/service-worker-clue` and returns the route `/foobar/service-worker`; all other traffic is
untouched. Hints provide an Application-panel and direct-fetch path.

### `og-qr` — Site Archaeology

Add a small scannable QR code to the existing site Open Graph image. It encodes the canonical
`https://sreetamdas.com/foobar/og-qr` URL. The QR is visually integrated but not labelled as a
Foobar clue.

## Completion and migration

`completed` requires every catalogue achievement except itself. This includes the non-route
`campfire` achievement. Adding achievements intentionally reopens the endgame for previous players;
their historical progress and notes remain intact, but `all_achievements` is recomputed false until
the new map is complete.

Reset clears local progress and, when signed in, offers a separate explicit cloud reset rather than
silently deleting remote data.

## Verification

- Pure Vitest: catalogue completeness, merge semantics, normalization, sequence helper, static clue
  generation, cookie protocol, certificate validation, and progress data behavior.
- Worker tests: hunter-aware Durable Object counts and backwards-compatible viewer counts.
- Playwright: legacy state, locked teasers, Konami, Easter egg, devtools marker, static clue routes,
  service worker clue, account signed-out UI, certificate not-found, and mobile layout.
- Staging: D1 migration, real two-browser campfire, static files/API clues, generated QR/OG image,
  certificate route where auth is available, and `/about` regression check.
