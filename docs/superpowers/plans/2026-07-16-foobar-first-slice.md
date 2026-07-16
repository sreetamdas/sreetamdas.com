# Foobar First Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing flat Foobar badge wall into five progress tiers with persistent four-step hint ladders and a chronological field-notes log.

**Architecture:** Add a pure TypeScript catalogue for tier, hint, and clue metadata; keep route/icon metadata in `flags.tsx`. Make the Zustand slice the sole owner of immutable progress updates, persistence normalization, clue deduplication, and atomic achievement completion. Render tiers and field notes as focused client components, with pure Vitest coverage and one Playwright persistence journey.

**Tech Stack:** React 19, TypeScript, Zustand 5 persist middleware, TanStack Start, Tailwind CSS, Vitest 4, Playwright 1.61.

---

## File Map

- Create `src/lib/domains/foobar/catalog.ts` — tier definitions, achievement story metadata, stable clue IDs, runtime guards, and clue resolution.
- Create `src/lib/domains/foobar/catalog.test.ts` — catalogue completeness and clue-ID regression coverage.
- Modify `src/lib/domains/foobar/flags.tsx` — attach pure catalogue metadata to route/icon entries and export precise navigable types.
- Modify `src/lib/domains/foobar/store.ts` — add field-note state, immutable updates, normalization, and atomic actions.
- Create `src/lib/domains/foobar/store.test.ts` — legacy migration, malformed input, deduplication, completion, and reset coverage.
- Modify `src/lib/domains/global/index.ts` — normalize persisted Foobar state at the Zustand merge boundary.
- Modify `src/lib/domains/foobar/DashboardClient.tsx` — use atomic completion and compose tiers plus field notes.
- Modify `src/lib/domains/foobar/Pixel.tsx` — use atomic completion for 404/navigator and record the endgame note.
- Modify `src/lib/components/Error.tsx` — use atomic completion for `dogs`.
- Create `src/lib/domains/foobar/FieldNotes.tsx` — render the resolved chronological clue timeline.
- Rewrite `src/lib/domains/foobar/badges.tsx` — tier sections, progress counts, locked silhouettes, and explicit persisted hint controls.
- Create `e2e/foobar.spec.ts` — old-state migration, hint persistence, desktop, and mobile journey.

## Task 1: Add the Pure Achievement Catalogue

**Files:**
- Create: `src/lib/domains/foobar/catalog.test.ts`
- Create: `src/lib/domains/foobar/catalog.ts`
- Modify: `src/lib/domains/foobar/flags.tsx`

- [ ] **Step 1: Write the failing catalogue contract tests**

Create `src/lib/domains/foobar/catalog.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import {
	FOOBAR_ACHIEVEMENTS,
	FOOBAR_TIER_ORDER,
	FOOBAR_TIERS,
	getFoobarClue,
	isFoobarClueId,
} from "./catalog";

describe("Foobar catalogue", () => {
	test("defines all five tiers in progression order", () => {
		expect(FOOBAR_TIER_ORDER).toEqual([
			"discovery",
			"browser",
			"archaeology",
			"protocol",
			"meta",
		]);
		expect(FOOBAR_TIER_ORDER.map((tier) => FOOBAR_TIERS[tier].difficulty)).toEqual([
			1, 2, 3, 4, 5,
		]);
	});

	test("gives every navigable achievement four ordered hints", () => {
		const hintable = Object.values(FOOBAR_ACHIEVEMENTS).filter(
			(achievement) => achievement.hints.length > 0,
		);
		expect(hintable).toHaveLength(14);
		for (const achievement of hintable) {
			expect(achievement.hints).toHaveLength(4);
			expect(achievement.hints.every((hint) => hint.text.trim().length > 0)).toBe(true);
		}
	});

	test("resolves only stable catalogue clue IDs", () => {
		expect(isFoobarClueId("headers:hint:2")).toBe(true);
		expect(getFoobarClue("headers:hint:2")).toMatchObject({
			achievement: "headers",
			kind: "hint",
		});
		expect(isFoobarClueId("headers:hint:5")).toBe(false);
		expect(isFoobarClueId("restart:completed")).toBe(false);
	});

	test("keeps restart outside tier progress", () => {
		expect(Object.keys(FOOBAR_ACHIEVEMENTS)).not.toContain("restart");
	});
});
```

- [ ] **Step 2: Run the catalogue test and verify it fails**

