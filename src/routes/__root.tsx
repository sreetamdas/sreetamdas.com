// <reference types="vite/client" />
import type { ReactNode } from "react";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { FOOBAR_SOURCE_CODE } from "@/lib/domains/foobar/helpers";

import appCss from "@/app/global.css?url";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const Route = createRootRoute({
	component: RootComponent,

	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "icon",
				href: "/favicon.png",
			},
		],
		scripts: [
			{
				defer: true,
				"data-domain": "sreetamdas.com",
				src: "https://plausible.io/js/script.file-downloads.outbound-links.pageview-props.tagged-events.local.js",
			},
			{
				children:
					"window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }",
			},
		],
	}),
	scripts: () => [
		{
			children: blockingScriptSetInitialColorScheme,
		},
		{
			children: FOOBAR_SOURCE_CODE,
		},
	],
	headers: () => ({
		"x-foobar": "/foobar/headers",
	}),
});

const authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	return next({
		headers: {
			Authorization: `Bearer 123`,
		},
	});
});

function RootComponent() {
	const queryClient = new QueryClient();
	return (
		<RootDocument>
			<QueryClientProvider client={queryClient}>
				<Outlet />
			</QueryClientProvider>
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en" dir="ltr" className={`scroll-pt-16 scroll-smooth`} suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="bg-background text-foreground selection:bg-secondary selection:text-background min-h-screen">
				{children}
				<Scripts />
			</body>
		</html>
	);
}

const blockingScriptSetInitialColorScheme = `(function() {
	function setInitialColorScheme() {
		function getInitialColorScheme() {
			const persistedColorScheme = window.localStorage.getItem("color-scheme");
			const hasPersistedColorScheme = typeof persistedColorScheme === "string";

			/**
			 * If the user has explicitly chosen light or dark, use it
			 */
			if (hasPersistedColorScheme) {
				const root = window.document.documentElement;
				root.style.setProperty("--initial-color-scheme", persistedColorScheme);

				if (persistedColorScheme !== "system") {
					return persistedColorScheme;
				}
			}

			/**
			 * If they haven't been explicit, check the media query
			 */
			const mql = window.matchMedia("(prefers-color-scheme: dark)");
			const hasSystemColorSchemePreference = typeof mql.matches === "boolean";

			if (hasSystemColorSchemePreference) {
				return mql.matches ? "dark" : "light";
			}

			/**
			 * If they are using a browser/OS that doesn't support
			 * color themes, default to 'light'.
			 */
			return "light";
		}

		const colorScheme = getInitialColorScheme();
		if (colorScheme === "dark") {
			document.documentElement.setAttribute("data-color-scheme", "dark");
		}
	}
	setInitialColorScheme();
})()

// IIFE!
`;
