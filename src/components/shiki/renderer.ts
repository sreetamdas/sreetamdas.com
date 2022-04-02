import type { IRawThemeSetting } from "vscode-textmate";

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

export function renderToHTML(
	lines: IThemedToken[][],
	options: HtmlRendererOptions = {},
	meta?: string
) {
	const bg = options.bg || "#fff";

	let html = "";

	html += `<pre class="shiki" style="background-color: ${bg}" ${meta ? meta : ""} ${
		options.langId ? `language="${options.langId}"` : ""
	}>`;

	lines.forEach((l: IThemedToken[]) => {
		// eslint-disable-next-line quotes
		html += '<span class="line">';

		l.forEach((token) => {
			const cssDeclarations = [`color: ${token.color || options.fg}`];
			if (token.fontStyle ?? 0 & FontStyle.Italic) {
				cssDeclarations.push("font-style: italic");
			}
			html += `<span style="${cssDeclarations.join("; ")}">${escapeHtml(token.content)}</span>`;
		});
		html += "</span>\n";
	});
	html = html.replace(/\n*$/, ""); // Get rid of final new lines
	html += "</pre>";

	return html;
}

const htmlEscapes = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	// eslint-disable-next-line quotes
	'"': "&quot;",
	"'": "&#39;",
} as const;

function escapeHtml(html: string) {
	return html.replace(/[&<>"']/g, (chr) => htmlEscapes[chr as keyof typeof htmlEscapes]);
}
