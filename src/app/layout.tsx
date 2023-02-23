import PlausibleProvider from "next-plausible";

import styles from "./styles.module.css";
import "./global.css";

import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";
import { DocumentHead } from "@/lib/domains/SEO";
import { blockingScriptSetInitialColorScheme } from "@/lib/domains/colorScheme/blockingScript";
import { interFont, iosevkaFont, madeMellowFont } from "@/lib/styles/fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			dir="ltr"
			className={`${interFont.variable} ${iosevkaFont.variable} ${madeMellowFont.variable}`}
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
					<Footer />
				</main>
			</body>
		</html>
	);
}