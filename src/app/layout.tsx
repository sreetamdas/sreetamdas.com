import "./global.css";

import PlausibleProvider from "next-plausible";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND, SITE_URL } from "@/config";
import { type ColorSchemeSliceType } from "@/lib/domains/colorScheme/store";
import { inter_font, iosevka_font, eb_garamond_font } from "@/lib/domains/fonts";
import { FOOBAR_SOURCE_CODE } from "@/lib/domains/foobar/helpers";
// import { blockingScriptSetInitialColorScheme } from "@/lib/domains/colorScheme/blockingScript";

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
				{children}
				<script
					dangerouslySetInnerHTML={{
						__html: FOOBAR_SOURCE_CODE,
					}}
				></script>
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
};

export const viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#5B34DA" },
		{ media: "(prefers-color-scheme: dark)", color: "#9D86E9" },
	],
};

function setInitialColorScheme() {
	function getInitialColorScheme(): NonNullable<ColorSchemeSliceType["colorScheme"]> {
		const persistedColorScheme = window.localStorage.getItem("color-scheme") as NonNullable<
			ColorSchemeSliceType["colorScheme"]
		>;
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

const blockingScriptSetInitialColorScheme = `(function() {
	${setInitialColorScheme.toString()}
	setInitialColorScheme();
})()

// IIFE!
`;
