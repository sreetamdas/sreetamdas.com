/// <reference types="node" />
import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "../e2e",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	// A ubuntu-latest runner has 4 cores. Two workers left half of them idle,
	// and retries stay at 2 to absorb any contention the extra workers add.
	workers: process.env.CI ? 4 : undefined,
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL: "http://127.0.0.1:5045",
		trace: "retain-on-failure",
		video: "retain-on-failure",
		screenshot: "only-on-failure",
	},
	webServer: {
		cwd: "..",
		command: process.env.CI
			? "pnpm db:migrate:local && pnpm exec vp preview --host 127.0.0.1 --port 5045"
			: "pnpm exec vp preview --host 127.0.0.1 --port 5045",
		url: "http://127.0.0.1:5045",
		reuseExistingServer: !process.env.CI,
		timeout: 600000,
	},
});
