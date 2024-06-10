import { defaultTheme } from "@sreetamdas/karma";
import {
	type HighlighterGeneric,
	type BundledLanguage,
	type ThemeRegistration,
	normalizeTheme,
	getHighlighterCore,
	loadWasm,
} from "shiki";

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

type KarmaHighlighter = HighlighterGeneric<BundledLangs, "karma">;
export async function getSlimKarmaHighlighter(): Promise<KarmaHighlighter> {
	const karma_shiki_theme = convertToThemeRegistration(defaultTheme);
	const theme = normalizeTheme(karma_shiki_theme);

	// @ts-expect-error WASM
	await loadWasm(import("shiki/onig.wasm"));
	const highlighter = (await getHighlighterCore({
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
	})) as KarmaHighlighter;

	return highlighter;
}
