import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL: "http://127.0.0.1:3000",
		trace: "retain-on-failure",
		video: "retain-on-failure",
		screenshot: "only-on-failure",
	},
	webServer: {
		command: "pnpm build && vite preview --host 127.0.0.1 --port 3000",
		url: "http://127.0.0.1:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
