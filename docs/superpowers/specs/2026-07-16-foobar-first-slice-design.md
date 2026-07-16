# Foobar First Slice: Tiers, Hint Ladder, and Clue Log

Date: 2026-07-16
Status: Approved by delegated user direction
Scope: Existing `/foobar` achievements only

## Summary

Improve the hidden `/foobar` game without adding new puzzles. The dashboard becomes a map of five
difficulty tiers, every navigable achievement receives an intentional four-step hint ladder, and a
persisted field-notes timeline records achievement completions and hints the player explicitly
reveals.

The game remains a site-wide scavenger hunt. The dashboard helps players understand and resume the
journey, but it does not become the place where challenges are solved.

## Goals

- Replace the flat badge wall with readable tier sections and progress counts.
- Replace the five-click hidden-description behavior with accessible, explicit hint controls.
- Give players a local, chronological record of solved achievements and revealed hints.
- Preserve progress for browsers with the existing persisted Zustand state.
- Keep tier metadata presentational and preserve the current completion rules.
- Keep all data local to the browser; no API, D1, identity, or analytics expansion is required.

## Non-goals

- New achievements or Cloudflare-backed puzzles.
- Trace-level instrumentation for console, source, headers, storage, or other clue surfaces.
- Terminal, completion card, constellation, or social features.
- Tier gating, tier-specific completion logic, scoring, penalties, or timed hint unlocks.
- Rebuilding the broader Foobar architecture described in stale, uncommitted memories.

## Chosen Approach

Use a catalog-driven model. The achievement catalogue owns tier, difficulty, hint, and completion
note copy. Persisted state stores only stable clue IDs and discovery times. UI components resolve
those IDs through the catalogue.

This approach keeps copy and game metadata together, avoids persisting display text, and allows copy
to evolve without migrating localStorage.

### Alternatives considered

1. Derive the clue log from completed achievements and a per-badge hint count. This stores less data,
   but cannot preserve chronology and makes deduplication or future clue types awkward.
2. Introduce a generic event stream for every browser trace. This best matches the long-term vision,
   but requires instrumentation across unrelated site surfaces and is too broad for the first slice.
3. Record completions only. This is simplest, but makes the clue log a duplicate badge list and gives
   players no partial-progress history.

## Achievement Catalogue

### Tier catalogue

Define the five tiers once, in display order, with a stable key, label, difficulty, and short flavor
description:

| Key | Label | Difficulty | Purpose |
| --- | --- | ---: | --- |
| `discovery` | Warmup / Discovery | 1 | Learn that the site hides things. |
| `browser` | Browser Goblin | 2 | Use browser behavior and developer tools. |
| `archaeology` | Site Archaeology | 3 | Learn from wrong turns and site structure. |
| `protocol` | Protocol / Web Weirdness | 4 | Look below rendered pages into web protocols. |
| `meta` | Meta / Endgame | 5 | Finish or reset the overall journey. |

Tier definitions are presentational. Existing route slugs and `checkIfAllAchievementsAreDone`
remain authoritative for completion.

### Existing achievement mapping

| Tier | Achievements |
| --- | --- |
| Discovery | `unlocked`, `source-code`, `headers`, `localforage`, `teapot` |
| Browser | `devtools`, `hack`, `offline`, `navigator`, `easter-egg`, `konami` |
| Site Archaeology | `error404`, `dogs` |
| Protocol | `dns-txt` |
| Meta | `completed` |

`restart` remains in the catalogue for the reset action and analytics event, but is not rendered as
tier progress. Resetting immediately clears progress, so treating it as a persistent achievement
would make the Meta tier misleading or impossible to complete.

### Per-achievement metadata

Each rendered achievement receives:

- `tier`: one of the five stable tier keys;
- `difficulty`: the corresponding numeric difficulty;
- `hints`: four strings, ordered from oblique to direct;
- `completedNote`: a short field-note sentence shown after completion.

All 14 navigable achievements receive complete hint ladders now. There is no fallback to the old
five-click description reveal. `completed` has a completion note but no hint ladder. `restart` has
neither tier progress nor hints.

The existing `description` remains concise badge copy and is shown for completed achievements.

## Hint Ladder

### Interaction

- A locked badge initially shows its name, tier context, and a `Reveal hint 1 of 4` button.
- Each press explicitly reveals exactly one additional hint.
- Previously revealed hints remain visible after reload.
- The control updates its accessible name and visible count at every level.
- After hint four, the reveal control disappears and all four hints remain visible.
- Completing an achievement replaces hint controls with the existing completion description.
- Revealing hints does not alter achievement completion, score, or final-completion eligibility.

There are no timers, failed-attempt counters, repeated badge-click secrets, or artificial costs. An
intentional button is more understandable on touch devices and usable with keyboard and assistive
technology.

### Hint copy policy

The four levels follow a consistent progression:

1. Point at the relevant layer of the web without naming the tool.
2. Name the browser surface or behavior to inspect.
3. Name the concrete signal, route family, or action.
4. Give the direct route or exact action needed to finish.

Hints should retain the haunted-site voice while remaining operationally accurate.

## Clue Log

### Product role

Badges answer “what have I solved?” Field notes answer “how did I get here?” The clue log is a local,
persisted investigation journal, not a public feed and not a replacement for achievements.

### Recording policy

The first slice records exactly two event types:

- an achievement is completed;
- a hint is explicitly revealed.

