import { defaultTheme } from "@sreetamdas/karma";
import {
	type BundledLanguage,
	getSingletonHighlighterCore,
	type HighlighterGeneric,
	normalizeTheme,
	type ThemeRegistration,
} from "shiki";
import css from "shiki/langs/css.mjs";
import elixir from "shiki/langs/elixir.mjs";
import html from "shiki/langs/html.mjs";
import json from "shiki/langs/json.mjs";
import markdown from "shiki/langs/markdown.mjs";
import shell from "shiki/langs/shell.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import getWasm from "shiki/wasm";

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
		langs: [typescript, tsx, json, markdown, html, css, shell, elixir],
		themes: [theme],
		loadWasm: getWasm,
	})) as KarmaHighlighter;

	return highlighter;
}
