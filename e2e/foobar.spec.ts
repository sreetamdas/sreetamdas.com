import { expect, test, type Page } from "@playwright/test";

import { FOOBAR_PUZZLE_PREREQUISITES } from "../src/lib/domains/foobar/catalog";
import { getFoobarRewardPath } from "../src/lib/domains/foobar/codes";

const legacyProgress = {
	visited_pages: ["/", "/about"],
	konami: false,
	unlocked: true,
	completed: ["unlocked", "headers"],
	all_achievements: false,
};

const trackEventsKey = "foobar-e2e-analytics-events";

// TEST_PARALLEL_INDEX is the worker slot (0..workers-1), so it stays within
// the two-digit bound enforced by the server's room pattern. TEST_WORKER_INDEX
// increments on every worker restart and can escape that range.
const presenceWorkerRoom = `e2e-worker-${process.env.TEST_PARALLEL_INDEX ?? 0}`;

/**
 * Routes this page's presence socket into a per-worker room so parallel e2e
 * workers never count each other as hunters. The campfire unlock test still
 * works: both of its pages share the same worker, hence the same room. The
 * storage key mirrors `PRESENCE_ROOM_OVERRIDE_KEY` in the app source; it is
 * intentionally not imported so e2e stays a wire-level boundary.
 */
async function isolatePresencePerWorker(page: Page) {
	await page.addInitScript((room) => {
		window.sessionStorage.setItem("presence-room", room);
	}, presenceWorkerRoom);
}

async function seedProgress(page: Page, progress: Record<string, unknown> = legacyProgress) {
	await page.addInitScript((seededProgress) => {
		if (window.sessionStorage.getItem("foobar-e2e-seeded")) return;

		const value = JSON.stringify({ state: { foobar_data: seededProgress }, version: 0 });
		window.localStorage.setItem("foobar-zustand", value);
		window.localStorage.setItem("foobar-zustand-dev", value);
		window.sessionStorage.setItem("foobar-e2e-seeded", "true");
	}, progress);
}

async function authenticateFoobarE2e(page: Page) {
	await page.context().addCookies([
		{
			name: "foobar-e2e-auth",
			value: "enabled",
			url: "http://127.0.0.1:5045",
			httpOnly: true,
			sameSite: "Lax",
		},
	]);
}

async function ensureCloudEnabled(page: Page) {
	await openBasecamp(page);
	const enable = page.getByRole("button", { name: "Save this browser's progress to cloud" });
	if (await enable.isVisible()) await enable.click();
	await expect(page.getByRole("button", { name: "Delete cloud save" })).toBeVisible();
}

async function openBasecamp(page: Page) {
	const summary = page.locator("summary").filter({ hasText: /Open Basecamp/ });
	if ((await summary.locator("xpath=..").getAttribute("open")) === null) await summary.click();
}

async function openFieldEntry(page: Page, title: string) {
	const article = page.getByRole("article").filter({
		has: page.getByRole("heading", { name: title, exact: true }),
	});
	const trigger = article.getByRole("button", { name: `Open field entry for ${title}` });
	const closeTrigger = article.getByRole("button", { name: `Close field entry for ${title}` });
	if (!(await closeTrigger.isVisible())) {
		await trigger.click();
		await expect(closeTrigger).toBeVisible();
	}
	return article;
}

async function hasPersistedAchievement(page: Page, achievement: string, requireKonami = false) {
	return page.evaluate(
		({ achievement: targetAchievement, requireKonami: requireKonamiFlag }) => {
			for (const key of ["foobar-zustand-dev", "foobar-zustand"]) {
				const raw = window.localStorage.getItem(key);
				if (!raw) continue;

				let persisted: unknown;
				try {
					persisted = JSON.parse(raw);
				} catch {
					continue;
				}

				if (typeof persisted !== "object" || persisted === null || !("state" in persisted)) {
					continue;
				}
				const { state } = persisted;
				if (typeof state !== "object" || state === null || !("foobar_data" in state)) continue;

				const foobarData = state.foobar_data;
				if (
					typeof foobarData !== "object" ||
					foobarData === null ||
					!("completed" in foobarData) ||
					!Array.isArray(foobarData.completed)
				) {
					continue;
				}

				if (
					foobarData.completed.includes(targetAchievement) &&
					(!requireKonamiFlag || ("konami" in foobarData && foobarData.konami === true))
				) {
					return true;
				}
			}

			return false;
		},
		{ achievement, requireKonami },
	);
}