Run:

```bash
rtk pnpm exec vp test run --config .config/vitest.unit.config.ts src/lib/domains/foobar/catalog.test.ts
```

Expected: FAIL because `./catalog` does not exist.

- [ ] **Step 3: Implement the tier and achievement catalogue**

Create `src/lib/domains/foobar/catalog.ts`. Use this exact tier structure:

```ts
export const FOOBAR_TIERS = {
	discovery: {
		label: "Warmup / Discovery",
		difficulty: 1,
		description: "The site has started leaving fingerprints.",
	},
	browser: {
		label: "Browser Goblin",
		difficulty: 2,
		description: "Look behind the browser's polite surface.",
	},
	archaeology: {
		label: "Site Archaeology",
		difficulty: 3,
		description: "Wrong turns and old corners still tell stories.",
	},
	protocol: {
		label: "Protocol / Web Weirdness",
		difficulty: 4,
		description: "The web speaks below the page.",
	},
	meta: {
		label: "Meta / Endgame",
		difficulty: 5,
		description: "Read the map as a whole.",
	},
} as const;

export type FoobarTier = keyof typeof FOOBAR_TIERS;
export const FOOBAR_TIER_ORDER: ReadonlyArray<FoobarTier> = [
	"discovery",
	"browser",
	"archaeology",
	"protocol",
	"meta",
];
```

Define `FOOBAR_ACHIEVEMENTS` with these exact tier assignments, stable IDs, completion notes, and
four-level hint progressions. Each hint is `{ id, text }`; `completed` has `hints: []`.

