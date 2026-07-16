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

	await page.getByRole("button", { name: "Reveal hint 1 of 4 for dns-txt" }).click();
	await expect(page.getByText("The clue lives below HTTP.").first()).toBeVisible();
	await page.reload();
	await expect(page.getByText("The clue lives below HTTP.").first()).toBeVisible();
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
