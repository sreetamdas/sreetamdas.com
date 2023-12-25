"use client";

import { captureException } from "@sentry/nextjs";
import PlausibleProvider from "next-plausible";
import { useEffect } from "react";

import { inter_font, iosevka_font, eb_garamond_font } from "@/lib/domains/fonts";
import { FOOBAR_SOURCE_CODE } from "@/lib/domains/foobar/helpers";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
	useEffect(() => {
		captureException(error);
	}, [error]);

	return (
		<html
			lang="en"
			dir="ltr"
			className={`scroll-pt-16 scroll-smooth ${inter_font.variable} ${iosevka_font.variable} ${eb_garamond_font.variable}`}
			suppressHydrationWarning
		>
			<head>
				<link rel="icon" href="/favicon.png" />

				<PlausibleProvider
					domain="sreetamdas.com"
					customDomain="sreetamdas.com"
					trackOutboundLinks
					trackFileDownloads
				/>
			</head>
			<body className="min-h-screen bg-background text-foreground selection:bg-secondary selection:text-background">
				<script
					dangerouslySetInnerHTML={{
						__html: blockingScriptSetInitialColorScheme,
					}}
				></script>
				<h2>Something went wrong!</h2>
				<button onClick={() => reset()}>Try again</button>
				<script
					dangerouslySetInnerHTML={{
						__html: FOOBAR_SOURCE_CODE,
					}}
				></script>
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