async function captureAnalyticsEvents(page: Page) {
	await page.addInitScript((storageKey) => {
		Object.defineProperty(window, "statsTracker", {
			configurable: false,
			writable: false,
			value: {
				loaded: true,
				event: (event: string, props?: unknown) => {
					const rawEvents = window.localStorage.getItem(storageKey);
					const parsedEvents: unknown = rawEvents ? JSON.parse(rawEvents) : [];
					const events = Array.isArray(parsedEvents) ? parsedEvents : [];
					events.push({ event, options: props === undefined ? undefined : { props } });
					window.localStorage.setItem(storageKey, JSON.stringify(events));
				},
			},
		});
	}, trackEventsKey);
}

async function readHintDevelopmentEvents(page: Page) {
	return page.evaluate((storageKey) => {
		const rawEvents = window.localStorage.getItem(storageKey);
		const parsedEvents: unknown = rawEvents ? JSON.parse(rawEvents) : [];
		if (!Array.isArray(parsedEvents)) return [];

		const events: Array<unknown> = parsedEvents;
		return events.filter(
			(entry) =>
				typeof entry === "object" &&
				entry !== null &&
				"event" in entry &&
				(entry.event === "foobar_hint_development_started" ||
					entry.event === "foobar_developed_hint_read"),
		);
	}, trackEventsKey);
}

test.beforeEach(async ({ page }) => {
	await isolatePresencePerWorker(page);
});

test("orients hunters and keeps one field entry open", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");

	await expect(page.getByRole("heading", { level: 1, name: "Foobar" })).toBeVisible();
	await expect(page.getByText("2 of 24 weird things found.", { exact: true })).toBeVisible();
	await page.getByRole("button", { name: "Continue hunting" }).click();
	await expect(
		page.getByRole("button", { name: "Close field entry for Behind the Screens" }),
	).toBeFocused();

	await openFieldEntry(page, "TXT Me Maybe");
	await expect(
		page.getByRole("button", { name: "Open field entry for Behind the Screens" }),
	).toBeVisible();
	const hintButton = page.getByRole("button", { name: "Reveal hint 1 of 4 for TXT Me Maybe" });
	const hintBox = await hintButton.boundingBox();
	expect(hintBox?.height).toBeGreaterThanOrEqual(44);

	// The single-open invariant spans completed entries too: opening a
	// completed entry from its own trigger collapses the open one.
	await openFieldEntry(page, "X Marks the Spot");
	await expect(
		page.getByRole("button", { name: "Open field entry for TXT Me Maybe" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Close field entry for X Marks the Spot" }),
	).toBeVisible();
	await expect(page.getByText("Nothing written down yet.")).toBeVisible();
});

test("groups achievements and persists revealed field notes", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");

	await expect(page.getByRole("heading", { name: "Warmup / Discovery" })).toBeVisible();
	await expect(page.getByText("1 of 6", { exact: true })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Field notes" })).toBeVisible();
	await expect(page.getByText("Earlier", { exact: true })).toHaveCount(2);
	await expect(page.getByText("Even crawlers are handed house rules.")).toBeVisible();
	const fieldNotes = page.getByRole("region", { name: "Field notes" });

	const dnsTxtBadge = await openFieldEntry(page, "TXT Me Maybe");
	const firstHintButton = dnsTxtBadge.getByRole("button", {
		name: "Reveal hint 1 of 4 for TXT Me Maybe",
	});
	await expect(firstHintButton).toHaveText("Reveal hint 1 of 4");
	await firstHintButton.click();
	await expect(fieldNotes.getByText("The clue lives below HTTP.")).toBeVisible();
	await page.reload();
	await expect(fieldNotes.getByText("The clue lives below HTTP.")).toBeVisible();
	await openFieldEntry(page, "TXT Me Maybe");
	await expect(
		page.getByRole("button", { name: "Reveal hint 2 of 4 for TXT Me Maybe" }),
	).toHaveText("Reveal hint 2 of 4");
});

test("clears a hint acknowledgment when another badge collapses it", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");

	const first = await openFieldEntry(page, "TXT Me Maybe");
	await first.getByRole("button", { name: "Reveal hint 1 of 4 for TXT Me Maybe" }).click();
	await expect(first.getByText("Hint 1 remembered.")).toBeVisible();

	await openFieldEntry(page, "Behind the Screens");
	const reopened = await openFieldEntry(page, "TXT Me Maybe");
	await expect(reopened.getByText("Hint 1 remembered.")).toHaveCount(0);
});

