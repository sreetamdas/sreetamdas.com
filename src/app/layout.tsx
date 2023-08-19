import "./global.css";

import PlausibleProvider from "next-plausible";

import { SITE_DESCRIPTION, SITE_TITLE_APPEND, SITE_URL } from "@/config";
import { blockingScriptSetInitialColorScheme } from "@/lib/domains/colorScheme/blockingScript";
import { inter_font, iosevka_font, eb_garamond_font } from "@/lib/domains/fonts";

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
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#5B34DA" },
		{ media: "(prefers-color-scheme: dark)", color: "#9D86E9" },
	],
	icons: {
		icon: "/favicon.png",
	},
	other: {
		"mobile-web-app-capable": "yes",
	},
};
