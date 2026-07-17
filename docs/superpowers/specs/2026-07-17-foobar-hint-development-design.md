# Foobar Hint Development Design

Date: 2026-07-17
Status: Approved
Scope: Hint 4 for every hintable Foobar achievement

## Summary

Turn the final step of every Foobar hint ladder into an in-fiction 24-hour developing period. After
a hunter reveals hint 3, hint 4 appears as a smudged field-note fragment with the message that its
ink is still drying. Once 24 hours have elapsed, the fragment offers an explicit `Read developed
hint` action that reveals and records hint 4 through the existing clue flow.

The gate is local-first and derived from the existing hint 3 `seen_at` timestamp. It does not add a
new persisted field, D1 schema, generalized gate engine, or server-authoritative clock.

## Goals

- Discourage immediately clicking through all four hints.
- Create a natural reason to return without presenting a conventional paywall or timer gate.
- Make the delay feel like part of the existing expedition and Field Notes fiction.
- Preserve anonymous, offline-capable play and existing cloud merge behavior.
- Keep the final hint accessible after the wait and explicitly record when it is read.
- Measure aggregate development starts and developed-hint reads with privacy-light analytics.

## Non-goals

- Trade-secret, campfire, terminal, achievement-specific, or configurable gate policies.
- Server-enforced timing, clock-tamper prevention, or anonymous server identity.
- Changing hints 1-3, hint copy, completion requirements, scoring, or penalties.
- Adding a D1 migration or changing the Foobar persisted data shape.
- Proving that every developed-hint read occurred in a new browser session.

## Chosen Approach

Derive hint 4 availability from the persisted clue event for hint 3:

```txt
available_at = hint_3.seen_at + 24 hours
```

This uses the timestamp the game already records and syncs. It avoids duplicating a deadline that
could disagree with the clue event and keeps rollback code-only.

### Alternatives considered

1. Persist a separate `developing_until` deadline. This is explicit but duplicates existing data
   and adds normalization and merge cases.
2. Add generic catalogue gate policies for time, achievements, presence, and terminal conditions.
   This supports possible future ideas but is unnecessary architecture for one global rule.
3. Use a server-authoritative deadline. This resists local clock changes but breaks the current
   anonymous/offline-first model and adds infrastructure for a non-security-sensitive mechanic.

## Player Experience

### Starting development

Hints 1-3 retain their current interaction and presentation. When the hunter clicks the hint 3
reveal button:

1. The existing `recordFoobarClue` action records hint 3 with `seen_at: Date.now()`.
2. The normal hint 4 reveal button is replaced by a developing field-note fragment.
3. Plausible receives one `foobar_hint_development_started` event.

The developing fragment is labelled `Hint 4 · Developing` and says:

```txt
The ink is still drying. Return in 23h 59m.
```

The duration is derived from the remaining milliseconds and rounded up to the next minute so it
never displays zero before the deadline. The display updates on minute boundaries and when the page
regains visibility.

### Smudged note treatment

Use the approved smudged field-note treatment within the existing badge card. Decorative ink strokes
suggest that a line exists but cannot yet be read.

The actual hint 4 text must not be rendered while developing. A blurred real answer would still be
available through text selection, the accessibility tree, or DOM inspection. Decorative strokes are
hidden from assistive technology; the textual developing label and duration carry the meaning. The
effect is static under reduced motion and does not use a frequently updating live region.

### Reading the developed hint

At exactly 24 hours, including in a tab that remained open, the fragment becomes a
`Read developed hint` button. Clicking it:

1. Calls the unchanged `recordFoobarClue` action with hint 4's stable clue ID.
2. Displays hint 4 in the existing revealed-hints list.
3. Adds hint 4 to Field Notes with the click timestamp.
4. Emits one `foobar_developed_hint_read` event.

The timer makes the hint available; it does not silently mark the hint as seen.

### Existing and unusual progress

- Already revealed hint 4 entries remain visible and are never re-gated.
- A hint 3 timestamp at least 24 hours old is immediately ready to read.
- A historical hint 3 entry with `seen_at: null` is immediately ready because its reveal time cannot
  be reconstructed safely.
- Completing the achievement while hint 4 is developing replaces the hint UI with the existing
  completed state.