test("labels bonus achievements and laptop-only clues", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");

	await expect(page.getByText(/Best on a laptop\./)).toBeVisible();

	const campfire = page.getByRole("article").filter({
		has: page.getByRole("heading", { name: "Stranger by the Fire", exact: true }),
	});
	await expect(campfire.getByText("bonus", { exact: true })).toBeVisible();

	const consoleBadge = page.getByRole("article").filter({
		has: page.getByRole("heading", { name: "Console Yourself", exact: true }),
	});
	await expect(consoleBadge.getByText("laptop", { exact: true })).toBeVisible();
});

test("reveals tier words and holds the final address until every tier is done", async ({
	page,
}) => {
	await seedProgress(page, {
		...legacyProgress,
		completed: FOOBAR_PUZZLE_PREREQUISITES.filter((achievement) => achievement !== "og-qr"),
	});
	await page.goto("/foobar");

	await expect(page.locator('[data-foobar-tier-word="discovery"]')).toHaveText("Tier word: draco");
	await expect(page.locator('[data-foobar-tier-word="protocol"]')).toHaveText(
		"Tier word: titillandus",
	);
	await expect(page.locator('[data-foobar-tier-word="archaeology"]')).toHaveCount(0);

	await page.goto(getFoobarRewardPath("completed"));
	await expect(
		page.getByRole("status").filter({ hasText: "Finish every tier first." }),
	).toBeVisible();
	await expect(page.getByTestId("foobar-achievement-reveal")).toHaveCount(0);
	await expect(
		page.getByText(`${FOOBAR_PUZZLE_PREREQUISITES.length - 1} of 24 weird things found.`, {
			exact: true,
		}),
	).toBeVisible();
});

test("awards the final puzzle once every tier is done", async ({ page }) => {
	await seedProgress(page, { ...legacyProgress, completed: [...FOOBAR_PUZZLE_PREREQUISITES] });
	await page.goto(getFoobarRewardPath("completed"));

	await expect(page.getByTestId("foobar-achievement-reveal")).toContainText("Foo Bar None");
	await expect(page.getByText("You found everything. Somehow.")).toBeVisible();
	await expect(page.getByText("Finish every tier first.")).toHaveCount(0);
});

