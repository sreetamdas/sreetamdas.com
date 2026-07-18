# Foobar Hint Development Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate hint 4 for every hintable Foobar achievement behind an in-fiction 24-hour developing period derived from hint 3's existing timestamp.

**Architecture:** Add one pure time-policy module that returns the development state, humanized remaining duration, and analytics bucket without importing React or persistence. Update the existing badge component to retain full clue entries, render the timer-driven smudged note, and continue using the unchanged `recordFoobarClue` action when the mature hint is read.

**Tech Stack:** TypeScript, React 19, Zustand, Vitest, Playwright, Plausible, Tailwind CSS

---

## File Structure

- Create `src/lib/domains/foobar/hint-development.ts` — pure 24-hour policy, duration formatting,
  and analytics bucketing.
- Create `src/lib/domains/foobar/hint-development.test.ts` — deterministic boundary coverage for the
  pure policy.
- Modify `src/lib/domains/foobar/badges.tsx` — preserve clue timestamps, render the developing state,
  transition at maturity, and emit the two analytics events.
- Modify `e2e/foobar.spec.ts` — verify start, secret non-disclosure, mature read, persistence,
  analytics, and mobile overflow.

Do not modify `catalog.ts`, `store.ts`, `cloud-progress.ts`, the D1 schema, or migrations. The existing
stable clue IDs and earliest-real-timestamp merge are the data model for this feature.

### Task 1: Pure Hint Development Policy

**Files:**
- Create: `src/lib/domains/foobar/hint-development.test.ts`
- Create: `src/lib/domains/foobar/hint-development.ts`

- [ ] **Step 1: Write the failing policy tests**

Create `src/lib/domains/foobar/hint-development.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import {
	FOOBAR_HINT_DEVELOPMENT_MS,
	formatFoobarHintRemaining,
	getFoobarHintDevelopment,
	getFoobarHintElapsedBucket,
} from "./hint-development";

describe("Foobar hint development", () => {
	const startedAt = 10_000;
	const availableAt = startedAt + FOOBAR_HINT_DEVELOPMENT_MS;

	test("does not start without a hint 3 timestamp", () => {
		expect(getFoobarHintDevelopment(undefined, startedAt)).toEqual({ status: "not-started" });
	});

	test("treats historical hint 3 progress as ready", () => {
		expect(getFoobarHintDevelopment(null, startedAt)).toEqual({
			status: "ready",
			availableAt: null,
		});
	});

	test("returns the deadline and remaining time while developing", () => {
		expect(getFoobarHintDevelopment(startedAt, startedAt)).toEqual({
			status: "developing",
			availableAt,
			remainingMs: FOOBAR_HINT_DEVELOPMENT_MS,
		});
		expect(getFoobarHintDevelopment(startedAt, availableAt - 1)).toEqual({
			status: "developing",
			availableAt,
			remainingMs: 1,
		});
	});

	test("becomes ready at the exact deadline", () => {
		expect(getFoobarHintDevelopment(startedAt, availableAt)).toEqual({
			status: "ready",
			availableAt,
		});
		expect(getFoobarHintDevelopment(startedAt, availableAt + 1)).toEqual({
			status: "ready",
			availableAt,
		});
	});

	test("rounds the displayed duration up to a non-zero minute", () => {
		expect(formatFoobarHintRemaining(FOOBAR_HINT_DEVELOPMENT_MS)).toBe("24h 0m");
		expect(formatFoobarHintRemaining(61 * 60 * 1000)).toBe("1h 1m");
		expect(formatFoobarHintRemaining(1)).toBe("1m");
	});

	test("buckets mature reads without identifying the hunter", () => {
		expect(getFoobarHintElapsedBucket(null, availableAt)).toBe("legacy");
		expect(getFoobarHintElapsedBucket(startedAt, availableAt)).toBe("24-48h");
		expect(getFoobarHintElapsedBucket(startedAt, startedAt + 48 * 60 * 60 * 1000)).toBe(
			"2-7d",
		);
		expect(getFoobarHintElapsedBucket(startedAt, startedAt + 8 * 24 * 60 * 60 * 1000)).toBe(
			"8d+",
		);
	});
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
rtk pnpm exec vp test run --config .config/vitest.unit.config.ts src/lib/domains/foobar/hint-development.test.ts
```

Expected: FAIL because `./hint-development` does not exist.

- [ ] **Step 3: Implement the minimal pure policy**

