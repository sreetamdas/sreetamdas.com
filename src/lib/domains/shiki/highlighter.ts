import { defaultTheme } from "@sreetamdas/karma";
import {
	type Highlighter,
	type Lang,
	type IShikiTheme,
	toShikiTheme,
	getHighlighter,
	setWasm,
	setCDN,
} from "shiki";

const preloadedLangs: Array<Lang> = [
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

export async function getKarmaHighlighter(): Promise<Highlighter> {
	setWasm("/shiki/dist/onigasm.wasm");
	setCDN("/shiki/");

	const theme = toShikiTheme(defaultTheme as unknown as IShikiTheme);
	const highlighter = await getHighlighter({ theme, langs: preloadedLangs });

	return highlighter;
}
