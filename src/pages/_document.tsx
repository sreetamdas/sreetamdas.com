import Document, { DocumentContext, Html, Head, Main, NextScript } from "next/document";
import { ServerStyleSheet } from "styled-components";

export default class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		const sheet = new ServerStyleSheet();
		const originalRenderPage = ctx.renderPage;

		try {
			ctx.renderPage = () =>
				originalRenderPage({
					enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
				});

			const initialProps = await Document.getInitialProps(ctx);
			return {
				...initialProps,
				styles: (
					<>
						{initialProps.styles}
						{sheet.getStyleElement()}
					</>
				),
			};
		} finally {
			sheet.seal();
		}
	}

	render() {
		return (
			<Html lang="en">
				<Head>
					<link rel="shortcut icon" href="/favicon.png" />
					<meta name="theme-color" content="#9D86E9" />
					<link rel="apple-touch-icon" href="/logo.png" />
					<meta name="apple-mobile-web-app-title" content="Sreetam Das' Blog" />
					<meta name="apple-mobile-web-app-status-bar-style" content="default" />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta name="mobile-web-app-capable" content="yes" />
					<link
						href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,700;1,400&display=swap"
						rel="stylesheet"
					/>
					<link rel="stylesheet" href="/fonts/iosevka/iosevka.css" />
					{process.env.NODE_ENV === "production" && (
						<script async src="https://unpkg.com/thesemetrics@latest"></script>
					)}
				</Head>
				<body>
					<script
						dangerouslySetInnerHTML={{
							__html: blockingSetInitialColorMode,
						}}
					></script>
					<div
						dangerouslySetInnerHTML={{
							__html: TS_SOURCE_COMMENT,
						}}
					></div>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

const blockingSetInitialColorMode = `(function() {
	${setInitialColorMode.toString()}
	setInitialColorMode();
})()

// IIFE!
`;

function setInitialColorMode() {
	function getInitialColorMode() {
		const persistedColorPreference = window.localStorage.getItem("theme");
		const hasPersistedPreference = typeof persistedColorPreference === "string";
		/**
		 * If the user has explicitly chosen light or dark,
		 * use it. Otherwise, this value will be null.
		 */
		if (hasPersistedPreference) {
			return persistedColorPreference;
		}

		/**
		 * If they haven't been explicit, check the media query
		 */
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const hasMediaQueryPreference = typeof mql.matches === "boolean";

		if (hasMediaQueryPreference) {
			return mql.matches ? "dark" : "light";
		}

		/**
		 * If they are using a browser/OS that doesn't support
		 * color themes, default to 'light'.
		 */
		return "light";
	}

	const colorMode = getInitialColorMode();
	const root = document.documentElement;
	root.style.setProperty("--initial-color-mode", colorMode);

	if (colorMode === "dark") document.documentElement.setAttribute("data-theme", "dark");
}

const TS_SOURCE_COMMENT = `



<!-- 


████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████888████888██████████888█888█████████████████████████████████████████████
████888████888██████████888█888█████████████████████████████████████████████
████888████888██████████888█888█████████████████████████████████████████████
████8888888888██.d88b.██888█888██.d88b.█████████████████████████████████████
████888████888█d8P██Y8b█888█888█d88""88b████████████████████████████████████
████888████888█88888888█888█888█888██888████████████████████████████████████
████888████888█Y8b.█████888█888█Y88..88P████████████████████████████████████
████888████888██"Y8888██888█888██"Y88P"█████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████888888b.██████████████████████████████888████d8b██.d888██████████888████
████888██"88b█████████████████████████████888████Y8P█d88P"███████████888████
████888██.88P█████████████████████████████888████████888█████████████888████
████8888888K.███.d88b.███8888b.██888██888█888888█888█888888█888██888█888████
████888██"Y88b█d8P██Y8b█████"88b█888██888█888████888█888████888██888█888████
████888████888█88888888█.d888888█888██888█888████888█888████888██888█888████
████888███d88P█Y8b.█████888██888█Y88b█888█Y88b.██888█888████Y88b█888█888████
████8888888P"███"Y8888██"Y888888██"Y88888██"Y888█888█888█████"Y88888█888████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████888b████888███████████████████████888██888██████████████████████████████
████8888b███888███████████████████████888██888██████████████████████████████
████88888b██888███████████████████████888██888██████████████████████████████
████888Y88b█888██.d88b.██888d888██.d88888██888██████████████████████████████
████888█Y88b888█d8P██Y8b█888P"███d88"█888██888██████████████████████████████
████888██Y88888█88888888█888█████888██888██Y8P██████████████████████████████
████888███Y8888█Y8b.█████888█████Y88b█888███████████████████████████████████
████888████Y888██"Y8888██888██████"Y88888██888██████████████████████████████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████(...and robots)█████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████
████																   █████
████	Welcome to my corner of the internet!						   █████
████																   █████
████	Here's what you might be looking for: 				   		   █████
████	/foobar/source-code											   █████
████																   █████
████																   █████
████	psst. you might wanna check the console ;)					   █████
████																   █████
████	GLHF!														   █████
████																   █████
████████████████████████████████████████████████████████████████████████████
████████████████████████████████████████████████████████████████████████████


-->
`;