Create `src/lib/domains/foobar/hint-development.ts`:

```ts
/**
 * Pure timing policy for the final Foobar hint. Persistence remains in the
 * existing clue log; callers provide the current time for deterministic tests.
 */
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const FOOBAR_HINT_DEVELOPMENT_MS = DAY_MS;

export type FoobarHintDevelopment =
	| { status: "not-started" }
	| { status: "developing"; availableAt: number; remainingMs: number }
	| { status: "ready"; availableAt: number | null };

export type FoobarHintElapsedBucket = "24-48h" | "2-7d" | "8d+" | "legacy";

export function getFoobarHintDevelopment(
	seenAt: number | null | undefined,
	now: number,
): FoobarHintDevelopment {
	if (seenAt === undefined) {
		return { status: "not-started" };
	}

	if (seenAt === null) {
		return { status: "ready", availableAt: null };
	}

	const availableAt = seenAt + FOOBAR_HINT_DEVELOPMENT_MS;
	if (now >= availableAt) {
		return { status: "ready", availableAt };
	}

	return {
		status: "developing",
		availableAt,
		remainingMs: availableAt - now,
	};
}

export function formatFoobarHintRemaining(remainingMs: number): string {
	const totalMinutes = Math.max(1, Math.ceil(remainingMs / MINUTE_MS));
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function getFoobarHintElapsedBucket(
	seenAt: number | null,
	now: number,
): FoobarHintElapsedBucket {
	if (seenAt === null) {
		return "legacy";
	}

	const elapsed = now - seenAt;
	if (elapsed < 2 * DAY_MS) {
		return "24-48h";
	}

	if (elapsed < 8 * DAY_MS) {
		return "2-7d";
	}

	return "8d+";
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
rtk pnpm exec vp test run --config .config/vitest.unit.config.ts src/lib/domains/foobar/hint-development.test.ts
```

Expected: PASS with 6 tests.

- [ ] **Step 5: Commit the pure policy**

```bash
rtk git add src/lib/domains/foobar/hint-development.ts src/lib/domains/foobar/hint-development.test.ts
rtk git commit -m "feat(foobar): add hint development policy"
```

### Task 2: Developing Badge, Analytics, And Browser Journey

**Files:**
- Modify: `e2e/foobar.spec.ts:3-80`
- Modify: `src/lib/domains/foobar/badges.tsx:7-177`

- [ ] **Step 1: Generalize progress seeding and capture Plausible events**

Replace the current `seedLegacyProgress` implementation in `e2e/foobar.spec.ts` with these helpers:

```ts
async function seedFoobarProgress(page: Page, progress: Record<string, unknown>) {
	await page.addInitScript((seededProgress) => {
		if (window.sessionStorage.getItem("foobar-e2e-seeded")) return;

		const value = JSON.stringify({ state: { foobar_data: seededProgress }, version: 0 });
		window.localStorage.setItem("foobar-zustand", value);
		window.localStorage.setItem("foobar-zustand-dev", value);
		window.sessionStorage.setItem("foobar-e2e-seeded", "true");
	}, progress);
}

async function seedLegacyProgress(page: Page) {
	await seedFoobarProgress(page, legacyProgress);
}

async function capturePlausibleEvents(page: Page) {
	await page.addInitScript(() => {
		window.plausible = (event, options) => {
			const events = JSON.parse(window.localStorage.getItem("foobar-e2e-events") ?? "[]");
			events.push({ event, options });
			window.localStorage.setItem("foobar-e2e-events", JSON.stringify(events));
		};
	});
}

async function readFoobarHintEvents(page: Page) {
	return page.evaluate(() => {
		const events = JSON.parse(window.localStorage.getItem("foobar-e2e-events") ?? "[]");
		return events.filter(({ event }: { event: string }) =>
			["foobar_hint_development_started", "foobar_developed_hint_read"].includes(event),
		);
	});
}
```

- [ ] **Step 2: Write the failing developing-state browser test**

Add below the existing field-notes test:

