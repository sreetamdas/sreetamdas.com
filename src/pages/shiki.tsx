import type { CSSProperties } from "react";
import { loadTheme, getHighlighter } from "shiki";
import { IRawThemeSetting } from "vscode-textmate";

import { CodePreBlockWithHighlight } from "components/mdx/code";

enum FontStyle {
	NotSet = -1,
	None = 0,
	Italic = 1,
	Bold = 2,
	Underline = 4,
}
interface IThemedTokenScopeExplanation {
	scopeName: string;
	themeMatches: IRawThemeSetting[];
}

interface IThemedTokenExplanation {
	content: string;
	scopes: IThemedTokenScopeExplanation[];
}

/**
 * A single token with color, and optionally with explanation.
 */
interface IThemedToken {
	/**
	 * The content of the token
	 */
	content: string;
	/**
	 * 6 or 8 digit hex code representation of the token's color
	 */
	color?: string;
	/**
	 * Font style of token. Can be None/Italic/Bold/Underline
	 */
	fontStyle?: FontStyle;
	/**
	 * Explanation of
	 *
	 * - token text's matching scopes
	 * - reason that token text is given a color (one matching scope matches a rule (scope -> color) in the theme)
	 */
	explanation?: IThemedTokenExplanation[];
}

interface HtmlRendererOptions {
	langId?: string;
	fg?: string;
	bg?: string;
}

function getTokenStyles(token: IThemedToken, options?: HtmlRendererOptions): CSSProperties {
	return {
		color: token.color || options?.fg,
		fontStyle: token.fontStyle === FontStyle.Italic ? "italic" : undefined,
		fontWeight: token.fontStyle === FontStyle.Bold ? "bold" : undefined,
		textDecoration: token.fontStyle === FontStyle.Underline ? "underline" : undefined,
	};
}

function renderTokens(lines: IThemedToken[][], options?: HtmlRendererOptions) {
	const bgColor = options?.bg ?? "#0a0e14";

	return (
		<CodePreBlockWithHighlight className="shiki" style={{ backgroundColor: bgColor }}>
			{lines.map((line) => (
				<div className="line" key={line.join("")}>
					{line.map((token) => (
						<span key={token.content} style={{ ...getTokenStyles(token, options) }}>
							{/* replace tabs with space */}
							{token.content.replace(/\t/g, "  ")}
						</span>
					))}
				</div>
			))}
		</CodePreBlockWithHighlight>
	);
}

type TShikiProps = {
	tokens: IThemedToken[][];
};
const ShikiExample = ({ tokens }: TShikiProps) => {
	return (
		<div>
			Shiki example
			{renderTokens(tokens)}
		</div>
	);
};

export default ShikiExample;

export async function getStaticProps() {
	const theme = await loadTheme("../@sreetamdas/karma/themes/Karma-color-theme.json");
	const highlighter = await getHighlighter({ theme });
	const tokens = highlighter.codeToThemedTokens(CODE_SNIPPET, "tsx");

	return {
		props: { tokens },
	};
}

const CODE_SNIPPET = `
export const useRandomInterval = (
	callback: () => void,
	minDelay: null | number,
	maxDelay: null | number
) => {
	const timeoutId = useRef<number | undefined>();
	const savedCallback = useRef(callback);
	useEffect(() => {
		savedCallback.current = callback;
	});
	useEffect(() => {
		if (typeof minDelay === "number" && typeof maxDelay === "number") {
			const handleTick = () => {
				const nextTickAt = random(minDelay, maxDelay);
				timeoutId.current = window.setTimeout(() => {
					savedCallback.current();
					handleTick();
				}, nextTickAt);
			};
			handleTick();
		}

		return () => window.clearTimeout(timeoutId.current);
	}, [minDelay, maxDelay]);
	const cancel = useCallback(function () {
		window.clearTimeout(timeoutId.current);
	}, []);
	return cancel;
};
`;
