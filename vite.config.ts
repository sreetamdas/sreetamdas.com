import { cloudflare } from "@cloudflare/vite-plugin";
import contentCollections from "@content-collections/vite";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type UserConfig } from "vite-plus";

import { slideDeckPlugin } from "./src/lib/domains/slides/vite-plugin.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));

// Vitest sets this before resolving config. A bare `vitest`/`vp test` run loads
// this root config; the app plugins (notably `cloudflare()`) inject worker-env
// options the Cloudflare plugin rejects, so skip them and delegate to the
// dedicated project configs via `test.projects` below.
const isVitest = Boolean(process.env.VITEST);

function getPlugins(): Array<unknown> {
	if (isVitest) {
		return [];
	}

	const hasSentryBuildEnv = Boolean(
		process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
	);

	const sitemapHost = (process.env.VITE_SITE_URL ?? "https://sreetamdas.com").replace(/\/$/, "");

	const plugins: Array<unknown> = [];

	plugins.push(
		cloudflare({
			viteEnvironment: { name: "ssr", childEnvironments: ["rsc"] },
			tunnel: {
				name: "local-srtm.fyi",
				autoStart: false,
			},
		}),
		contentCollections({
			// During `pnpm build`, the `prebuild` step already runs
			// `content-collections build`, so skip the redundant rebuild here.
			// The plugin still wires the `content-collections` import alias.
			// `build:ci` and `vp dev` (no prebuild) leave the flag unset so the
			// plugin generates as usual.
			isEnabled: () => process.env.CC_SKIP_VITE_BUILD !== "1",
		}),
		tanstackStart({
			importProtection: {
				client: {
					files: [
						"**/src/db/index.ts",
						"**/src/lib/auth/index.ts",
						"**/src/lib/domains/Analytics/stats.ts",
					],
					specifiers: ["cloudflare:workers"],
				},
			},
			rsc: {
				enabled: true,
			},
			prerender: {
				enabled: true,
				// Crawl-discovered asset links (e.g. /resume.pdf) must not be
				// prerendered: the prerenderer writes fetched responses as UTF-8
				// text, which corrupts binary assets copied from public/.
				filter: (page) => !/\.[a-z0-9]+$/i.test(page.path),
				autoSubfolderIndex: false,
				// Newsletter detail pages are now prerendered (for SEO) by crawling the
				// newsletter index. Buttondown content is fetched at build time, so retry
				// transient fetch failures — but keep the build fail-fast (the default) so
				// a genuinely broken page or stale internal link surfaces instead of
				// silently shipping a 404 into the sitemap.
				retryCount: 2,
				retryDelay: 1000,
			},
			sitemap: {
				enabled: true,
				host: sitemapHost,
			},
		}),
		rsc(),
		slideDeckPlugin(),
		viteReact(),
		tailwindcss(),
	);

	if (hasSentryBuildEnv) {
		plugins.push(
			sentryTanstackStart({
				authToken: process.env.SENTRY_AUTH_TOKEN,
				autoInstrumentMiddleware: false,
				org: process.env.SENTRY_ORG,
				project: process.env.SENTRY_PROJECT,
				tunnelRoute: true,
			}),
		);
	}

	return plugins;
}

const oxfmt_config: UserConfig["fmt"] = {
	useTabs: true,
	tabWidth: 2,
	semi: true,
	singleQuote: false,
	printWidth: 100,
	trailingComma: "all",
	sortTailwindcss: {
		functions: ["clsx", "cn"],
		stylesheet: "./src/routes/global.css",
	},
	sortImports: {
		groups: [
			"type-import",
			["value-builtin", "value-external"],
			"type-internal",
			"value-internal",
			["type-parent", "type-sibling", "type-index"],
			["value-parent", "value-sibling", "value-index"],
			"unknown",
		],
	},
	ignorePatterns: [
		"node_modules",
		"dist",
		".content-collections",
		"coverage",
		".next",
		"out",
		"build",
		"public/rss",
		"public/sitemap*.xml",
		"public/mockServiceWorker.js",
		"*.log",
		".env*",
		"tsconfig.tsbuildinfo",
		"src/**/routeTree.gen.ts",
	],
	overrides: [
		{
			files: ["*.mdx"],
			options: {
				useTabs: false,
				tabWidth: 2,
				printWidth: 70,
			},
		},
		{
			files: ["*.json", "*.jsonc"],
			options: {
				trailingComma: "none",
			},
		},
	],
};