```ts
test("develops hint 4 without exposing its text", async ({ page }) => {
	const now = Date.now();
	await seedFoobarProgress(page, {
		...legacyProgress,
		clues_seen: [
			{ id: "dns-txt:hint:1", seen_at: now - 2_000 },
			{ id: "dns-txt:hint:2", seen_at: now - 1_000 },
		],
	});
	await capturePlausibleEvents(page);
	await page.goto("/foobar");

	const badge = page.locator("article").filter({
		has: page.getByRole("heading", { name: "dns-txt" }),
	});
	await badge.getByRole("button", { name: "Reveal hint 3 of 4 for dns-txt" }).click();

	await expect(badge.getByText("Hint 4 · Developing")).toBeVisible();
	await expect(badge.getByText(/The ink is still drying\. Return in \d+h \d+m\./)).toBeVisible();
	await expect(
		badge.getByText("Run dig TXT sreetamdas.com and follow the Foobar value."),
	).toHaveCount(0);
	await expect(badge.getByRole("button", { name: "Reveal hint 4 of 4 for dns-txt" })).toHaveCount(
		0,
	);
	await expect.poll(() => readFoobarHintEvents(page)).toEqual([
		{
			event: "foobar_hint_development_started",
			options: { props: { achievement: "dns-txt", wait_hours: 24 } },
		},
	]);
});
```

- [ ] **Step 3: Write the failing mature-read and persistence browser test**

Add immediately after the developing-state test:

```ts
test("reads and persists a developed hint", async ({ page }) => {
	const startedAt = Date.now() - 25 * 60 * 60 * 1000;
	await seedFoobarProgress(page, {
		...legacyProgress,
		clues_seen: [
			{ id: "dns-txt:hint:1", seen_at: startedAt - 2_000 },
			{ id: "dns-txt:hint:2", seen_at: startedAt - 1_000 },
			{ id: "dns-txt:hint:3", seen_at: startedAt },
		],
	});
	await capturePlausibleEvents(page);
	await page.goto("/foobar");

	const badge = page.locator("article").filter({
		has: page.getByRole("heading", { name: "dns-txt" }),
	});
	const fieldNotes = page.getByRole("region", { name: "Field notes" });
	const finalHint = "Run dig TXT sreetamdas.com and follow the Foobar value.";

	await badge.getByRole("button", { name: "Read developed hint 4 of 4 for dns-txt" }).click();
	await expect(badge.getByText(finalHint)).toBeVisible();
	await expect(fieldNotes.getByText(finalHint)).toBeVisible();
	await page.reload();
	await expect(badge.getByText(finalHint)).toBeVisible();
	await expect(fieldNotes.getByText(finalHint)).toBeVisible();
	await expect.poll(() => readFoobarHintEvents(page)).toEqual([
		{
			event: "foobar_developed_hint_read",
			options: { props: { achievement: "dns-txt", elapsed_bucket: "24-48h" } },
		},
	]);
});
```

- [ ] **Step 4: Seed a developing badge in the mobile overflow test**

In `tier dashboard fits a mobile viewport`, replace `await seedLegacyProgress(page);` with:

```ts
await seedFoobarProgress(page, {
	...legacyProgress,
	clues_seen: [
		{ id: "dns-txt:hint:1", seen_at: Date.now() - 3_000 },
		{ id: "dns-txt:hint:2", seen_at: Date.now() - 2_000 },
		{ id: "dns-txt:hint:3", seen_at: Date.now() - 1_000 },
	],
});
```

After the tier heading assertion, add:

```ts
await expect(page.getByText("Hint 4 · Developing")).toBeVisible();
```

- [ ] **Step 5: Run the new browser tests and verify they fail**

Start the app in a separate terminal so Playwright reuses the development server instead of requiring
a production build:

```bash
rtk pnpm exec vp dev --host 127.0.0.1 --port 5045
```

Then run:

```bash
rtk pnpm exec playwright test e2e/foobar.spec.ts --config .config/playwright.config.ts --grep "develops hint 4|reads and persists|mobile viewport"
```

Expected: the developing test fails because hint 4 is immediately revealable, and the mature-read
test fails because `Read developed hint` does not exist.

- [ ] **Step 6: Add the hint-development imports and preserve clue timestamps**

In `src/lib/domains/foobar/badges.tsx`, add React, analytics, and policy imports:

```ts
import { useEffect, useState } from "react";

import { useCustomPlausible } from "@/lib/domains/Plausible";

import {
	FOOBAR_HINT_DEVELOPMENT_MS,
	formatFoobarHintRemaining,
	getFoobarHintDevelopment,
	getFoobarHintElapsedBucket,
} from "./hint-development";
```

Change `TierSectionProps` and `BadgeProps` from `clueIds` to full clue entries:

