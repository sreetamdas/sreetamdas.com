import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";
import { sentryTanstackStart } from "@sentry/tanstackstart-react";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

type RootPage = { page_path: string };
type BlogPost = { page_path: string; published: boolean };

function readGeneratedJson<T>(fileName: string, fallback: T): T {
	const filePath = resolve(process.cwd(), ".velite", fileName);
	if (!existsSync(filePath)) {
		return fallback;
	}

	return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

const rootPages = readGeneratedJson<Array<RootPage>>("rootPages.json", []);
const blogPosts = readGeneratedJson<Array<BlogPost>>("blogPosts.json", []);

const prerenderPages = [
	"/",
	"/about",
	"/blog",
	"/newsletter",
	"/keebs",
	"/rwc",
	"/karma",
	"/fancy-pants",
	"/resume",
	"/foobar",
	...rootPages.map((page) => page.page_path),
	...blogPosts.filter((post) => post.published).map((post) => post.page_path),
].map((path) => ({ path }));

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tanstackStart({
			pages: prerenderPages,
			prerender: {
				enabled: true,
				crawlLinks: true,
				autoStaticPathsDiscovery: true,
				filter: ({ path }) => !path.startsWith("/aoc"),
			},
		}),
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
