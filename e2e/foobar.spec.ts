import { expect, test, type Page } from "@playwright/test";

const legacyProgress = {
	visited_pages: ["/", "/about"],
	konami: false,
	unlocked: true,
	completed: ["unlocked", "headers"],
	all_achievements: false,
};

const plausibleEventsKey = "foobar-e2e-plausible-events";

async function seedProgress(page: Page, progress: Record<string, unknown> = legacyProgress) {
	await page.addInitScript((progress) => {
		if (window.sessionStorage.getItem("foobar-e2e-seeded")) return;

		const value = JSON.stringify({ state: { foobar_data: progress }, version: 0 });
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
	const enable = page.getByRole("button", { name: "Save this browser's progress to cloud" });
	if (await enable.isVisible()) await enable.click();
	await expect(page.getByRole("button", { name: "Delete cloud save" })).toBeVisible();
}

async function hasPersistedAchievement(page: Page, achievement: string, requireKonami = false) {
	return page.evaluate(
		({ achievement, requireKonami }) => {
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
					foobarData.completed.includes(achievement) &&
					(!requireKonami || ("konami" in foobarData && foobarData.konami === true))
				) {
					return true;
				}
			}

			return false;
		},
		{ achievement, requireKonami },
	);
}

async function capturePlausibleEvents(page: Page) {
	await page.addInitScript((storageKey) => {
		Object.defineProperty(window, "plausible", {
			configurable: false,
			writable: false,
			value: (event: string, options?: unknown) => {
				const rawEvents = window.localStorage.getItem(storageKey);
				const parsedEvents: unknown = rawEvents ? JSON.parse(rawEvents) : [];
				const events = Array.isArray(parsedEvents) ? parsedEvents : [];
				events.push({ event, options });
				window.localStorage.setItem(storageKey, JSON.stringify(events));
			},
		});
	}, plausibleEventsKey);
}

async function readHintDevelopmentEvents(page: Page) {
	return page.evaluate((storageKey) => {
		const rawEvents = window.localStorage.getItem(storageKey);
		const parsedEvents: unknown = rawEvents ? JSON.parse(rawEvents) : [];
		if (!Array.isArray(parsedEvents)) return [];

		return parsedEvents.filter(
			(entry) =>
				typeof entry === "object" &&
				entry !== null &&
				"event" in entry &&
				(entry.event === "foobar_hint_development_started" ||
					entry.event === "foobar_developed_hint_read"),
		);
	}, plausibleEventsKey);
}

test("groups achievements and persists revealed field notes", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");

	await expect(page.getByRole("heading", { name: "Warmup / Discovery" })).toBeVisible();
	await expect(page.getByText("2 / 5 complete")).toBeVisible();
	await expect(page.getByRole("heading", { name: "Field notes" })).toBeVisible();
	await expect(page.getByText("Earlier", { exact: true })).toHaveCount(2);
	await expect(page.getByText("Even crawlers are handed house rules.")).toBeVisible();
	const fieldNotes = page.getByRole("region", { name: "Field notes" });

	const firstHintButton = page.getByRole("button", { name: "Reveal hint 1 of 4 for dns-txt" });
	await expect(firstHintButton).toHaveText("Reveal hint 1 of 4");
	await firstHintButton.click();
	await expect(fieldNotes.getByText("The clue lives below HTTP.")).toBeVisible();
	await page.reload();
	await expect(fieldNotes.getByText("The clue lives below HTTP.")).toBeVisible();
	await expect(page.getByRole("button", { name: "Reveal hint 2 of 4 for dns-txt" })).toHaveText(
		"Reveal hint 2 of 4",
	);
});

test("develops hint 4 without exposing its text", async ({ page }) => {
	await seedProgress(page, {
		...legacyProgress,
		clues_seen: [
			{ id: "dns-txt:hint:1", seen_at: Date.now() - 2_000 },
			{ id: "dns-txt:hint:2", seen_at: Date.now() - 1_000 },
		],
	});
	await capturePlausibleEvents(page);
	await page.goto("/foobar");

	const dnsTxtBadge = page.getByRole("article").filter({
		has: page.getByRole("heading", { name: "dns-txt", exact: true }),
	});
	const pausedAt = new Date();
	await page.clock.install({ time: pausedAt });
	// `install` starts the fake clock running from `time`, so it can already be
	// past `pausedAt` by the time we pause it — and `pauseAt` refuses to rewind.
	// Pause a moment ahead instead; a second is nothing against the 24h window.
	await page.clock.pauseAt(new Date(pausedAt.getTime() + 1_000));
	await dnsTxtBadge.getByRole("button", { name: "Reveal hint 3 of 4 for dns-txt" }).click();

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
		dnsTxtBadge.getByRole("button", { name: "Reveal hint 4 of 4 for dns-txt" }),
	).toHaveCount(0);
	await expect
		.poll(() => readHintDevelopmentEvents(page))
		.toEqual([
			{
				event: "foobar_hint_development_started",
				options: { props: { achievement: "dns-txt", wait_hours: 24 } },
			},
		]);
});

