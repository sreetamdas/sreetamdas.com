// <reference types="vite/client" />
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { FOOBAR_SOURCE_CODE } from "@/lib/domains/foobar/helpers";
import { type ReactNode } from "react";
import "@fontsource-variable/bricolage-grotesque/index.css";
import bricolageGrotesqueFont from "@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?url";
import "@fontsource-variable/inter/index.css";
import interFont from "@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2?url";
import appCss from "./global.css?url";
import { IS_DEV, SITE_TITLE_APPEND } from "@/config";

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
				title: `Hello hello! ${SITE_TITLE_APPEND}`,
			},
			// Description is set per-route.
			{
				name: "mobile-web-app-capable",
				content: "yes",
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Sreetam Das' website",
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default",
			},
			// SEO meta (canonical, og:*, twitter:title/description/image) is set per-route.
			{ name: "twitter:card", content: "summary_large_image" },
			{
				name: "twitter:site",
				content: "@_SreetamDas",
			},
			{
				name: "twitter:creator",
				content: "@_SreetamDas",
			},
			{
				name: "theme-color",
				media: "(prefers-color-scheme: light)",
				content: "#5B34DA",
			},
			{
				name: "theme-color",
				media: "(prefers-color-scheme: dark)",
				content: "#9D86E9",
			},
		],
		links: [
			{
				rel: "preload",
				as: "font",
				type: "font/woff2",
				href: bricolageGrotesqueFont,
				crossOrigin: "anonymous",
			},
			{
				rel: "preload",
				as: "font",
				type: "font/woff2",
				href: interFont,
				crossOrigin: "anonymous",
			},
			{ rel: "stylesheet", href: appCss },
			{
				rel: "icon",
				href: "/favicon.png",
			},
			// {
			// 	rel: "canonical",
			// 	href: SITE_URL,
			// },
		],
		scripts: [
			{
				defer: true,
				"data-domain": "sreetamdas.com",
				"data-api": "/prxy/plsbl/api/event",
				src: "/prxy/plsbl/js/pa-9_SvPsvmZhj3FQWGOD3c1.js",
			},
			{
				children:
					"window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init({endpoint:'/prxy/plsbl/api/event'})",
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

function RootComponent() {
	const queryClient = new QueryClient();

	return (
		<RootDocument>
			<QueryClientProvider client={queryClient}>
				<Outlet />
				{IS_DEV ? (
					<ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
				) : null}
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
