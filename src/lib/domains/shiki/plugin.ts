import { transformerColorizedBrackets } from "@shikijs/colorized-brackets";
import { defaultTheme } from "@sreetamdas/karma";
import { omit } from "lodash-es";
import { type BundledLanguage } from "shiki/langs";

import type { KarmaHighlighter } from "./highlighter";

const SUPPORTED_BUNDLED_LANGUAGES = [
	"typescript",
	"tsx",
	"json",
	"markdown",
	"html",
	"css",
	"shell",
	"elixir",
] satisfies Array<BundledLanguage>;

function isBundledLanguage(value: string): value is (typeof SUPPORTED_BUNDLED_LANGUAGES)[number] {
	return SUPPORTED_BUNDLED_LANGUAGES.some((lang) => lang === value);
}

export function renderCodeBlockToHtml(
	highlighter: KarmaHighlighter,
	code: string,
	lang: string | undefined,
	meta: string | null,
) {
	const language = lang ?? "plain";
	const safeLanguage = isBundledLanguage(language) ? language : "markdown";

	try {
		const lines_to_highlight = calculateLinesToHighlight(meta ?? "");
		const parsedMeta = parseMeta(meta);

		return highlighter.codeToHtml(code, {
			lang: safeLanguage,
			theme: "karma",
			transformers: [
				{
					code(ast) {
						ast.properties["data-language"] = language;
					},
					line(el, line) {
						if (Array.isArray(lines_to_highlight) && lines_to_highlight.includes(line)) {
							el.properties["data-highlight"] = "true";
						}
					},
				},
				transformerColorizedBrackets({
					themes: {
						karma: [
							defaultTheme.colors["editorBracketHighlight.foreground1"],
							defaultTheme.colors["editorBracketHighlight.foreground2"],
							defaultTheme.colors["editorBracketHighlight.foreground3"],
							defaultTheme.colors["editorBracketHighlight.unexpectedBracket.foreground"],
						],
					},
				}),
			],
			meta: parsedMeta ?? {},
		});
	} catch {
		return null;
	}
}

/**
 * pattern for highlighting lines in code blocks for future reference:
 * ```lang highlight="2,4-5"
 */
const RE_LINE_HIGHLIGHT = /([\d,-]+)/;
function calculateLinesToHighlight(meta = "") {
	const reg_exp_exec_array = RE_LINE_HIGHLIGHT.exec(meta);

	if (reg_exp_exec_array === null) {
		return false;
	}
	const lineNumbers = reg_exp_exec_array[1]
		.split(",")
		.map((v) => v.split("-").map((v) => Number.parseInt(v, 10)));

	return lineNumbers.reduce(
		(result, [start, end = start]) =>
			result.concat(Array.from({ length: end - start + 1 }, (_, i) => start + i)),
		[],
	);
}

const META_REGEX = /^([\w-]+)[=]?(?:"([^"]+)")?/;
/**
 * Parse meta string
 */
function parseMeta(meta: string | null) {
	if (meta === null) {
		return null;
	}
	let matches = meta.split(" ").reduce<Record<string, boolean | string>>((matchesObj, string) => {
		const match = string.match(META_REGEX);
		if (match === null) {
			return matchesObj;
		}

		return Object.assign(matchesObj, {
			[match[1]]: match[2] ?? "true",
		});
	}, {});

	matches = omit(matches, ["highlight"]);

	if (Object.keys(matches).length === 0) {
		return null;
	}

	return matches;
}
