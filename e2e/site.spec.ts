import { expect, test, type Page } from "@playwright/test";

async function clearLocalState(page: Page) {
	await page.addInitScript(() => {
		window.localStorage.clear();
	});
}

test.beforeEach(async ({ page }) => {
	await clearLocalState(page);
});

test("home page renders shared chrome and introduction content", async ({ page }) => {
	await page.goto("/");

	await expect(page.getByRole("heading", { level: 1, name: /Hey, I'm Sreetam!/ })).toBeVisible();
	await expect(page.getByRole("link", { name: "about", exact: true })).toBeVisible();
	await expect(page.getByRole("link", { name: "blog", exact: true })).toBeVisible();
	await expect(page.getByRole("link", { name: "karma", exact: true })).toBeVisible();
	await expect(page.getByRole("link", { name: "uses", exact: true })).toBeVisible();
	await expect(page.locator("main")).toContainText("Page views with Cloudflare D1 and Drizzle ORM");
	await expect(page.locator("main")).toContainText("Durable Objects");
	await expect(page.getByText("Made with TanStack Start")).toBeVisible();
	await expect(page.getByText("I hope you have a very nice day")).toBeVisible();
	await expect(page.getByRole("link", { name: "Skip to main content" })).toHaveAttribute(
		"href",
		"#main-content",
	);
	await expect(page.locator("#main-content")).toBeVisible();
	await expect(page).toHaveTitle(/Hello hello!/);
	await expect(page.locator('link[rel="canonical"][href="https://sreetamdas.com"]')).toBeAttached();
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		"content",
		/Senior software tinkerer/,
	);
	await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
	await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
		"content",
		"summary_large_image",
	);
	await expect(page.locator("footer")).toBeVisible();
});

test("desktop color scheme toggle cycles into dark mode and persists", async ({ page }) => {
	await page.goto("/");

	const toggle = page.locator("header button:visible").first();

	await toggle.click();
	await toggle.click();

	await expect
		.poll(() => page.evaluate(() => window.localStorage.getItem("color-scheme")))
		.toBe("dark");
	await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "dark");
});

test("mobile navigation drawer opens and closes during route navigation", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");

	await page.getByRole("button", { name: "Close mobile navigation drawer" }).click();
	await expect(page.getByRole("dialog")).toBeVisible();
	await page.getByRole("link", { name: "about" }).click();

	await expect(page).toHaveURL(/\/about$/);
	await expect(page.getByRole("heading", { level: 1, name: "/about" })).toBeVisible();
	await expect(page.locator("main")).toContainText(
		"You can check me out on the following platforms:",
	);
	await expect(page.getByRole("dialog")).toHaveCount(0);
	await expect(page.locator('main a[href="https://github.com/sreetamdas"]')).toBeVisible();
	await expect(page.locator('main a[href="https://twitter.com/_SreetamDas"]')).toBeVisible();
	await expect(page.locator('main a[href="https://www.linkedin.com/in/sreetamdas"]')).toBeVisible();
	await expect(page.locator('main a[href="mailto:sreetam@sreetamdas.com"]')).toBeVisible();
	await expect(page).toHaveTitle(/About/);
	await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		"content",
		/learn more about sreetam das/i,
	);
	await expect(page.locator("footer")).toBeVisible();
});

