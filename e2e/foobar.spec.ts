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
		if (window.sessionStorage.getItem("foobar-e2e-seeded")) return;

		const value = JSON.stringify({ state: { foobar_data: progress }, version: 0 });
		window.localStorage.setItem("foobar-zustand", value);
		window.localStorage.setItem("foobar-zustand-dev", value);
		window.sessionStorage.setItem("foobar-e2e-seeded", "true");
	}, legacyProgress);
}

test("groups achievements and persists revealed field notes", async ({ page }) => {
	await seedLegacyProgress(page);
	await page.goto("/foobar");

	await expect(page.getByRole("heading", { name: "Warmup / Discovery" })).toBeVisible();
	await expect(page.getByText("2 / 5 complete")).toBeVisible();
	await expect(page.getByRole("heading", { name: "Field notes" })).toBeVisible();
	await expect(page.getByText("Earlier", { exact: true })).toHaveCount(2);
	await expect(page.getByText("A small fire burns brighter with company.")).toBeVisible();
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

test("completes browser-only achievements and plants the devtools clue", async ({ page }) => {
	await seedLegacyProgress(page);
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

	await expect
		.poll(() =>
			page.evaluate(() => {
				const raw = window.localStorage.getItem("foobar-zustand");
				if (!raw) return false;
				const persisted = JSON.parse(raw);
				return (
					persisted.state.foobar_data.konami === true &&
					persisted.state.foobar_data.completed.includes("konami")
				);
			}),
		)
		.toBe(true);

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
	await page.getByRole("link", { name: "Sreetam Das' Reddit" }).click();

	await expect
		.poll(() =>
			page.evaluate(() => {
				const raw = window.localStorage.getItem("foobar-zustand");
				if (!raw) return false;
				const persisted = JSON.parse(raw);
				return persisted.state.foobar_data.completed.includes("easter-egg");
			}),
		)
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

	await seedLegacyProgress(page);
	await page.goto("/foobar");
	const printClue = page.getByText(/paper remembers.*\/foobar\/print-preview/i);
	await expect(printClue).toBeHidden();
	await page.emulateMedia({ media: "print" });
	await expect(printClue).toBeVisible();
});

test("reveals the service-worker clue without touching normal traffic", async ({ page }) => {
	await seedLegacyProgress(page);
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
	await seedLegacyProgress(first);
	await seedLegacyProgress(second);

	await Promise.all([first.goto("/foobar"), second.goto("/foobar")]);
	await expect(first.getByRole("heading", { name: "Campfire", exact: true })).toBeVisible();

	for (const hunter of [first, second]) {
		await expect
			.poll(() =>
				hunter.evaluate(() => {
					const raw = window.localStorage.getItem("foobar-zustand");
					if (!raw) return false;
					const persisted = JSON.parse(raw);
					return persisted.state.foobar_data.completed.includes("campfire");
				}),
			)
			.toBe(true);
	}

	await firstContext.close();
	await secondContext.close();
});
