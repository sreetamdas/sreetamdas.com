import { defaultTheme } from "@sreetamdas/karma";
import {
	type BundledLanguage,
	createJavaScriptRegexEngine,
	getSingletonHighlighterCore,
	type HighlighterGeneric,
	normalizeTheme,
	type ThemeRegistration,
} from "shiki";

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
function convertToThemeRegistration(theme: typeof defaultTheme): ThemeRegistration {
	return {
		name: theme.name.toLowerCase(),
		displayName: theme.name,
		semanticHighlighting: theme.semanticHighlighting,
		// @ts-expect-error possibly wrong type
		semanticTokenColors: theme.semanticTokenColors,
		colors: theme.colors,
		type: theme.type as "light" | "dark",
		tokenColors: theme.tokenColors as Array<{
			scope: Array<string>;
			settings: { fontStyle: string; foreground?: string; background?: string };
		}>,
	};
}

export type KarmaHighlighter = HighlighterGeneric<BundledLangs, "karma">;
export async function getSlimKarmaHighlighter(): Promise<KarmaHighlighter> {
	const karma_shiki_theme = convertToThemeRegistration(defaultTheme);
	const theme = normalizeTheme(karma_shiki_theme);

	const highlighter = (await getSingletonHighlighterCore({
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
	})) as KarmaHighlighter;

	return highlighter;
}
