import type { ColorSchemeSliceType } from "@/lib/domains/colorScheme/store";

function setInitialColorScheme() {
	function getInitialColorScheme(): NonNullable<ColorSchemeSliceType["colorScheme"]> {
		const persistedColorScheme = window.localStorage.getItem("color-scheme") as NonNullable<
			ColorSchemeSliceType["colorScheme"]
		>;
		const hasPersistedColorScheme = typeof persistedColorScheme === "string";

		/**
		 * If the user has explicitly chosen light or dark, use it
		 */
		if (hasPersistedColorScheme) {
			const root = window.document.documentElement;
			root.style.setProperty("--initial-color-scheme", persistedColorScheme);

			if (persistedColorScheme !== "system") {
				return persistedColorScheme;
			}
		}

		/**
		 * If they haven't been explicit, check the media query
		 */
		const mql = window.matchMedia("(prefers-color-scheme: dark)");
		const hasSystemColorSchemePreference = typeof mql.matches === "boolean";

		if (hasSystemColorSchemePreference) {
			return mql.matches ? "dark" : "light";
		}

		/**
		 * If they are using a browser/OS that doesn't support
		 * color themes, default to 'light'.
		 */
		return "light";
	}

	const colorScheme = getInitialColorScheme();
	if (colorScheme === "dark") document.documentElement.setAttribute("data-color-scheme", "dark");
}

export const blockingScriptSetInitialColorScheme = `(function() {
	${setInitialColorScheme.toString()}
	setInitialColorScheme();
})()

// IIFE!
`;