The log does not infer that a player saw a clue merely because code planted it or a page rendered.
Trace encounters can be added later when each surface has a trustworthy player-facing event.

### Stable IDs and persisted shape

Persist entries as catalogue references rather than display copy:

```ts
type FoobarClueSeen = {
	id: FoobarClueId;
	seen_at: number | null;
};
```

Stable IDs use these forms:

```txt
<achievement>:completed
<achievement>:hint:1
<achievement>:hint:2
<achievement>:hint:3
<achievement>:hint:4
```

`seen_at` is a Unix timestamp for new events. A `null` timestamp means the completion was imported
from pre-feature progress and its original time is unknown.

Recording is idempotent by ID. Re-rendering, React effect replay, revisiting a route, or pressing an
already-consumed control cannot duplicate a field note.

### Timeline display

- Show a `Field notes` section beneath tier progress.
- Sort timestamped entries chronologically, with imported `null` entries first.
- Label imported entries `Earlier` instead of inventing a time.
- Render completion entries with the achievement's `completedNote`.
- Render hint entries with the exact hint text the player chose to reveal.
- Show a concise empty state when no notes exist.
- Do not show undiscovered placeholders or answers for unrevealed hints.

## State and Persistence

Extend `FoobarDataType` with `clues_seen: FoobarClueSeen[]` and initialize it to an empty array.

Add focused store actions:

- `completeFoobarFlag(flag)`: append an achievement once and atomically record its completion note;
- `recordFoobarClue(id)`: append a clue once with the current time.

Replace existing direct writes to the `completed` array with `completeFoobarFlag` so route, 404,
navigator, and entry-related completions all use one invariant-preserving path. Existing analytics
events remain at their current call sites.

### Existing-browser normalization

The custom Zustand persistence merge treats persisted input as unknown and normalizes it before use:

- retain valid existing fields and apply current defaults for missing fields;
- retain only known achievement names in `completed`;
- retain only valid, unique clue entries;
- add one `<achievement>:completed` entry with `seen_at: null` for each valid existing completion that
  has no completion clue;
- preserve the order of the existing `completed` array for imported notes;
- ignore malformed persisted values rather than using type assertions;
- retain current store methods from the live state.

No persisted version bump is required. Normalization at the merge boundary handles both the old
shape and future partial/corrupt values without discarding valid progress.

Resetting uses the new initial state and therefore clears field notes along with all other Foobar
progress.

## Components and Data Flow

### Catalogue and pure helpers

`flags.tsx` remains the canonical achievement catalogue and gains tier/hint/story metadata plus
runtime guards for flag and clue IDs. Pure helpers resolve clue IDs and group achievements by tier.

### Store

`store.ts` owns normalization, deduplicated recording, and atomic completion updates. Components do
not manually concatenate `completed` or `clues_seen`.

### Dashboard

`badges.tsx` renders tier sections, progress counts, completed descriptions, and hint controls.
Create a focused field-notes component rather than adding timeline parsing to
`DashboardClient.tsx`; the dashboard only selects state and composes the two views.

### Completion flow

1. An existing game event identifies a completed achievement.
2. Existing analytics fires at the event's current call site.
3. `completeFoobarFlag` records the flag and completion clue if each is missing.
4. The relevant tier count and field-notes timeline update from the same state transition.

### Hint flow

1. The badge derives revealed levels from clue IDs already in `clues_seen`.
2. The next hint button records that level's stable clue ID.
3. The store deduplicates and timestamps it.
4. The badge and field-notes timeline update from persisted state.

## Error Handling and Edge Cases

- Unknown flags and clue IDs from localStorage are ignored during normalization.
- Duplicate persisted clue IDs keep the first valid occurrence.
- Missing catalogue metadata is caught by TypeScript rather than silently falling back.
- Repeated completion calls are no-ops for both progress and notes.
- A completed achievement does not expose or synthesize unrevealed hint notes.
- Imported completions do not receive fabricated discovery timestamps.
- `completed` remains a special badge driven by `all_achievements`; its completion note is recorded
  when that state first becomes true.
- Tier counts exclude `restart` and use the existing special rule for `completed`.

## Testing

Add Vitest coverage for pure state and catalogue behavior:

- old persisted state gains `clues_seen` without losing progress;
- valid old completions receive deduplicated `Earlier` completion notes;
- malformed flags, clue IDs, timestamps, and duplicate entries are removed;
- recording the same clue twice is idempotent;
- completing a flag atomically records progress and one completion note;
- all rendered achievements belong to exactly one tier;
- every navigable achievement has exactly four non-empty hints;
- `restart` is excluded from tier progress;
- tier progress treats `completed` through `all_achievements`.

Use the existing browser/E2E tooling for a focused user journey if practical: seed old persisted
state, load `/foobar`, confirm tier grouping and imported notes, reveal a hint, reload, and confirm it
persists. Otherwise verify the same flow directly on staging with browser automation after deploy.

Before pushing, run the repository's lint, targeted tests, typecheck, and build. After pushing to
`dev`, verify the deployed staging dashboard at `https://staging.sreetamdas.com/foobar` using seeded
local Foobar state and confirm both desktop and mobile layouts.

## Rollback

The feature is client-only and additive to persisted state. Reverting the UI and store code leaves
the extra `clues_seen` field harmless in localStorage because the previous persistence merge ignores
unknown nested fields. No database or server rollback is required.
