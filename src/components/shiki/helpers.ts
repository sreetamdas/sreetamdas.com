import karmaThemeJSON from "@sreetamdas/karma/themes/Karma-color-theme.json";
import { toShikiTheme, getHighlighter } from "shiki";
import type { IRawTheme } from "vscode-textmate/release/theme";

export async function getKarmaHighlighter() {
	const theme = toShikiTheme(karmaThemeJSON as unknown as IRawTheme);
	const highlighter = await getHighlighter({ theme });

	return highlighter;
}
