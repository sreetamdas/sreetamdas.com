"use client";

import { captureException } from "@sentry/nextjs";
import PlausibleProvider from "next-plausible";
import { useEffect } from "react";

import { blockingScriptSetInitialColorScheme } from "@/lib/domains/colorScheme/blockingScript";
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
