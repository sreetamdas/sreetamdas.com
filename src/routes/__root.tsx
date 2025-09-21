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
import { SITE_DESCRIPTION, SITE_OG_IMAGE, SITE_TITLE_APPEND, SITE_URL } from "@/config";

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
			{
				name: "description",
				content: SITE_DESCRIPTION,
			},
			{
				property: "og:title",
				content: `👋 Hello hello! ${SITE_TITLE_APPEND}`,
			},
			{
				property: "og:description",
				content: SITE_DESCRIPTION,
			},
			{
				property: "og:url",
				content: SITE_URL,
			},
			{
				property: "og:image:type",
				content: "image/png",
			},
			{
				property: "og:image:width",
				content: "1200",
			},
			{
				property: "og:image:height",
				content: "600",
			},
			{
				property: "og:image",
				content: `${SITE_URL}${SITE_OG_IMAGE}`,
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "twitter:card",
				content: "summary_large_image",
			},
			{
				property: "twitter:site",
				content: "@_SreetamDas",
			},
			{
				property: "twitter:created",
				content: "@_SreetamDas",
			},
			{
				property: "twitter:title",
				content: `👋 Hello hello! ${SITE_TITLE_APPEND}`,
			},
			{
				property: "twitter:description",
				content: SITE_DESCRIPTION,
			},
			{
				property: "twitter:image:type",
				content: "image/png",
			},
			{
				property: "twitter:image:width",
				content: "1200",
			},
			{
				property: "twitter:image:height",
				content: "600",
			},
			{
				property: "twitter:image",
				content: `${SITE_URL}${SITE_OG_IMAGE}`,
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
			{
				rel: "canonical",
				href: SITE_URL,
			},
		],
		scripts: [
			{
				defer: true,
				"data-domain": "sreetamdas.com",
				"data-api": "/prxy/plsbl/api/event",
				src: "/prxy/plsbl/js/script.file-downloads.outbound-links.pageview-props.tagged-events.local.js",
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

function RootComponent() {
	const queryClient = new QueryClient();

	return (
		<RootDocument>
			<QueryClientProvider client={queryClient}>
				<Outlet />
				<ReactQueryDevtools initialIsOpen={false} />
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
