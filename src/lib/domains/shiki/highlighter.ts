import { defaultTheme } from "@sreetamdas/karma";
import {
	type BundledLanguage,
	type HighlighterGeneric,
	type ThemeRegistration,
	getSingletonHighlighterCore,
	normalizeTheme,
} from "shiki";
import getWasm from "shiki/wasm";

type BundledLangs = (typeof preloaded_langs)[number];
const preloaded_langs = [
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
			import("shiki/langs/typescript.mjs"),
			import("shiki/langs/tsx.mjs"),
			import("shiki/langs/json.mjs"),
			import("shiki/langs/markdown.mjs"),
			import("shiki/langs/html.mjs"),
			import("shiki/langs/css.mjs"),
			import("shiki/langs/shell.mjs"),
			import("shiki/langs/elixir.mjs"),
		],
		themes: [theme],
		loadWasm: getWasm,
	})) as KarmaHighlighter;

	return highlighter;
}
