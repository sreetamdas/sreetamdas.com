import { defaultTheme } from "@sreetamdas/karma";
import {
	type BundledLanguage,
	type ThemeRegistration,
	type Highlighter,
	toShikiTheme,
	getHighlighter,
} from "shikiji";

export const preloaded_langs: Array<BundledLanguage> = [
	"javascript",
	"jsx",
	"typescript",
	"tsx",
	"json",
	"mdx",
	"markdown",
	"css",
	"shellscript",
	"elixir",
];

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

export async function getKarmaHighlighter(): Promise<Highlighter> {
	const karma_shiki_theme = convertToThemeRegistration(defaultTheme);
	const theme = toShikiTheme(karma_shiki_theme);
	const highlighter = await getHighlighter({ langs: preloaded_langs, themes: [theme] });

	return highlighter;
}

export async function getKarmaTheme(): Promise<ThemeRegistration> {
	const theme = toShikiTheme(defaultTheme as unknown as ThemeRegistration);
	return theme;
}