```ts
export const FOOBAR_ACHIEVEMENTS = {
	unlocked: {
		tier: "discovery",
		difficulty: 1,
		completion: { id: "unlocked:completed", note: "You found the first door." },
		hints: [
			{ id: "unlocked:hint:1", text: "The map begins somewhere personal." },
			{ id: "unlocked:hint:2", text: "The console points toward a page about the site's author." },
			{ id: "unlocked:hint:3", text: "Look carefully around /about for a hidden Roman numeral." },
			{ id: "unlocked:hint:4", text: "Find and activate the hidden X on /about." },
		],
	},
	"source-code": {
		tier: "discovery",
		difficulty: 1,
		completion: { id: "source-code:completed", note: "You found a note beneath the paint." },
		hints: [
			{ id: "source-code:hint:1", text: "Rendered pages hide how they were assembled." },
			{ id: "source-code:hint:2", text: "Ask the browser for the original document, not the Elements panel." },
			{ id: "source-code:hint:3", text: "Use View Page Source and search for foobar." },
			{ id: "source-code:hint:4", text: "Follow the /foobar/source-code path embedded in the page source." },
		],
	},
	headers: {
		tier: "discovery",
		difficulty: 1,
		completion: { id: "headers:completed", note: "The server spoke before the page did." },
		hints: [
			{ id: "headers:hint:1", text: "The server may be saying more than the page does." },
			{ id: "headers:hint:2", text: "Inspect the response headers for a Foobar page." },
			{ id: "headers:hint:3", text: "Look for the x-foobar response header." },
			{ id: "headers:hint:4", text: "Follow the /foobar/headers value exposed by x-foobar." },
		],
	},
	localforage: {
		tier: "discovery",
		difficulty: 1,
		completion: { id: "localforage:completed", note: "The browser opened its small box of secrets." },
		hints: [
			{ id: "localforage:hint:1", text: "The browser remembers more than your progress." },
			{ id: "localforage:hint:2", text: "Inspect this site's local storage in developer tools." },
			{ id: "localforage:hint:3", text: "Look for a key named foobar." },
			{ id: "localforage:hint:4", text: "Open the /foobar/localforage path stored under foobar." },
		],
	},
	teapot: {
		tier: "discovery",
		difficulty: 1,
		completion: { id: "teapot:completed", note: "The server refused, but politely." },
		hints: [
			{ id: "teapot:hint:1", text: "Not every machine agrees to make coffee." },
			{ id: "teapot:hint:2", text: "There is a small API route with an unusual HTTP status." },
			{ id: "teapot:hint:3", text: "Ask /api/coffee to brew something." },
			{ id: "teapot:hint:4", text: "Visit /api/coffee, then follow its Foobar clue." },
		],
	},
	devtools: {
		tier: "browser",
		difficulty: 2,
		completion: { id: "devtools:completed", note: "You looked behind the stage curtain." },
		hints: [
			{ id: "devtools:hint:1", text: "Some props only exist behind the rendered page." },
			{ id: "devtools:hint:2", text: "Inspect the Foobar dashboard with browser developer tools." },
			{ id: "devtools:hint:3", text: "Look for a hidden component or DOM clue near the dashboard." },
			{ id: "devtools:hint:4", text: "Find the clue that points to /foobar/devtools." },
		],
	},
	hack: {
		tier: "browser",
		difficulty: 2,
		completion: { id: "hack:completed", note: "The console opened its trapdoor." },
		hints: [
			{ id: "hack:hint:1", text: "A familiar word has been attached to the browser." },
			{ id: "hack:hint:2", text: "Open the console and inspect functions exposed on window." },
			{ id: "hack:hint:3", text: "Call the function named hack." },
			{ id: "hack:hint:4", text: "Run window.hack() and follow /foobar/hack." },
		],
	},
	offline: {
		tier: "browser",
		difficulty: 2,
		completion: { id: "offline:completed", note: "The site remembered you after the network left." },
		hints: [
			{ id: "offline:hint:1", text: "What remains when the wire goes quiet?" },
			{ id: "offline:hint:2", text: "Developer tools can simulate losing the network." },
			{ id: "offline:hint:3", text: "Stay on a Foobar page and switch the browser network to Offline." },
			{ id: "offline:hint:4", text: "Trigger the browser's offline event while viewing /foobar." },
		],
	},
	navigator: {
		tier: "browser",
		difficulty: 2,
		completion: { id: "navigator:completed", note: "You drew enough of the map to be recognized." },
		hints: [
			{ id: "navigator:hint:1", text: "Explorers earn their name by moving." },
			{ id: "navigator:hint:2", text: "The site remembers distinct pages in this browser." },
			{ id: "navigator:hint:3", text: "Visit several different pages across the site." },
			{ id: "navigator:hint:4", text: "Visit at least five unique paths." },
		],
	},
	"easter-egg": {
		tier: "browser",
		difficulty: 2,
		completion: { id: "easter-egg:completed", note: "A decoration turned out to be a switch." },
		hints: [
			{ id: "easter-egg:hint:1", text: "One ordinary social detail is less ordinary than it looks." },
			{ id: "easter-egg:hint:2", text: "Explore the social links on the About page." },
			{ id: "easter-egg:hint:3", text: "Try the link whose icon suggests an egg-shaped surprise." },
			{ id: "easter-egg:hint:4", text: "Find the hidden social interaction that leads to /foobar/easter-egg." },
		],
	},
	konami: {
		tier: "browser",
		difficulty: 2,
		completion: { id: "konami:completed", note: "An old cheat code still worked here." },
		hints: [
			{ id: "konami:hint:1", text: "Old games taught players a famous sequence." },
			{ id: "konami:hint:2", text: "Use the keyboard sequence commonly called the Konami code." },
			{ id: "konami:hint:3", text: "Begin with up, up, down, down, left, right, left, right." },
			{ id: "konami:hint:4", text: "Enter ↑ ↑ ↓ ↓ ← → ← → B A while the site is focused." },
		],
	},
	error404: {
		tier: "archaeology",
		difficulty: 3,
		completion: { id: "error404:completed", note: "A wrong turn was still a turn." },
		hints: [
			{ id: "error404:hint:1", text: "Maps become interesting at their missing edges." },
			{ id: "error404:hint:2", text: "Ask the site for a page that does not exist." },
			{ id: "error404:hint:3", text: "Reach the site's custom 404 screen." },
			{ id: "error404:hint:4", text: "Visit any nonexistent path and inspect the 404 page." },
		],
	},
	dogs: {
		tier: "archaeology",
		difficulty: 3,
		completion: { id: "dogs:completed", note: "The guard dogs were friendlier than they looked." },
		hints: [
			{ id: "dogs:hint:1", text: "The wrong-turn page offers a surprisingly friendly detour." },
			{ id: "dogs:hint:2", text: "Read every link on the custom 404 page." },
			{ id: "dogs:hint:3", text: "One link leaves the site to visit award-winning dogs." },
			{ id: "dogs:hint:4", text: "Click the Dog Photographer of the Year link on a 404 page." },
		],
	},
	"dns-txt": {
		tier: "protocol",
		difficulty: 4,
		completion: { id: "dns-txt:completed", note: "You read the old phonebook beneath the site." },
		hints: [
			{ id: "dns-txt:hint:1", text: "The clue lives below HTTP." },
			{ id: "dns-txt:hint:2", text: "Ask DNS for text attached to the site's domain." },
			{ id: "dns-txt:hint:3", text: "Query TXT records for sreetamdas.com." },
			{ id: "dns-txt:hint:4", text: "Run dig TXT sreetamdas.com and follow the Foobar value." },
		],
	},
	completed: {
		tier: "meta",
		difficulty: 5,
		completion: { id: "completed:completed", note: "You learned the site's hidden language." },
		hints: [],
	},
} as const;
```