const oxlint_config: UserConfig["lint"] = {
	plugins: ["typescript", "oxc", "unicorn", "import", "react", "jsx-a11y"],
	jsPlugins: ["eslint-plugin-better-tailwindcss"],
	categories: {
		correctness: "off",
	},
	env: {
		builtin: true,
		browser: true,
		commonjs: true,
		node: true,
		"shared-node-browser": true,
	},
	options: {
		typeAware: false,
		typeCheck: false,
	},
	settings: {
		"better-tailwindcss": {
			entryPoint: "src/routes/global.css",
		},
	},
	rules: {
		"for-direction": "error",
		"no-async-promise-executor": "error",
		"no-case-declarations": "error",
		"no-class-assign": "error",
		"no-compare-neg-zero": "error",
		"no-cond-assign": "error",
		"no-const-assign": "error",
		"no-constant-binary-expression": "error",
		"no-constant-condition": "error",
		"no-control-regex": "error",
		"no-debugger": "error",
		"no-delete-var": "error",
		"no-dupe-class-members": "error",
		"no-dupe-else-if": "error",
		"no-dupe-keys": "error",
		"no-duplicate-case": "error",
		"no-empty": "error",
		"no-empty-character-class": "error",
		"no-empty-pattern": "error",
		"no-empty-static-block": "error",
		"no-ex-assign": "error",
		"no-extra-boolean-cast": "error",
		"no-fallthrough": "error",
		"no-func-assign": "error",
		"no-global-assign": "error",
		"no-import-assign": "error",
		"no-invalid-regexp": "error",
		"no-irregular-whitespace": "error",
		"no-loss-of-precision": "error",
		"no-new-native-nonconstructor": "error",
		"no-nonoctal-decimal-escape": "error",
		"no-obj-calls": "error",
		"no-prototype-builtins": "error",
		"no-redeclare": "error",
		"no-regex-spaces": "error",
		"no-self-assign": "error",
		"no-setter-return": "error",
		"no-shadow-restricted-names": "error",
		"no-sparse-arrays": "error",
		"no-this-before-super": "error",
		"no-unexpected-multiline": "error",
		"no-unsafe-finally": "error",
		"no-unsafe-negation": "error",
		"no-unsafe-optional-chaining": "error",
		"no-unused-labels": "error",
		"no-unused-private-class-members": "error",
		"no-unused-vars": [
			"error",
			{
				varsIgnorePattern: "^_",
				argsIgnorePattern: "^_",
				destructuredArrayIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
			},
		],
		"no-useless-backreference": "error",
		"no-useless-catch": "error",
		"no-useless-escape": "error",
		"no-with": "error",
		"require-yield": "error",
		"use-isnan": "error",
		"valid-typeof": "error",
		"@typescript-eslint/ban-ts-comment": "error",
		"no-array-constructor": "error",
		"@typescript-eslint/no-duplicate-enum-values": "error",
		"@typescript-eslint/no-empty-object-type": "error",
		"@typescript-eslint/no-explicit-any": "error",
		"@typescript-eslint/no-unnecessary-type-assertion": "error",
		"@typescript-eslint/no-unsafe-type-assertion": "error",
		"@typescript-eslint/non-nullable-type-assertion-style": "error",
		"@typescript-eslint/consistent-type-assertions": [
			"error",
			{
				assertionStyle: "as",
				objectLiteralTypeAssertions: "never",
			},
		],
		"@typescript-eslint/no-extra-non-null-assertion": "error",
		"@typescript-eslint/no-misused-new": "error",
		"@typescript-eslint/no-namespace": "error",
		"@typescript-eslint/no-non-null-asserted-optional-chain": "error",
		"@typescript-eslint/no-require-imports": "error",
		"@typescript-eslint/no-this-alias": "error",
		"@typescript-eslint/no-unnecessary-type-constraint": "error",
		"@typescript-eslint/no-unsafe-declaration-merging": "error",
		"@typescript-eslint/no-unsafe-function-type": "error",
		"no-unused-expressions": "error",
		"@typescript-eslint/no-wrapper-object-types": "error",
		"@typescript-eslint/prefer-as-const": "error",
		"@typescript-eslint/prefer-namespace-keyword": "error",
		"@typescript-eslint/triple-slash-reference": "error",
		"no-console": "error",
		"better-tailwindcss/no-unknown-classes": "warn",
		"better-tailwindcss/no-duplicate-classes": "error",
		"better-tailwindcss/no-conflicting-classes": "warn",
		"better-tailwindcss/no-deprecated-classes": "warn",
		"better-tailwindcss/no-unnecessary-whitespace": "error",
		"better-tailwindcss/enforce-consistent-class-order": "warn",
	},
	overrides: [
		{
			files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
			rules: {
				"no-class-assign": "off",
				"no-const-assign": "off",
				"no-dupe-class-members": "off",
				"no-dupe-keys": "off",
				"no-func-assign": "off",
				"no-import-assign": "off",
				"no-new-native-nonconstructor": "off",
				"no-obj-calls": "off",
				"no-redeclare": "off",
				"no-setter-return": "off",
				"no-this-before-super": "off",
				"no-unsafe-negation": "off",
				"no-var": "error",
				"no-with": "off",
				"prefer-rest-params": "error",
				"prefer-spread": "error",
			},
		},
	],
};

export default defineConfig({
	build: {
		chunkSizeWarningLimit: 2_000,
	},
	fmt: oxfmt_config,
	lint: oxlint_config,
	staged: {
		// `routeTree.gen.ts` is generated and sits in `fmt.ignorePatterns`, so a
		// commit that stages only that file would hand `vp fmt` a list it filters
		// down to nothing and fail with "Expected at least one target file".
		// Keep generated output out of the matcher instead.
		"!(*.gen).{ts,tsx,js,jsx}": ["vp fmt", "vp lint"],
		"*.{json,jsonc}": ["vp fmt"],
	},
	server: {
		port: 5045,
	},
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		// A bare `vitest`/`vp test` run delegates to the dedicated project
		// configs (unit + Cloudflare Workers pool). The `pnpm test:*` scripts
		// still target each config directly with their required flags.
		projects: [
			{ extends: ".config/vitest.unit.config.ts", root: repoRoot },
			{ extends: ".config/vitest.config.ts", root: repoRoot },
		],
		passWithNoTests: true,
	},
	// @ts-expect-error type depth
	plugins: getPlugins(),
});