```ts
type TierSectionProps = {
	tier: FoobarTier;
	achievements: Array<FoobarAchievement>;
	clues: FoobarDataType["clues_seen"];
	recordFoobarClue: (id: FoobarClueId) => void;
} & Pick<FoobarDataType, "completed" | "all_achievements">;

type BadgeProps = {
	achievement: FoobarAchievement;
	isUnlocked: boolean;
	clues: FoobarDataType["clues_seen"];
	recordFoobarClue: (id: FoobarClueId) => void;
};
```

At the two call sites, pass `clues={clues_seen}` from `ShowCompletedBadges` to `TierSection` and then
`clues={clues}` from `TierSection` to `Badge`. Rename the `TierSection` destructured prop from
`clueIds` to `clues`.

- [ ] **Step 7: Replace `Badge` with the gated reveal flow**

Replace the existing `Badge` function with:

```tsx
const Badge = ({ achievement, isUnlocked, clues, recordFoobarClue }: BadgeProps) => {
	const plausibleEvent = useCustomPlausible();
	const metadata = FOOBAR_ACHIEVEMENTS[achievement];
	const clueIds = clues.map(({ id }) => id);
	const revealedHints = metadata.hints.filter((hint) => clueIds.includes(hint.id));
	const nextHint = metadata.hints.find((hint) => !clueIds.includes(hint.id));
	const hintThree = metadata.hints[2];
	const finalHint = metadata.hints[3];
	const hintThreeSeenAt = hintThree
		? clues.find((clue) => clue.id === hintThree.id)?.seen_at
		: undefined;
	const isFinalHintNext = nextHint?.id === finalHint?.id;
	const nextHintNumber = revealedHints.length + 1;
	const { icon: Icon, description } = FOOBAR_FLAGS[achievement];

	function handleRevealHint() {
		if (!nextHint) return;

		recordFoobarClue(nextHint.id);
		if (nextHint.id === hintThree?.id) {
			plausibleEvent("foobar_hint_development_started", {
				props: { achievement, wait_hours: 24 },
			});
		}
	}

	function handleReadDevelopedHint() {
		if (!finalHint || hintThreeSeenAt === undefined) return;

		recordFoobarClue(finalHint.id);
		plausibleEvent("foobar_developed_hint_read", {
			props: {
				achievement,
				elapsed_bucket: getFoobarHintElapsedBucket(hintThreeSeenAt, Date.now()),
			},
		});
	}

	return (
		<article
			className={cn(
				"grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-4 rounded-global border border-foreground/15 bg-foreground/5 p-4 transition-colors dark:bg-foreground/10",
				isUnlocked ? "text-foreground" : "text-foreground/60",
			)}
		>
			<Icon
				aria-hidden="true"
				className={cn("mt-1 text-4xl", isUnlocked ? "text-primary" : "text-foreground/35")}
			/>
			<div className="min-w-0">
				<div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
					<h4 className="font-mono text-base font-semibold break-words text-current">
						{achievement}
					</h4>
					<span className="font-mono text-xs">{isUnlocked ? "Complete" : "Unsolved"}</span>
				</div>
				{isUnlocked ? (
					<p className="mt-2 text-sm text-foreground/80">{description}</p>
				) : (
					<>
						<p className="mt-2 text-sm text-foreground/70">{FOOBAR_TEASERS[achievement]}</p>
						{revealedHints.length > 0 && (
							<ol className="mt-3 grid gap-2 text-sm text-foreground/80">
								{revealedHints.map((hint, index) => (
									<li key={hint.id}>
										<span className="font-mono text-xs text-primary">Hint {index + 1}</span>
										<span className="block break-words">{hint.text}</span>
									</li>
								))}
							</ol>
						)}
						{nextHint && isFinalHintNext ? (
							<DevelopingHint
								achievement={achievement}
								seenAt={hintThreeSeenAt}
								onRead={handleReadDevelopedHint}
							/>
						) : nextHint ? (
							<button
								type="button"
								onClick={handleRevealHint}
								className="mt-3 rounded-global border border-primary px-3 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								aria-label={`Reveal hint ${nextHintNumber} of 4 for ${achievement}`}
							>
								Reveal hint {nextHintNumber} of 4
							</button>
						) : null}
					</>
				)}
			</div>
		</article>
	);
};
```

- [ ] **Step 8: Add the timer-driven smudged note**

Add below `Badge` in `badges.tsx`:

```tsx
type DevelopingHintProps = {
	achievement: FoobarAchievement;
	seenAt: number | null | undefined;
	onRead: () => void;
};

const DevelopingHint = ({ achievement, seenAt, onRead }: DevelopingHintProps) => {
	const [now, setNow] = useState(() => Date.now());
	const development = getFoobarHintDevelopment(seenAt, now);

	useEffect(() => {
		if (development.status !== "developing" || seenAt === null || seenAt === undefined) return;

		function refresh() {
			setNow(Date.now());
		}

		function refreshWhenVisible() {
			if (document.visibilityState === "visible") refresh();
		}

		const minuteTimer = window.setInterval(refresh, 60 * 1000);
		const deadlineTimer = window.setTimeout(
			refresh,
			Math.max(0, seenAt + FOOBAR_HINT_DEVELOPMENT_MS - Date.now()),
		);
		document.addEventListener("visibilitychange", refreshWhenVisible);

		return () => {
			window.clearInterval(minuteTimer);
			window.clearTimeout(deadlineTimer);
			document.removeEventListener("visibilitychange", refreshWhenVisible);
		};
	}, [development.status, seenAt]);

	if (development.status === "not-started") return null;

	if (development.status === "ready") {
		return (
			<button
				type="button"
				onClick={onRead}
				className="mt-3 rounded-global border border-primary px-3 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				aria-label={`Read developed hint 4 of 4 for ${achievement}`}
			>
				Read developed hint
			</button>
		);
	}

	return (
		<div className="mt-3 rounded-global border border-primary/35 bg-primary/5 p-3 text-foreground/75">
			<p className="font-mono text-xs text-primary">Hint 4 · Developing</p>
			<div aria-hidden="true" className="mt-3 grid gap-1.5 opacity-50 blur-[1px]">
				<span className="h-1.5 w-11/12 rounded-full bg-foreground/45" />
				<span className="h-1.5 w-4/5 rounded-full bg-foreground/35" />
				<span className="h-1.5 w-2/3 rounded-full bg-foreground/40" />
			</div>
			<p className="mt-3 text-sm">
				The ink is still drying. Return in {formatFoobarHintRemaining(development.remainingMs)}.
			</p>
		</div>
	);
};
```

- [ ] **Step 9: Run focused unit and browser tests and verify they pass**

Keep the development server from Step 5 running. Run:

```bash
rtk pnpm exec vp test run --config .config/vitest.unit.config.ts src/lib/domains/foobar/hint-development.test.ts
rtk pnpm exec playwright test e2e/foobar.spec.ts --config .config/playwright.config.ts --grep "develops hint 4|reads and persists|mobile viewport"
```

Expected: the unit file passes 6 tests and all 3 selected Playwright tests pass. Confirm the
developing test's secret-text assertion passes before accepting the visual treatment.

- [ ] **Step 10: Commit the complete player flow**

```bash
rtk git add src/lib/domains/foobar/badges.tsx e2e/foobar.spec.ts
rtk git commit -m "feat(foobar): develop final hints over 24 hours"
```

### Task 3: Focused Regression Verification

**Files:**
- Verify only; modify files only to fix a demonstrated failure.

- [ ] **Step 1: Run all Foobar unit tests**

Run:

```bash
rtk pnpm exec vp test run --config .config/vitest.unit.config.ts src/lib/domains/foobar
```

Expected: all Foobar unit tests pass.

- [ ] **Step 2: Run the complete Foobar browser file against the development server**

Keep `vp dev` running at `127.0.0.1:5045`, then run:

```bash
rtk pnpm exec playwright test e2e/foobar.spec.ts --config .config/playwright.config.ts
```

Expected: every Foobar Playwright test passes with no secret final hint present before maturity.

- [ ] **Step 3: Inspect repository hygiene**

Run:

```bash
rtk git status --short --branch
rtk git diff --check
rtk git log --oneline -5
```

Expected: only the pre-existing untracked `.superpowers/` path remains; the feature consists of the
design, plan, policy, badge, and test commits. Do not stage or alter `.superpowers/`.

- [ ] **Step 4: Defer repository-wide scripts unless explicitly approved**

Do not run `pnpm lint`, `pnpm typecheck`, or `pnpm build` under the repository instruction that these
scripts require explicit user direction. If approval is given, run them in this order and require all
three to exit successfully:

```bash
rtk pnpm lint
rtk pnpm typecheck
rtk pnpm build
```