Derive `FoobarAchievement`, `FoobarClueId`, and `FoobarClue` from this object. Implement:

```ts
export function isFoobarAchievement(value: unknown): value is FoobarAchievement;
export function getFoobarClue(value: unknown): FoobarClue | undefined;
export function isFoobarClueId(value: unknown): value is FoobarClueId;
```

`getFoobarClue` must scan each achievement's completion and hints and return `{ id,
achievement, kind: "completion" | "hint", text }`. Do not cast persisted input.

- [ ] **Step 4: Attach metadata to route/icon flags**

In `flags.tsx`, import `FOOBAR_ACHIEVEMENTS`, spread the matching metadata into each entry except
`restart`, and keep every existing slug, icon, and description unchanged. Derive
`FoobarNavigableFlag` as before and add a compile-time test assertion in `catalog.test.ts` that every
navigable flag name exists in `FOOBAR_ACHIEVEMENTS`.

- [ ] **Step 5: Run the catalogue test and verify it passes**

Run the focused command from Step 2.

Expected: PASS, 4 tests.

- [ ] **Step 6: Commit the catalogue**

```bash
rtk git add src/lib/domains/foobar/catalog.ts src/lib/domains/foobar/catalog.test.ts src/lib/domains/foobar/flags.tsx
rtk git commit -m "feat(foobar): add tier and clue catalogue"
```

## Task 2: Make Progress Updates Immutable and Migration-safe

**Files:**
- Create: `src/lib/domains/foobar/store.test.ts`
- Modify: `src/lib/domains/foobar/store.ts`
- Modify: `src/lib/domains/global/index.ts`

- [ ] **Step 1: Write failing store behavior tests**

Create `store.test.ts` with Vitest-native tests for these exact cases:

```ts
import { describe, expect, test, vi } from "vitest";
import { create } from "zustand";

import { createFoobarSlice, initialFoobarData, normalizeFoobarData } from "./store";

