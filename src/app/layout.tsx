import "./global.css";

import PlausibleProvider from "next-plausible";

import { SITE_URL } from "@/config";
import { blockingScriptSetInitialColorScheme } from "@/lib/domains/colorScheme/blockingScript";
import { inter_font, iosevka_font, eb_garamond_font } from "@/lib/styles/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			dir="ltr"
			className={`${inter_font.variable} ${iosevka_font.variable} ${eb_garamond_font.variable}`}
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
			<body>
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
	title: "Hello hello! | Sreetam Das",
	description:
		"Senior software tinkerer from India. 💜 React, Elixir and TypeScript, CS:GO and mechanical keyboards!",
	openGraph: {
		title: "👋 Hello! | Sreetam Das",
		description:
			"Senior software tinkerer from India. 💜 React, Elixir and TypeScript, CS:GO and mechanical keyboards!",
		url: SITE_URL,
		type: "website",
	},
	twitter: {
		title: "👋 Hello! | Sreetam Das",
		description:
			"Senior software tinkerer from India. 💜 React, Elixir and TypeScript, CS:GO and mechanical keyboards!",
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
