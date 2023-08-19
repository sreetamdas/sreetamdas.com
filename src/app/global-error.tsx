"use client";

import PlausibleProvider from "next-plausible";

import { blockingScriptSetInitialColorScheme } from "@/lib/domains/colorScheme/blockingScript";
import { inter_font, iosevka_font, eb_garamond_font } from "@/lib/domains/fonts";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
	// eslint-disable-next-line no-console
	console.error("Caught ==>", error);

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
			</body>
		</html>
	);
}