test("develops hint 4 without exposing its text", async ({ page }) => {
	await seedProgress(page, {
		...legacyProgress,
		clues_seen: [
			{ id: "dns-txt:hint:1", seen_at: Date.now() - 2_000 },
			{ id: "dns-txt:hint:2", seen_at: Date.now() - 1_000 },
		],
	});
	await captureAnalyticsEvents(page);
	await page.goto("/foobar");

	const dnsTxtBadge = await openFieldEntry(page, "TXT Me Maybe");
	const pausedAt = new Date();
	await page.clock.install({ time: pausedAt });
	// `install` starts the fake clock running from `time`, so it can already be
	// past `pausedAt` by the time we pause it — and `pauseAt` refuses to rewind.
	// Pause a moment ahead instead; a second is nothing against the 24h window.
	await page.clock.pauseAt(new Date(pausedAt.getTime() + 1_000));
	await dnsTxtBadge.getByRole("button", { name: "Reveal hint 3 of 4 for TXT Me Maybe" }).click();

	const liveStatus = dnsTxtBadge.locator('[aria-live="polite"]');
	await expect(liveStatus).toHaveCount(1);
	await expect(liveStatus).toHaveText("");
	await page.clock.runFor(1);
	await expect(dnsTxtBadge.getByText("Hint 4 · Developing", { exact: true })).toBeVisible();
	await expect(
		dnsTxtBadge.getByText(/The ink is still drying\. Return in \d+h \d+m\./),
	).toBeVisible();
	await expect(liveStatus).toHaveText("Hint 4 is developing. Return tomorrow.");
	await expect(
		dnsTxtBadge.getByText("Run dig TXT sreetamdas.com and follow the Foobar value.", {
			exact: true,
		}),
	).toHaveCount(0);
	await expect(
		dnsTxtBadge.getByRole("button", { name: "Reveal hint 4 of 4 for TXT Me Maybe" }),
	).toHaveCount(0);
	await expect
		.poll(() => readHintDevelopmentEvents(page))
		.toEqual([
			{
				event: "foobar_hint_development_started",
				options: { props: { achievement: "dns-txt", wait_hours: "24" } },
			},
		]);
});

test("keeps an out-of-order persisted final hint", async ({ page }) => {
	const hourMs = 60 * 60 * 1_000;
	const hintText = "Run dig TXT sreetamdas.com and follow the Foobar value.";
	await seedProgress(page, {
		...legacyProgress,
		clues_seen: [
			{ id: "dns-txt:hint:1", seen_at: Date.now() - 27 * hourMs },
			{ id: "dns-txt:hint:2", seen_at: Date.now() - 26 * hourMs },
			{ id: "dns-txt:hint:4", seen_at: Date.now() - 25 * hourMs },
		],
	});
	await captureAnalyticsEvents(page);
	await page.goto("/foobar");
	const irregularBadge = await openFieldEntry(page, "TXT Me Maybe");
	const persistedFinalHint = irregularBadge.getByRole("listitem").filter({ hasText: hintText });
	await expect(persistedFinalHint).toBeVisible();
	await irregularBadge.getByRole("button", { name: "Reveal hint 3 of 4 for TXT Me Maybe" }).click();
	expect(await readHintDevelopmentEvents(page)).toEqual([]);
	await expect(persistedFinalHint).toBeVisible();
	await expect(irregularBadge.getByText("Hint 4 · Developing", { exact: true })).toHaveCount(0);
});

test("reads and persists a developed hint", async ({ page }) => {
	const hourMs = 60 * 60 * 1_000;
	const hintText = "Run dig TXT sreetamdas.com and follow the Foobar value.";
	await seedProgress(page, {
		...legacyProgress,
		clues_seen: [
			{ id: "dns-txt:hint:1", seen_at: Date.now() - 27 * hourMs },
			{ id: "dns-txt:hint:2", seen_at: Date.now() - 26 * hourMs },
			{ id: "dns-txt:hint:3", seen_at: Date.now() - 25 * hourMs },
		],
	});
	await captureAnalyticsEvents(page);
	await page.goto("/foobar");

	const dnsTxtBadge = await openFieldEntry(page, "TXT Me Maybe");
	const fieldNotes = page.getByRole("region", { name: "Field notes" });
	const readButton = dnsTxtBadge.getByRole("button", {
		name: "Read developed hint 4 of 4 for TXT Me Maybe",
	});
	await expect(dnsTxtBadge.getByText("Hint 4 has developed.", { exact: true })).toHaveAttribute(
		"aria-live",
		"polite",
	);
	await expect(readButton).toHaveText("Read developed hint");
	await readButton.click();

	await expect(dnsTxtBadge.getByText(hintText, { exact: true })).toBeVisible();
	await expect(fieldNotes.getByText(hintText, { exact: true })).toBeVisible();
	await page.reload();
	await openFieldEntry(page, "TXT Me Maybe");
	await expect(dnsTxtBadge.getByText(hintText, { exact: true })).toBeVisible();
	await expect(fieldNotes.getByText(hintText, { exact: true })).toBeVisible();
	await expect
		.poll(() => readHintDevelopmentEvents(page))
		.toEqual([
			{
				event: "foobar_developed_hint_read",
				options: { props: { achievement: "dns-txt", elapsed_bucket: "24-48h" } },
			},
		]);
});

