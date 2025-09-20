import "./global.css";

import PlausibleProvider from "next-plausible";
import { type ReactNode } from "react";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND, SITE_URL } from "@/config";
import { bricolage_grotesque_font, inter_font, iosevka_font } from "@/lib/domains/fonts";
import { FOOBAR_SOURCE_CODE } from "@/lib/domains/foobar/helpers";

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			dir="ltr"
			className={`scroll-pt-16 scroll-smooth ${inter_font.variable} ${iosevka_font.variable} ${bricolage_grotesque_font.variable}`}
			suppressHydrationWarning
		>
			<head>
				<link rel="icon" href="/favicon.png" />

				<PlausibleProvider
					domain="sreetamdas.com"
					customDomain="sreetamdas.com"
					trackOutboundLinks
					trackFileDownloads
					enabled={process.env.NODE_ENV === "production"}
				/>
			</head>
			<body className="bg-background text-foreground selection:bg-secondary selection:text-background min-h-screen">
				<script
					dangerouslySetInnerHTML={{
						__html: blockingScriptSetInitialColorScheme,
					}}
				/>
				{children}
				<script
					dangerouslySetInnerHTML={{
						__html: FOOBAR_SOURCE_CODE,
					}}
				/>
			</body>
		</html>
	);
}

export const metadata = {
	metadataBase: new URL(SITE_URL),
	title: `Hello hello! ${SITE_TITLE_APPEND}`,
	description: SITE_DESCRIPTION,
	openGraph: {
		title: `👋 Hello! ${SITE_TITLE_APPEND}`,
		description: SITE_DESCRIPTION,
		url: SITE_URL,
		type: "website",
	},
	twitter: {
		title: `👋 Hello! ${SITE_TITLE_APPEND}`,
		description: SITE_DESCRIPTION,
		card: "summary_large_image",
		creator: "@_SreetamDas",
		site: "@_SreetamDas",
	},
	appleWebApp: {
		title: "Sreetam Das' website",
		statusBarStyle: "default",
		capable: true,
	},
	icons: {
		icon: "/favicon.png",
	},
	other: {
		"mobile-web-app-capable": "yes",
	},
	alternates: {
		canonical: "./",
	},
};

export const viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#5B34DA" },
		{ media: "(prefers-color-scheme: dark)", color: "#9D86E9" },
	],
};

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
