import { cloudflare } from "@cloudflare/vite-plugin";
import contentCollections from "@content-collections/vite";
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite-plus";

import { slideDeckPlugin } from "./src/lib/domains/slides/vite-plugin.ts";

function getPlugins(): Array<unknown> {
	const hasSentryBuildEnv = Boolean(
		process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
	);

	// Widen to unknown[] so Vite's recursive plugin types don't blow up tsgo here.
	return [
		...(process.env.VITEST
			? []
			: [
					cloudflare({
						viteEnvironment: { name: "ssr", childEnvironments: ["rsc"] },
					}) as unknown,
				]),
		contentCollections({ environment: "ssr" }),
		tanstackStart({
			rsc: {
				enabled: true,
			},
			prerender: {
				enabled: true,
				autoSubfolderIndex: false,
				filter: ({ path }) => !path.startsWith("/newsletter") && path !== "/keebs",
			},
		}),
		rsc(),
		slideDeckPlugin(),
		viteReact(),
		tailwindcss(),
		...(hasSentryBuildEnv
			? [
					sentryTanstackStart({
						authToken: process.env.SENTRY_AUTH_TOKEN,
						autoInstrumentMiddleware: false,
						org: process.env.SENTRY_ORG,
						project: process.env.SENTRY_PROJECT,
						tunnelRoute: true,
					}) as unknown,
				]
			: []),
	] as Array<unknown>;
}

export default defineConfig({
	fmt: {
		useTabs: true,
		tabWidth: 2,
		semi: true,
		singleQuote: false,
		printWidth: 100,
		trailingComma: "all",
		experimentalTailwindcss: {},
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
	},
	lint: {
		plugins: ["typescript", "oxc", "unicorn", "import", "react", "jsx-a11y"],
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
			typeAware: true,
			typeCheck: true,
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
	},
	staged: {
		"*.{ts,tsx,js,jsx}": ["vp fmt", "vp lint"],
		"*.{json,jsonc}": ["vp fmt"],
	},
	server: {
		port: 3000,
	},
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		exclude: ["e2e/**", "node_modules", "dist", ".content-collections"],
		passWithNoTests: true,
	},
	// @ts-expect-error TS2322 — plugin inference is recursive unless widened first
	plugins: getPlugins(),
});