test("keeps local progress as the default and offers optional cloud save", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");
	await openBasecamp(page);

	await expect(page.getByRole("heading", { name: "Cloud save" })).toBeVisible();
	await expect(
		page.getByText(
			/Your progress stays in this browser\. (Sign in to save progress across devices\.|Cloud save isn't available right now\.)/,
		),
	).toBeVisible();

	// Only providers configured on this server are offered, so the set depends on its secrets.
	const signInLinks = await page.getByRole("link", { name: /^Sign in with / }).all();
	if (signInLinks.length === 0) {
		await expect(page.getByText("Cloud save isn't available right now.")).toBeVisible();
	}
	for (const link of signInLinks) {
		await expect(link).toHaveAttribute("href", /^\/api\/login\/github\?returnTo=\/foobar$/);
	}
});

test("deletes cloud progress durably and synchronizes the lifecycle across tabs", async ({
	page,
}) => {
	await authenticateFoobarE2e(page);
	await seedProgress(page);
	await page.goto("/foobar");
	await openBasecamp(page);
	await expect(page.getByText("Signed in as Foobar E2E Hunter.")).toBeVisible();
	await ensureCloudEnabled(page);

	const second = await page.context().newPage();
	await seedProgress(second);
	await second.goto("/foobar");
	await ensureCloudEnabled(second);

	const trigger = page.getByRole("button", { name: "Delete cloud save", exact: true });
	await trigger.click();
	const cancel = page.getByRole("button", { name: "Keep cloud save" });
	await expect(cancel).toBeFocused();
	await cancel.click();
	await expect(trigger).toBeFocused();

	await trigger.click();
	await page.getByRole("button", { name: "Yes, delete cloud save" }).click();
	const enable = second.getByRole("button", { name: "Save this browser's progress to cloud" });
	await expect(enable).toBeVisible();

	await Promise.all([page.reload(), second.reload()]);
	await Promise.all([openBasecamp(page), openBasecamp(second)]);
	await expect(
		page.getByRole("button", { name: "Save this browser's progress to cloud" }),
	).toBeVisible();
	await expect(enable).toBeVisible();

	await enable.click();
	await expect(page.getByRole("button", { name: "Delete cloud save" })).toBeVisible();
	await second.close();
});

test("offers an operation-specific retry when cloud deletion fails", async ({ page }) => {
	await authenticateFoobarE2e(page);
	await seedProgress(page);
	await page.goto("/foobar");
	await openBasecamp(page);
	await ensureCloudEnabled(page);

	await page.route("**/_serverFn/**", (route) => route.abort("failed"));
	await page.getByRole("button", { name: "Delete cloud save" }).click();
	await page.getByRole("button", { name: "Yes, delete cloud save" }).click();
	await expect(page.getByRole("alert")).toContainText("Could not delete your cloud save.");
	const retry = page.getByRole("button", { name: "Retry" });
	await expect(retry).toBeVisible();

	await page.unroute("**/_serverFn/**");
	await retry.click();
	await expect(
		page.getByText("Cloud saving is off. Progress stays in this browser."),
	).toBeVisible();
});

test("keeps unknown certificate pages and cards private", async ({ request }) => {
	const pageResponse = await request.get("/foobar/certificate/missing");
	const imageResponse = await request.get("/api/foobar/certificate/missing/og.png");

	expect(pageResponse.status()).toBe(404);
	expect(imageResponse.status()).toBe(404);
});

