import karmaThemeJSON from "@sreetamdas/karma/themes/Karma-color-theme.json";
import {
	toShikiTheme,
	getHighlighter,
	setWasm,
	setCDN,
	Highlighter,
	Lang,
	IShikiTheme,
} from "shiki";

const preloadedLangs: Array<Lang> = ["js", "jsx", "ts", "tsx", "elixir"];

export async function getKarmaHighlighter(): Promise<Highlighter> {
	setWasm("/shiki/dist/onigasm.wasm");
	setCDN("/shiki/");

	const theme = toShikiTheme(karmaThemeJSON as unknown as IShikiTheme);
	const highlighter = await getHighlighter({ theme, langs: preloadedLangs });

	return highlighter;
}
