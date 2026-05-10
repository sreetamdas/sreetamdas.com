import { cloudflare } from "@cloudflare/vite-plugin";
import remdx from "@nkzw/vite-plugin-remdx";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 3000,
	},
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr", childEnvironments: ["rsc"] } }),
		tanstackStart({
			rsc: {
				enabled: true,
			},
			prerender: {
				enabled: true,
				autoSubfolderIndex: false,
			},
		}),
		rsc(),
		remdx(),
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