describe("Foobar progress", () => {
	test("normalizes legacy progress and imports completion notes", () => {
		const result = normalizeFoobarData({
			visited_pages: ["/", "/about"],
			konami: false,
			unlocked: true,
			completed: ["unlocked", "headers", "not-real", "headers"],
			all_achievements: false,
		});
		expect(result.completed).toEqual(["unlocked", "headers"]);
		expect(result.clues_seen).toEqual([
			{ id: "unlocked:completed", seen_at: null },
			{ id: "headers:completed", seen_at: null },
		]);
	});

	test("removes malformed and duplicate clue entries", () => {
		const result = normalizeFoobarData({
			...initialFoobarData,
			clues_seen: [
				{ id: "headers:hint:1", seen_at: 10 },
				{ id: "headers:hint:1", seen_at: 20 },
				{ id: "headers:hint:5", seen_at: 30 },
				{ id: "headers:hint:2", seen_at: "yesterday" },
			],
		});
		expect(result.clues_seen).toEqual([{ id: "headers:hint:1", seen_at: 10 }]);
	});

	test("updates partial state immutably and replaces arrays", () => {
		const store = create(createFoobarSlice);
		const before = store.getState().foobar_data;
		store.getState().setFoobarData({ visited_pages: ["/new"] });
		expect(store.getState().foobar_data).not.toBe(before);
		expect(store.getState().foobar_data.visited_pages).toEqual(["/new"]);
	});

	test("records clues and completions once", () => {
		vi.spyOn(Date, "now").mockReturnValue(1234);
		const store = create(createFoobarSlice);
		store.getState().recordFoobarClue("headers:hint:1");
		store.getState().recordFoobarClue("headers:hint:1");
		store.getState().completeFoobarFlag("headers");
		store.getState().completeFoobarFlag("headers");
		expect(store.getState().foobar_data.completed).toEqual(["headers"]);
		expect(store.getState().foobar_data.clues_seen).toEqual([
			{ id: "headers:hint:1", seen_at: 1234 },
			{ id: "headers:completed", seen_at: 1234 },
		]);
	});

	test("reset data clears arrays instead of deep-merging them", () => {
		const store = create(createFoobarSlice);
		store.getState().completeFoobarFlag("headers");
		store.getState().setFoobarData(initialFoobarData);
		expect(store.getState().foobar_data).toEqual(initialFoobarData);
	});
});
```

- [ ] **Step 2: Run the store test and verify it fails**

Run:

```bash
rtk pnpm exec vp test run --config .config/vitest.unit.config.ts src/lib/domains/foobar/store.test.ts
```

Expected: FAIL because clue state, normalization, and actions do not exist; the immutable-reference
test also exposes the current mutating Lodash merge.

- [ ] **Step 3: Implement normalized state and atomic actions**

In `store.ts`:

- remove `lodash-es/merge`;
- change `completed` to `FoobarAchievement[]`;
- add `clues_seen: FoobarClueSeen[]` to `FoobarDataType` and `initialFoobarData`;
- implement `normalizeFoobarData(value: unknown)` using runtime narrowing only;
- deduplicate strings and clues while preserving first-seen order;
- backfill missing completion clues with `seen_at: null`;
- make `setFoobarData` return `{ foobar_data: { ...state.foobar_data, ...data } }`;
- add `recordFoobarClue(id)` and `completeFoobarFlag(flag)` actions;
- use `Date.now()` only when adding a new clue.

Use this persisted clue shape:

```ts
export type FoobarClueSeen = {
	id: FoobarClueId;
	seen_at: number | null;
};
```

Use a local runtime helper rather than assertions:

```ts
function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
	return typeof value === "object" && value !== null;
}
```

For `completeFoobarFlag`, one Zustand `set` callback must append the flag and its completion clue
from `FOOBAR_ACHIEVEMENTS[flag]` only when each is absent.

- [ ] **Step 4: Normalize at the persistence boundary**

In `src/lib/domains/global/index.ts`, remove Lodash merge and replace the `merge` option with runtime
narrowing that preserves live methods:

```ts
		merge: (persistedState, currentState) => {
			if (
				typeof persistedState !== "object" ||
				persistedState === null ||
				!("foobar_data" in persistedState)
			) {
				return currentState;
			}

			return {
				...currentState,
				foobar_data: normalizeFoobarData(persistedState.foobar_data),
			};
		},
```

- [ ] **Step 5: Run catalogue and store tests**

```bash
rtk pnpm exec vp test run --config .config/vitest.unit.config.ts src/lib/domains/foobar/catalog.test.ts src/lib/domains/foobar/store.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit progress state**

```bash
rtk git add src/lib/domains/foobar/store.ts src/lib/domains/foobar/store.test.ts src/lib/domains/global/index.ts
rtk git commit -m "feat(foobar): persist clue progress safely"
```

## Task 3: Route Every Completion Through the Store Invariant

**Files:**
- Modify: `src/lib/domains/foobar/DashboardClient.tsx`
- Modify: `src/lib/domains/foobar/Pixel.tsx`
- Modify: `src/lib/components/Error.tsx`

- [ ] **Step 1: Replace route completion writes**

In `FoobarSchrodinger`, select `completeFoobarFlag` instead of `setFoobarData`. Keep the existing
catalogue lookup, duplicate analytics guard, and effect dependencies, then replace concatenation with:

```ts
completeFoobarFlag(completed_flag);
```

- [ ] **Step 2: Replace dogs, 404, and navigator writes**

In `NotFoundDogsLink` and `FoobarPixel`, select `completeFoobarFlag` and call it for `dogs`,
`error404`, and `navigator`. Preserve each current Plausible event exactly; do not add unrelated
analytics in this task.

- [ ] **Step 3: Record the endgame completion note**

When `checkIfAllAchievementsAreDone(completed)` first transitions `all_achievements`, call
`recordFoobarClue(FOOBAR_ACHIEVEMENTS.completed.completion.id)` in the same effect as setting
`all_achievements: true`. Guard on `!all_achievements` to avoid repeated analytics and writes.