test("reads and persists a developed hint", async ({ page }) => {
	const hourMs = 60 * 60 * 1_000;
	const hintText = "Run dig TXT sreetamdas.com and follow the Foobar value.";
	const irregularPage = await page.context().newPage();
	await seedProgress(irregularPage, {
		...legacyProgress,
		clues_seen: [
			{ id: "dns-txt:hint:1", seen_at: Date.now() - 27 * hourMs },
			{ id: "dns-txt:hint:2", seen_at: Date.now() - 26 * hourMs },
			{ id: "dns-txt:hint:4", seen_at: Date.now() - 25 * hourMs },
		],
	});
	await capturePlausibleEvents(irregularPage);
	await irregularPage.goto("/foobar");
	const irregularBadge = irregularPage.getByRole("article").filter({
		has: irregularPage.getByRole("heading", { name: "dns-txt", exact: true }),
	});
	const persistedFinalHint = irregularBadge.getByRole("listitem").filter({ hasText: hintText });
	await expect(persistedFinalHint.getByText("Hint 4", { exact: true })).toBeVisible();
	await irregularBadge.getByRole("button", { name: "Reveal hint 3 of 4 for dns-txt" }).click();
	expect(await readHintDevelopmentEvents(irregularPage)).toEqual([]);
	await expect(persistedFinalHint.getByText("Hint 4", { exact: true })).toBeVisible();
	await expect(irregularBadge.getByText("Hint 4 · Developing", { exact: true })).toHaveCount(0);
	await irregularPage.close();

	await seedProgress(page, {
		...legacyProgress,
		clues_seen: [
			{ id: "dns-txt:hint:1", seen_at: Date.now() - 27 * hourMs },
			{ id: "dns-txt:hint:2", seen_at: Date.now() - 26 * hourMs },
			{ id: "dns-txt:hint:3", seen_at: Date.now() - 25 * hourMs },
		],
	});
	await capturePlausibleEvents(page);
	await page.goto("/foobar");

	const dnsTxtBadge = page.getByRole("article").filter({
		has: page.getByRole("heading", { name: "dns-txt", exact: true }),
	});
	const fieldNotes = page.getByRole("region", { name: "Field notes" });
	const readButton = dnsTxtBadge.getByRole("button", {
		name: "Read developed hint 4 of 4 for dns-txt",
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

	await expect(page.getByRole("heading", { name: "Hunter registry" })).toBeVisible();
	await expect(page.getByText("Sign in to save progress across devices.")).toBeVisible();
	await expect(page.getByRole("link", { name: "Sign in with Cloudflare" })).toHaveAttribute(
		"href",
		"/api/login/cloudflare?returnTo=/foobar",
	);
	await expect(page.getByRole("link", { name: "Sign in with GitHub" })).toHaveAttribute(
		"href",
		"/api/login/github?returnTo=/foobar",
	);
});

test("deletes cloud progress durably and synchronizes the lifecycle across tabs", async ({
	page,
}) => {
	await authenticateFoobarE2e(page);
	await seedProgress(page);
	await page.goto("/foobar");
	await expect(page.getByText("Signed in as Foobar E2E Hunter.")).toBeVisible();
	await ensureCloudEnabled(page);

	const second = await page.context().newPage();
	await seedProgress(second);
	await second.goto("/foobar");
	await ensureCloudEnabled(second);

	const trigger = page.getByRole("button", { name: "Delete cloud save" });
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
	await expect(page.getByText("Hint 4 · Developing", { exact: true })).toBeVisible();
	const hasHorizontalOverflow = await page
		.locator("main")
		.evaluate((element) => element.scrollWidth > element.clientWidth);
	expect(hasHorizontalOverflow).toBe(false);
});

test("completes browser-only achievements and plants the devtools clue", async ({ page }) => {
	await seedProgress(page);
	await page.goto("/foobar");

	await expect(page.locator('[data-foobar="/foobar/devtools"]')).toHaveCount(1);

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
		["/robots.txt", "/foobar/paper-trail"],
		["/.well-known/security.txt", "/foobar/paper-trail"],
		["/rss/feed.xml", "/foobar/feed-reader"],
	]) {
		const response = await request.get(path);
		expect(response.status()).toBe(200);
		expect(await response.text()).toContain(clue);
	}

	await seedProgress(page);
	await page.goto("/foobar");
	const printClue = page.getByText(/paper remembers.*\/foobar\/print-preview/i);
	await expect(printClue).toBeHidden();
	await page.emulateMedia({ media: "print" });
	await expect(printClue).toBeVisible();
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
		foobar: "/foobar/service-worker",
	});

	const aboutResponse = await page.request.get("/about");
	expect(aboutResponse.status()).toBe(200);
});

test("unlocks campfire for two simultaneous hunters", async ({ browser }) => {
	const firstContext = await browser.newContext();
	const secondContext = await browser.newContext();
	const first = await firstContext.newPage();
	const second = await secondContext.newPage();
	await seedProgress(first);
	await seedProgress(second);

	await Promise.all([first.goto("/foobar"), second.goto("/foobar")]);
	await expect(first.getByRole("heading", { name: "Campfire", exact: true })).toBeVisible();

	for (const hunter of [first, second]) {
		await expect.poll(() => hasPersistedAchievement(hunter, "campfire")).toBe(true);
	}

	await firstContext.close();
	await secondContext.close();
});