test("blog archive and blog detail route render content-heavy pages correctly", async ({
	page,
}) => {
	await page.goto("/blog");

	await expect(page.getByRole("heading", { level: 1, name: "/blog" })).toBeVisible();
	await expect(page.getByRole("link", { name: "Creating a chameleon text effect" })).toBeVisible();
	await expect(
		page.getByText("How to add a moving RGB effect to your text using styled-components"),
	).toBeVisible();
	await expect(
		page.locator('link[rel="canonical"][href="https://sreetamdas.com/blog"]'),
	).toBeAttached();
	await expect(page).toHaveTitle(/Blog archive/);

	await page.getByRole("link", { name: "Creating a chameleon text effect" }).click();

	await expect(page).toHaveURL(/\/blog\/chameleon-text$/);
	await expect(
		page.getByRole("heading", { level: 1, name: "Creating a chameleon text effect" }),
	).toBeVisible();
	await expect(page.locator("main")).toContainText("Here's how I did it.");
	await expect(page.locator("main")).toContainText("Let's break down what's happening here:");
	await expect(page.locator("main")).toContainText("Hello there!");
	await expect.poll(() => page.locator("pre code").count()).toBeGreaterThan(0);
	await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		"content",
		/How to add a moving RGB effect/,
	);

	await expect(page.locator("main")).toContainText("min read");
	await expect(page.locator("main")).toContainText("Changing colors");
	await expect(page.locator("main")).toContainText("styled-components");
	await expect.poll(() => page.locator("figure").count()).toBeGreaterThan(0);
	await expect(page.locator("main a[href='#changing-colors']")).toBeVisible();
});

test("root content routes render MDX and embedded route-specific components", async ({ page }) => {
	await page.goto("/credits");

	await expect(page.getByRole("heading", { level: 1, name: "/credits" })).toBeVisible();
	await expect(page.locator("main")).toContainText("Thanks to everyone who has contributed");
	await expect(page.locator("main")).toContainText("Inspiration");
	await expect(page.locator("main")).toContainText("Contributions");
	await expect(
		page.locator('main a[href="https://github.com/sreetamdas/sreetamdas.com"]').first(),
	).toBeVisible();

	const contributorCopy = page.getByText("No contributors found.");
	const contributorLinks = page.locator('main a[href^="https://github.com/"]');
	await expect
		.poll(async () => (await contributorCopy.count()) + (await contributorLinks.count()))
		.toBeGreaterThan(1);

	await expect(
		page.locator('link[rel="canonical"][href="https://sreetamdas.com/credits"]'),
	).toBeAttached();
	await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");

	await page.goto("/uses");
	await expect(page.getByRole("heading", { level: 1, name: "/uses" })).toBeVisible();
	await expect(
		page.locator('link[rel="canonical"][href="https://sreetamdas.com/uses"]'),
	).toBeAttached();
	await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
});

test("karma route supports theme switching without losing the showcase", async ({ page }) => {
	await page.goto("/karma");

	await expect(page.getByRole("heading", { level: 1, name: "Karma" })).toBeVisible();
	await expect(page.getByText("A colorful VS Code theme")).toBeVisible();
	await expect(page.getByRole("link", { name: "Install from VS Code marketplace" })).toBeVisible();
	await expect(page.getByRole("link", { name: "View source" })).toBeVisible();
	await expect(page.getByRole("switch")).toBeVisible();
	await expect(page.getByAltText("Karma theme screenshot for React")).toBeVisible();

	await page.getByRole("switch").click();

	await expect(page.getByAltText("Karma Light theme screenshot for React")).toBeVisible();
	await expect(page.locator('a[href="#react"]')).toBeVisible();
	await expect(page.locator('a[href="#typescript"]')).toBeVisible();
	await expect(
		page.locator('link[rel="canonical"][href="https://sreetamdas.com/karma"]'),
	).toBeAttached();
	await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
	await expect(page.locator("main")).toContainText("Check out examples:");
	await expect(page.locator("main")).toContainText("Dark mode");
	await expect(page.locator("main")).toContainText("Light mode");
	await expect(page.locator("main")).toContainText("React");
	await expect(page.locator("main")).toContainText("TypeScript");
	await expect(page).toHaveTitle(/Karma/);
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		"content",
		/A colorful VS Code theme by Sreetam Das/,
	);
});

test("missing routes render the site 404 page", async ({ page }) => {
	await page.goto("/this-route-should-not-exist", { waitUntil: "networkidle" });

	await expect(page.getByRole("heading", { level: 1, name: "404!" })).toBeVisible();
	await expect(page.getByText("The page you're looking for doesn't exist :/")).toBeVisible();
	await expect(page.getByRole("link", { name: "Go back home" })).toHaveAttribute("href", "/");
	await expect(
		page.getByRole("link", { name: /Dog Photographer of the Year 2018/i }),
	).toBeVisible();
});