- [ ] **Step 4: Run focused tests and typecheck**

```bash
rtk pnpm exec vp test run --config .config/vitest.unit.config.ts src/lib/domains/foobar/catalog.test.ts src/lib/domains/foobar/store.test.ts
rtk pnpm typecheck
```

Expected: both tests PASS and typecheck exits 0.

- [ ] **Step 5: Commit completion wiring**

```bash
rtk git add src/lib/domains/foobar/DashboardClient.tsx src/lib/domains/foobar/Pixel.tsx src/lib/components/Error.tsx
rtk git commit -m "refactor(foobar): centralize achievement completion"
```

## Task 4: Render Tier Progress, Hint Ladders, and Field Notes

**Files:**
- Create: `src/lib/domains/foobar/FieldNotes.tsx`
- Modify: `src/lib/domains/foobar/badges.tsx`
- Modify: `src/lib/domains/foobar/DashboardClient.tsx`
- Create: `e2e/foobar.spec.ts`

- [ ] **Step 1: Write the failing Playwright journey**

Create `e2e/foobar.spec.ts`. Seed the production and development keys before navigation so either
environment works:

```ts
import { expect, test, type Page } from "@playwright/test";

const legacyProgress = {
	visited_pages: ["/", "/about"],
	konami: false,
	unlocked: true,
	completed: ["unlocked", "headers"],
	all_achievements: false,
};

async function seedLegacyProgress(page: Page) {
	await page.addInitScript((progress) => {
		const value = JSON.stringify({ state: { foobar_data: progress }, version: 0 });
		window.localStorage.setItem("foobar-zustand", value);
		window.localStorage.setItem("foobar-zustand-dev", value);
	}, legacyProgress);
}

test("groups achievements and persists revealed field notes", async ({ page }) => {
	await seedLegacyProgress(page);
	await page.goto("/foobar");

	await expect(page.getByRole("heading", { name: "Warmup / Discovery" })).toBeVisible();
	await expect(page.getByText("2 / 5 complete")).toBeVisible();
	await expect(page.getByRole("heading", { name: "Field notes" })).toBeVisible();
	await expect(page.getByText("Earlier", { exact: true })).toHaveCount(2);

	await page.getByRole("button", { name: "Reveal hint 1 of 4 for dns-txt" }).click();
	await expect(page.getByText("The clue lives below HTTP.")).toBeVisible();
	await page.reload();
	await expect(page.getByText("The clue lives below HTTP.")).toBeVisible();
	await expect(page.getByRole("button", { name: "Reveal hint 2 of 4 for dns-txt" })).toBeVisible();
});

test("tier dashboard fits a mobile viewport", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await seedLegacyProgress(page);
	await page.goto("/foobar");

	await expect(page.getByRole("heading", { name: "Warmup / Discovery" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Field notes" })).toBeVisible();
	const hasHorizontalOverflow = await page
		.locator("main")
		.evaluate((element) => element.scrollWidth > element.clientWidth);
	expect(hasHorizontalOverflow).toBe(false);
});
```

- [ ] **Step 2: Build and run the E2E test to verify it fails**

```bash
rtk pnpm build
rtk pnpm exec playwright test e2e/foobar.spec.ts --config .config/playwright.config.ts
```

Expected: FAIL because tier headings, field notes, and hint controls do not exist.

- [ ] **Step 3: Rewrite badges as tier sections**

In `badges.tsx`:

- derive each tier's achievements from `FOOBAR_TIER_ORDER` and `FOOBAR_ACHIEVEMENTS`;
- render semantic `<section>` elements with the tier label, difficulty, flavor description, and
  `<completed> / <total> complete`;
- treat `completed` as unlocked from `all_achievements`, all others from `completed.includes(name)`;
- preserve a two-column grid at `md` and one column on mobile;
- render locked badges as visible muted silhouettes rather than hiding names;
- replace local click counts with the persisted IDs in `clues_seen`;
- show all previously revealed hints in order;
- call `recordFoobarClue(nextHint.id)` from an explicit button;
- use the exact accessible name `Reveal hint N of 4 for <catalogue badge name>`;
- hide hint controls for completed achievements and show the existing description instead.

Use the existing visual language: `rounded-global`, `border-foreground/15`, `bg-foreground/5`,
`text-primary`, `font-mono` metadata, and dark-mode background variants. Do not add animation beyond
existing color transitions.