test("tier dashboard fits a mobile viewport", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await seedProgress(page, {
		...legacyProgress,
		clues_seen: [
			{ id: "dns-txt:hint:1", seen_at: Date.now() - 2_000 },
			{ id: "dns-txt:hint:2", seen_at: Date.now() - 1_000 },
			{ id: "dns-txt:hint:3", seen_at: Date.now() },
		],
	});
	await page.goto("/foobar");

	await expect(page.getByRole("heading", { name: "Warmup / Discovery" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Field notes" })).toBeVisible();
	await openFieldEntry(page, "TXT Me Maybe");
	await expect(page.getByText("Hint 4 · Developing", { exact: true })).toBeVisible();
	const hasHorizontalOverflow = await page
		.locator("main")
		.evaluate((element) => element.scrollWidth > element.clientWidth);
	expect(hasHorizontalOverflow).toBe(false);
});

test("completes browser-only achievements and plants the devtools clue", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");

	await expect(page.locator(`[data-foobar="${getFoobarRewardPath("devtools")}"]`)).toHaveCount(1);

	for (const key of [
		"ArrowUp",
		"ArrowUp",
		"ArrowDown",
		"ArrowDown",
		"ArrowLeft",
		"ArrowRight",
		"ArrowLeft",
		"ArrowRight",
		"b",
		"a",
	]) {
		await page.keyboard.press(key);
	}

	await expect.poll(() => hasPersistedAchievement(page, "konami", true)).toBe(true);

	await page.goto("/about");
	await page.evaluate(() => {
		document.addEventListener(
			"click",
			(event) => {
				if (event.target instanceof Element && event.target.closest('a[href*="giphy.com"]')) {
					event.preventDefault();
				}
			},
			{ capture: true },
		);
	});
	const redditLink = page.getByRole("link", { name: "Sreetam Das' Reddit" });

	await expect
		.poll(async () => {
			await redditLink.click();
			return hasPersistedAchievement(page, "easter-egg");
		})
		.toBe(true);
});

test("publishes machine-facing and print-only clues", async ({ page, request }) => {
	for (const [path, clue] of [
		["/robots.txt", getFoobarRewardPath("paper-trail")],
		["/.well-known/security.txt", getFoobarRewardPath("paper-trail")],
		["/.well-known/foobar", getFoobarRewardPath("well-known")],
		["/rss/feed.xml", getFoobarRewardPath("feed-reader")],
	]) {
		const response = await request.get(path);
		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toMatch(/^(text\/plain|application\/xml)/);
		expect(await response.text()).toContain(clue);
	}

	await seedProgress(page);
	await page.goto("/foobar");
	const printClue = page.getByText(
		`The paper remembers a path the screen will not: ${getFoobarRewardPath("print-preview")}`,
	);
	await expect(printClue).toBeHidden();
	await page.emulateMedia({ media: "print" });
	await expect(printClue).toBeVisible();
});

test("uses the Foobar social card only on the Foobar page", async ({ page }) => {
	await page.goto("/foobar");
	await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
		"content",
		/\/og-foobar\.png$/,
	);
	await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);
	await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
		"content",
		/\/og-foobar\.png$/,
	);

	await page.goto("/about");
	await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
		"content",
		/\/og-image\.png$/,
	);
	await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);
});

test("claims the well-known notice and announces it with its display title", async ({ page }) => {
	await seedProgress(page);
	await page.goto(getFoobarRewardPath("well-known"));

	const reveal = page.getByTestId("foobar-achievement-reveal");
	await expect(reveal).toContainText("You found the notice everyone forgot to read.");
	await expect(reveal).toContainText("A Well-Known Nobody");
	await expect(reveal).not.toContainText("keeping score");
	const title = reveal.locator(".animate-reveal-title");
	await expect(title).toHaveCount(1);
	await expect(title).toHaveCSS("animation-name", "reveal-title");
	await expect.poll(() => hasPersistedAchievement(page, "well-known")).toBe(true);
});

