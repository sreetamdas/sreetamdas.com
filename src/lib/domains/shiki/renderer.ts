import { isNull } from "lodash-es";
import { type HtmlRendererOptions, type IThemedToken, FontStyle } from "shiki";

const defaultElements: NonNullable<HtmlRendererOptions["elements"]> = {
	pre({ className, style, children, props }) {
		return `<pre class="${className}" style="${style}" ${props}>${children}</pre>`;
	},

	code({ children }) {
		return `<code>${children}</code>`;
	},

	line({ className, children }) {
		return `<span class="${className}">${children}</span>`;
	},

	token({ style, children }) {
		return `<span style="${style}">${children}</span>`;
	},
};

export function renderToHtml(
	lines: IThemedToken[][],
	options: HtmlRendererOptions = {},
	meta: string | null
) {
	const bg = options.bg || "#fff";
	// const optionsByLineNumber = groupBy(options.lineOptions ?? [], (option) => option.line);
	const userElements = options.elements || {};

	function h(type = "", props = {}, children: string[]): string {
		// @ts-expect-error shut up
		const element = userElements[type] || defaultElements[type];
		if (element) {
			// eslint-disable-next-line no-param-reassign
			children = children.filter(Boolean);

			return element({
				...props,
				children: type === "code" ? children.join("\n") : children.join(""),
			});
		}

		return "";
	}

	const extraProps = `${!isNull(meta) ? meta + " " : ""}${
		options.langId ? `language="${options.langId}"` : ""
	}`;

	return h(
		"pre",
		{
			className: "shiki " + (options.themeName || ""),
			style: `background-color: ${bg}`,
			props: extraProps,
		},
		[
			h(
				"code",
				{},
				lines.map((line, index) =>
					h(
						"line",
						{ className: "line", lines, line, index },
						line.map((token, index) => {
							const cssDeclarations = [`color: ${token.color || options.fg}`];
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							if (token.fontStyle! & FontStyle.Italic) {
								cssDeclarations.push("font-style: italic");
							}
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							if (token.fontStyle! & FontStyle.Bold) {
								cssDeclarations.push("font-weight: bold");
							}
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							if (token.fontStyle! & FontStyle.Underline) {
								cssDeclarations.push("text-decoration: underline");
							}

							return h("token", { style: cssDeclarations.join("; "), tokens: line, token, index }, [
								escapeHtml(token.content),
							]);
						})
					)
				)
			),
		]
	);
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
