/**
 * Slim Shiki highlighter shared by MDX, slides, and RWC. Languages are
 * precompiled explicitly so build/runtime bundles only include the syntaxes the
 * site actually renders.
 */
import type { BundledLanguage, ThemeRegistration } from "shiki";

import { defaultTheme } from "@sreetamdas/karma";
import { createHighlighterCore, normalizeTheme } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export type BundledLangs = (typeof _preloaded_langs)[number];
const _preloaded_langs = [
	"typescript",
	"tsx",
	"json",
	"markdown",
	"html",
	"css",
	"shell",
	"elixir",
] satisfies Array<BundledLanguage>;
type TokenColorRule = {
	scope: Array<string>;
	settings: { fontStyle: string; foreground?: string; background?: string };
};

function toTokenColorRules(value: unknown): Array<TokenColorRule> {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.flatMap((entry) => {
		if (typeof entry !== "object" || entry === null) {
			return [];
		}

		if (!("scope" in entry) || !("settings" in entry)) {
			return [];
		}

		const scope = Array.isArray(entry.scope)
			? entry.scope.filter((part: unknown): part is string => typeof part === "string")
			: typeof entry.scope === "string"
				? [entry.scope]
				: [];

		if (scope.length === 0 || typeof entry.settings !== "object" || entry.settings === null) {
			return [];
		}

		const fontStyle =
			"fontStyle" in entry.settings && typeof entry.settings.fontStyle === "string"
				? entry.settings.fontStyle
				: "";
		const foreground =
			"foreground" in entry.settings && typeof entry.settings.foreground === "string"
				? entry.settings.foreground
				: undefined;
		const background =
			"background" in entry.settings && typeof entry.settings.background === "string"
				? entry.settings.background
				: undefined;

		return [{ scope, settings: { fontStyle, foreground, background } }];
	});
}

function convertToThemeRegistration(theme: typeof defaultTheme): ThemeRegistration {
	const themeType = theme.type === "dark" ? "dark" : ("light" as const);

	return {
		name: theme.name.toLowerCase(),
		displayName: theme.name,
		semanticHighlighting: theme.semanticHighlighting,
		// @ts-expect-error possibly wrong type
		semanticTokenColors: theme.semanticTokenColors,
		colors: theme.colors,
		type: themeType,
		tokenColors: toTokenColorRules(theme.tokenColors),
	};
}

const karma_shiki_theme = convertToThemeRegistration(defaultTheme);
const theme = normalizeTheme(karma_shiki_theme);
const karmaHighlighter = createHighlighterCore({
	langs: [
		import("@shikijs/langs-precompiled/css"),
		import("@shikijs/langs-precompiled/elixir"),
		import("@shikijs/langs-precompiled/html"),
		import("@shikijs/langs-precompiled/json"),
		import("@shikijs/langs-precompiled/markdown"),
		import("@shikijs/langs-precompiled/shell"),
		import("@shikijs/langs-precompiled/tsx"),
		import("@shikijs/langs-precompiled/typescript"),
	],
	themes: [theme],
	engine: createJavaScriptRegexEngine(),
});

export type KarmaHighlighter = Awaited<typeof karmaHighlighter>;
export async function getSlimKarmaHighlighter(): Promise<KarmaHighlighter> {
	const highlighter = await karmaHighlighter;

	return highlighter;
}