test("awards the offline achievement in place when the network drops", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");
	await expect(page.getByRole("heading", { name: "/foobar", level: 1 })).toBeVisible();

	await page.context().setOffline(true);

	await expect(page.getByTestId("foobar-achievement-reveal")).toContainText(
		"Connection Lost, Clue Found",
	);
	await expect(page.getByTestId("foobar-achievement-reveal")).toHaveCSS("text-align", "left");
	await expect(page).toHaveURL(/\/foobar$/);
	await expect.poll(() => hasPersistedAchievement(page, "offline")).toBe(true);
	await page.context().setOffline(false);
});

test("whispers the tab-visibility clue only while Foobar is hidden", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");
	const originalTitle = await page.title();
	await expect(page.getByRole("heading", { name: "/foobar", level: 1 })).toBeVisible();

	await page.evaluate(() => {
		Object.defineProperty(document, "hidden", { configurable: true, value: true });
		document.dispatchEvent(new Event("visibilitychange"));
	});
	await expect(page).toHaveTitle(getFoobarRewardPath("tab-visibility"));

	await page.evaluate(() => {
		Object.defineProperty(document, "hidden", { configurable: true, value: false });
		document.dispatchEvent(new Event("visibilitychange"));
	});
	await expect(page).toHaveTitle(originalTitle);
	await page.goto(getFoobarRewardPath("tab-visibility"));
	await expect(page.getByTestId("foobar-achievement-reveal")).toContainText("Now You See Me");
	await expect.poll(() => hasPersistedAchievement(page, "tab-visibility")).toBe(true);
});

test("plants the tab-visibility clue when Foobar mounts in a hidden tab", async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(document, "hidden", { configurable: true, value: true });
	});
	await seedProgress(page);
	await page.goto("/foobar");

	await expect(page.getByRole("heading", { name: "/foobar", level: 1 })).toBeVisible();
	await expect(page).toHaveTitle(getFoobarRewardPath("tab-visibility"));
});

test("reveals the service-worker clue without touching normal traffic", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");
	await page.evaluate(() => navigator.serviceWorker.ready);
	await page.reload();
	await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

	const clue = await page.evaluate(async () => {
		const response = await fetch("/foobar/service-worker-clue");
		return response.json();
	});
	expect(clue).toEqual({
		message: "The worker heard you without asking the network.",
		foobar: getFoobarRewardPath("service-worker"),
	});

	const aboutResponse = await page.request.get("/about");
	expect(aboutResponse.status()).toBe(200);
});

test("unlocks campfire for two simultaneous hunters", async ({ browser }) => {
	const firstContext = await browser.newContext();
	const secondContext = await browser.newContext();
	const first = await firstContext.newPage();
	const second = await secondContext.newPage();
	await isolatePresencePerWorker(first);
	await isolatePresencePerWorker(second);
	await seedProgress(first);
	await seedProgress(second);

	await Promise.all([first.goto("/foobar"), second.goto("/foobar")]);
	await openBasecamp(first);
	await expect(first.getByRole("heading", { name: "Campfire", exact: true })).toBeVisible();

	for (const hunter of [first, second]) {
		await expect.poll(() => hasPersistedAchievement(hunter, "campfire")).toBe(true);
	}

	await firstContext.close();
	await secondContext.close();
});

/** One trail per persisted key: seedProgress writes both the dev and production keys. */
async function readVisitedTrails(page: Page) {
	return page.evaluate(() => {
		const trails: Array<Array<unknown>> = [];
		for (const key of ["foobar-zustand-dev", "foobar-zustand"]) {
			const raw = window.localStorage.getItem(key);
			if (!raw) continue;
			const persisted: unknown = JSON.parse(raw);
			if (
				typeof persisted === "object" &&
				persisted !== null &&
				"state" in persisted &&
				typeof persisted.state === "object" &&
				persisted.state !== null &&
				"foobar_data" in persisted.state &&
				typeof persisted.state.foobar_data === "object" &&
				persisted.state.foobar_data !== null &&
				"visited_pages" in persisted.state.foobar_data &&
				Array.isArray(persisted.state.foobar_data.visited_pages)
			) {
				trails.push(persisted.state.foobar_data.visited_pages);
			}
		}
		return trails;
	});
}

