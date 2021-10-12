import { loadTheme, getHighlighter, renderToHtml } from "shiki";

const ShikiExample = ({ tokens, asString }) => {
	console.log({ tokens, asString });

	return (
		<div>
			Shiki example
			<div dangerouslySetInnerHTML={{ __html: renderToHtml(tokens) }} />
		</div>
	);
};

export default ShikiExample;

export async function getStaticProps() {
	// const themePath = require.resolve("@/@sreetamdas/karma/themes/Karma-color-theme.json");
	const theme = await loadTheme("../@sreetamdas/karma/themes/Karma-color-theme.json");
	const highlighter = await getHighlighter({ theme });
	const tokens = highlighter.codeToThemedTokens("console.log('shiki');", "ts");
	// return generateHTMLFromTokens(tokens);

	const asString = (
		await getHighlighter({
			theme: "dracula",
		})
	).codeToHtml("console.log('shiki');", "ts");

	return {
		props: { tokens, asString },
	};
}