- A local clock moved forward can shorten the wait; a clock moved backward can lengthen it. This is
  accepted because the gate is not a security boundary.
- Invalid timestamps continue to be removed by existing normalization.

## Architecture

### Pure development policy

Add `src/lib/domains/foobar/hint-development.ts`. It owns:

- the 24-hour duration constant;
- a pure function that returns `not-started`, `developing`, or `ready` from hint 3's `seen_at` and an
  injected current time;
- the ready timestamp and remaining duration for the developing state;
- a pure analytics elapsed-bucket helper.

Passing the current time into pure functions keeps clock boundaries deterministic in tests. The
module does not import React, the Zustand store, or analytics.

### Badge integration

`badges.tsx` passes full `clues_seen` entries to each badge instead of reducing them to clue IDs. The
badge still derives its revealed hints from stable IDs. When the next unrevealed hint is hint 4, it
finds hint 3's clue entry and asks the pure policy for the current state.

A focused developing-state component owns only the live clock lifecycle:

- update the humanized display at minute boundaries;
- schedule an exact transition at `available_at`;
- re-evaluate when the document becomes visible after timer suspension;
- clean up timers and listeners on unmount.

Hints 1-3 and the mature `Read developed hint` action continue to use the existing store action.

### Persistence and sync

No store or schema changes are required. `FoobarClueSeen` already stores stable clue IDs with
timestamps, and the local persistence merge already validates them.

Authenticated cloud merging selects the earliest real timestamp for duplicate clue IDs. Therefore,
if hint 3 was revealed on multiple synced devices, development begins at the earliest known reveal.
If either side has a real timestamp and the other has `null`, the existing merge keeps the real
timestamp. Two historical `null` values remain `null` and are treated as mature by the UI.

## Analytics

Emit two custom Plausible events without clue text or identity:

| Event                                | When                         | Properties                         |
| ------------------------------------ | ---------------------------- | ---------------------------------- |
| `foobar_hint_development_started`    | Hint 3 is explicitly revealed | `achievement`, `wait_hours: 24`    |
| `foobar_developed_hint_read`         | Mature hint 4 is read         | `achievement`, `elapsed_bucket`    |

`elapsed_bucket` is one of:

- `24-48h` for elapsed time from 24 hours up to, but not including, 48 hours;
- `2-7d` for 48 hours up to, but not including, 8 days;
- `8d+` for 8 days or longer;
- `legacy` when hint 3 has no timestamp.

These events support aggregate comparison between starts and reads. They do not identify a hunter
or distinguish a true return visit from a tab kept open for 24 hours.

## Error Handling

- Missing hint 3 means development has not started and the existing sequential reveal path remains
  authoritative.
- Hint 4 already present means revealed, regardless of earlier clue irregularities.
- A suspended or backgrounded tab rechecks time on visibility and cannot remain permanently stale.
- Analytics absence or failure does not block clue recording or UI transitions.
- No secret hint text appears in the developing DOM, accessibility tree, or visual pseudo-content.

## Testing

### Vitest

Add focused tests for the pure development policy:

- missing hint 3 returns `not-started`;
- a fresh real timestamp returns `developing` and the expected deadline;
- one millisecond before the deadline remains `developing`;
- the exact deadline and later times return `ready`;
- `null` returns `ready` for historical progress;
- elapsed analytics bucket boundaries are exact.

### Browser coverage

Extend `e2e/foobar.spec.ts` with seeded timestamps rather than real waiting:

- reveal hint 3 and verify the developing state replaces the hint 4 reveal button;
- verify the real hint 4 text is absent from the DOM while developing;
- verify one start analytics event with the expected properties;
- seed a timestamp older than 24 hours and verify `Read developed hint` is available;
- read hint 4, reload, and verify it remains in the badge and Field Notes;
- verify one read analytics event with the expected elapsed bucket;
- include a developing badge in the existing mobile overflow check.

The implementation should run targeted Vitest and Playwright coverage first. Repository-wide
typecheck and build require explicit user instruction under the repository's testing convention.

## Rollback

Revert the pure helper, developing badge UI, analytics calls, and tests. There is no data or schema
rollback. Existing hint 3 and hint 4 clue entries remain valid, and the prior UI resumes offering
hint 4 immediately after hint 3.