test("offers the resume link everywhere except on Foobar itself", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/blog");
	await expect(page.getByRole("link", { name: "resume /foobar" })).toBeVisible();

	await page.goto("/foobar");
	await expect(page.getByRole("heading", { name: "/foobar", level: 1 })).toBeVisible();
	await expect(page.getByRole("link", { name: "resume /foobar" })).toHaveCount(0);
});

test("keeps the visited trail across full page loads", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/blog");

	await expect.poll(() => readVisitedTrails(page)).toContainEqual(["/", "/about", "/blog"]);
});

test("does not award slug achievements while Foobar is locked", async ({ page }) => {
	const headersPath = getFoobarRewardPath("headers");
	await page.goto(headersPath);

	await expect(page.getByRole("heading", { name: "404!" })).toBeVisible();
	await expect.poll(async () => (await readVisitedTrails(page)).flat()).toContain(headersPath);
	expect(await hasPersistedAchievement(page, "headers")).toBe(false);
	await expect(page.getByTestId("foobar-achievement-reveal")).toHaveCount(0);
});

test("does not award achievements from old reward slugs", async ({ page }) => {
	await page.goto("/foobar/headers");

	await expect(page.getByRole("heading", { name: "404!" })).toBeVisible();
	expect(await hasPersistedAchievement(page, "headers")).toBe(false);
});

test("does not award the scenic route from the locked Foobar gate", async ({ page }) => {
	await page.goto("/foobar");

	await expect(page.getByRole("heading", { name: "404!" })).toBeVisible();
	expect(await hasPersistedAchievement(page, "error404")).toBe(false);
});

test("claims the scenic route from a real 404 page", async ({ page }) => {
	await page.goto("/this-path-does-not-exist");

	await expect(page).toHaveTitle("Page not found | Sreetam Das");
	const banner = page.getByRole("banner");
	await expect(banner).toBeVisible();
	await expect(banner.getByRole("link", { name: "about" }).first()).toBeVisible();
	await expect(page.getByRole("heading", { name: "404!" })).toBeVisible();
	await expect.poll(() => hasPersistedAchievement(page, "error404")).toBe(true);
	await expect(page.getByTestId("foobar-achievement-reveal")).toContainText(
		"Something on this site is keeping score.",
	);
});

for (const path of ["/blog/nope", "/newsletter/nope", "/foobar/certificate/missing"]) {
	test(`claims the scenic route from ${path}`, async ({ page }) => {
		await page.goto(path);

		await expect(page).toHaveTitle("Page not found | Sreetam Das");
		await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
		await expect(page.getByRole("heading", { name: "404!" })).toBeVisible();
		await expect.poll(() => hasPersistedAchievement(page, "error404")).toBe(true);
	});
}

test("keeps the reset controls readable in dark mode", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await seedProgress(page);
	await page.goto("/foobar");
	await openBasecamp(page);
	await page
		.locator("summary")
		.filter({ hasText: /Manage progress/ })
		.click();

	const trigger = page.getByRole("button", { name: "Reset this browser's progress" });
	await expect(trigger).toHaveCSS("color", "oklch(0.808 0.114 19.571)");
	await trigger.click();
	await expect(page.getByRole("button", { name: "Yes, reset progress" })).toHaveCSS(
		"color",
		"oklch(0.808 0.114 19.571)",
	);
});

test("dims the sticky header behind the reset dialog", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");
	await openBasecamp(page);
	await page
		.locator("summary")
		.filter({ hasText: /Manage progress/ })
		.click();
	await page.getByRole("button", { name: "Reset this browser's progress" }).click();
	await expect(page.getByRole("alertdialog")).toBeVisible();

	const headerCovered = await page.evaluate(() => {
		const header = document.querySelector("header");
		if (!header) return false;
		const rect = header.getBoundingClientRect();
		const topmost = document.elementFromPoint(
			rect.left + rect.width / 2,
			rect.top + rect.height / 2,
		);
		return topmost !== null && !header.contains(topmost);
	});
	expect(headerCovered).toBe(true);
});
