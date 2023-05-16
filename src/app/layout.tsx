import PlausibleProvider from "next-plausible";

import styles from "./styles.module.css";
import "./global.css";

import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";
import { DocumentHead } from "@/lib/domains/SEO";
import { blockingScriptSetInitialColorScheme } from "@/lib/domains/colorScheme/blockingScript";
import { FoobarPixel } from "@/lib/domains/foobar";
import { inter_font, iosevka_font, eb_garamond_font } from "@/lib/styles/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			dir="ltr"
			className={`${inter_font.variable} ${iosevka_font.variable} ${eb_garamond_font.variable}`}
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
				<main className={`${styles["main-wrapper"]}`}>
					<Header />
					<div id="main-content">{children}</div>
					<FoobarPixel />
					<Footer />
				</main>
			</body>
		</html>
	);
}
