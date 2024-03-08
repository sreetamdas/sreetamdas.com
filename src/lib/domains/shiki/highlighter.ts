import { defaultTheme } from "@sreetamdas/karma";
import {
	type HighlighterGeneric,
	type BundledLanguage,
	type ThemeRegistration,
	getHighlighter,
	normalizeTheme,
} from "shiki";

export type BundledLangs = (typeof preloaded_langs)[number];
export const preloaded_langs = [
	"javascript",
	"jsx",
	"typescript",
	"tsx",
	"json",
	"mdx",
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
export async function getKarmaHighlighter(): Promise<KarmaHighlighter> {
	const karma_shiki_theme = convertToThemeRegistration(defaultTheme);
	const theme = normalizeTheme(karma_shiki_theme);
	const highlighter = (await getHighlighter({
		langs: preloaded_langs,
		themes: [theme],
	})) as unknown as KarmaHighlighter;

	return highlighter;
}

export async function getKarmaTheme(): Promise<ThemeRegistration> {
	const theme = normalizeTheme(defaultTheme as unknown as ThemeRegistration);
	return theme;
}
