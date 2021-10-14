import { useEffect } from "react";
import { loadTheme, getHighlighter } from "shiki";
import { IRawThemeSetting } from "vscode-textmate";

export enum FontStyle {
	NotSet = -1,
	None = 0,
	Italic = 1,
	Bold = 2,
	Underline = 4,
}
export interface IThemedTokenScopeExplanation {
	scopeName: string;
	themeMatches: IRawThemeSetting[];
}

export interface IThemedTokenExplanation {
	content: string;
	scopes: IThemedTokenScopeExplanation[];
}

/**
 * A single token with color, and optionally with explanation.
 */
export interface IThemedToken {
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
export interface HtmlRendererOptions {
	langId?: string;
	fg?: string;
	bg?: string;
}

export function renderToHtml(lines: IThemedToken[][], options: HtmlRendererOptions = {}) {
	const bg = options.bg || "#0a0e14";

	let html = "";

	html += `<pre class="shiki" style="background-color: ${bg}">`;
	if (options.langId) {
		html += `<div class="language-id">${options.langId}</div>`;
	}
	html += "<code>";

	lines.forEach((l: IThemedToken[]) => {
		// eslint-disable-next-line quotes
		html += '<span class="line">';

		l.forEach((token) => {
			const cssDeclarations = [`color: ${token.color || options.fg}`];

			if (token.fontStyle ?? 0 & FontStyle.Italic) {
				cssDeclarations.push("font-style: italic");
			}
			if (token.fontStyle ?? 0 & FontStyle.Bold) {
				cssDeclarations.push("font-weight: bold");
			}
			if (token.fontStyle ?? 0 & FontStyle.Underline) {
				cssDeclarations.push("text-decoration: underline");
			}
			html += `<span style="${cssDeclarations.join("; ")}">${escapeHtml(token.content)}</span>`;
		});
		html += "</span>\n";
	});
	html = html.replace(/\n*$/, ""); // Get rid of final new lines
	html += "</code></pre>";

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

type TShikiProps = {
	tokens: IThemedToken[][];
	asString: string;
};
const ShikiExample = ({ tokens, asString }: TShikiProps) => {
	useEffect(() => {
		// eslint-disable-next-line no-console
		console.log({ tokens, asString });
	}, [asString, tokens]);

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
	const tokens = highlighter.codeToThemedTokens(CODE_SNIPPET, "js");
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

const CODE_SNIPPET = `export const getBlogPostsData = async () => {
  // path where the MDX files are
  const DIR = path.join(process.cwd(), "src", "content", "blog");
  const files = fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith(".mdx"));

  const META = /export\\s+const\\s+meta\\s+=\\s+(\\{(\\n|.)*?\\n\\})/;
  const postsData = files.map((file) => {
    // grab the metadata
    const name = path.join(DIR, file);
    const contents = fs.readFileSync(name, "utf8");
    const match = META.exec(contents);
    if (!match || typeof match[1] !== "string")
      throw new Error(\`\${name} needs to export const meta = {}\`);
    const meta = eval("(" + match[1] + ")");

    // remove the ".mdx" from the filename
    const slug = file.replace(/\\.mdx?$/, "");

    return {
      ...meta,
      slug,
    };
  });

  return postsData;
};`;
