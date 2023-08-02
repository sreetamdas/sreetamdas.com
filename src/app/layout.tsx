import PlausibleProvider from "next-plausible";

import "./global.css";

import { DocumentHead } from "@/lib/domains/SEO";
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
				<meta name="apple-mobile-web-app-title" content="Sreetam Das' Blog" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="mobile-web-app-capable" content="yes" />

				<PlausibleProvider
					domain="sreetamdas.com"
					customDomain="sreetamdas.com"
					trackOutboundLinks
					trackFileDownloads
				/>
				<DocumentHead title="Hello hello!" />
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