- [ ] **Step 4: Add the focused Field Notes component**

Create `FieldNotes.tsx` with props:

```ts
type FieldNotesProps = Pick<FoobarDataType, "clues_seen">;
```

Resolve each entry through `getFoobarClue`, discard no valid entries, and stable-sort `seen_at: null`
first followed by ascending timestamps. Render:

- a `<section aria-labelledby="foobar-field-notes">`;
- `<h2 id="foobar-field-notes">Field notes</h2>`;
- an empty-state sentence when no entries exist;
- an `<ol>` with one `<li>` per note;
- `Earlier` for null times;
- `<time dateTime={new Date(seen_at).toISOString()}>` using a short local date/time for timestamps;
- `Hint · <achievement>` or `Discovery · <achievement>` metadata;
- the resolved hint text or completion note.

- [ ] **Step 5: Compose field notes on the dashboard**

Pass `completed`, `all_achievements`, and `clues_seen` to `ShowCompletedBadges`, then render
`<FieldNotes clues_seen={foobar_data.clues_seen} />` directly below the tier map and above the stats
link. Keep reset behavior and development JSON output.

- [ ] **Step 6: Run E2E and focused unit tests**

```bash
rtk pnpm exec vp test run --config .config/vitest.unit.config.ts src/lib/domains/foobar/catalog.test.ts src/lib/domains/foobar/store.test.ts
rtk pnpm build
rtk pnpm exec playwright test e2e/foobar.spec.ts --config .config/playwright.config.ts
```

Expected: unit tests PASS; build exits 0; both Foobar E2E tests PASS.

- [ ] **Step 7: Commit the dashboard slice**

```bash
rtk git add src/lib/domains/foobar/FieldNotes.tsx src/lib/domains/foobar/badges.tsx src/lib/domains/foobar/DashboardClient.tsx e2e/foobar.spec.ts
rtk git commit -m "feat(foobar): add tiered field-notes dashboard"
```

## Task 5: Verify, Push, and Prove Staging

**Files:**
- Modify only if verification reveals a first-slice defect.

- [ ] **Step 1: Run formatter and lint autofix, then inspect changes**

```bash
rtk pnpm lint:fix
rtk git status --short
rtk git diff
```

Only retain formatting/lint changes related to the first slice. Never revert unrelated concurrent
worktree changes.

- [ ] **Step 2: Run the full local verification suite**

```bash
rtk pnpm test:unit
rtk pnpm typecheck
rtk pnpm build
rtk pnpm exec playwright test e2e/foobar.spec.ts --config .config/playwright.config.ts
rtk pnpm lint
```

Expected: every command exits 0. If a command fails, fix the root cause, rerun the narrow failing
command, then rerun this complete suite.

- [ ] **Step 3: Commit verification-only fixes**

Inspect `git status`, `git diff`, and recent log. If verification changed tracked files, stage only
those files and commit:

```bash
rtk git commit -m "fix(foobar): resolve first-slice verification issues"
```

Do not create an empty commit.

- [ ] **Step 4: Push the completed commits to dev**

```bash
rtk git push origin dev
```

Expected: push succeeds without force and reports the new `dev` tip.

- [ ] **Step 5: Poll Cloudflare staging**

Begin checking `https://staging.sreetamdas.com` immediately. Poll for up to five minutes until the
new tier heading appears on a seeded `/foobar` dashboard. Do not infer deployment success only from
GitHub push status.

- [ ] **Step 6: Verify the staging journey in a real browser**

Use `agent-browser` against `https://staging.sreetamdas.com`:

1. Seed `foobar-zustand` with the same legacy state used by E2E.
2. Open `/foobar` and confirm status 200.
3. Confirm all five tier headings, `2 / 5 complete`, and two `Earlier` notes.
4. Reveal DNS hint one, reload, and confirm the hint plus field note persist.
5. Set a 390×844 viewport and confirm the tier cards and timeline remain readable without horizontal
   overflow.
6. Also confirm a normal user-facing route such as `/about` returns 200 and renders its main heading.

- [ ] **Step 7: Record final evidence**

Capture the pushed commit IDs, exact verification commands, staging URLs, HTTP statuses, and browser
results in Engram session memory and the final handoff. Do not begin the deferred
`.agents/foobar-follow-up-backlog.md` items until every first-slice todo above is complete.
