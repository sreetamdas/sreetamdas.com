import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";
import { sentryTanstackStart } from "@sentry/tanstackstart-react";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tanstackStart({}),
		viteReact(),
		tailwindcss(),
		...(process.env.SENTRY_AUTH_TOKEN
			? [
					sentryTanstackStart({
						org: process.env.SENTRY_ORG,
						project: process.env.SENTRY_PROJECT,
						authToken: process.env.SENTRY_AUTH_TOKEN,
					}),
				]
			: []),
	],
});
