"use client";

import { useEffect } from "react";
import { IoMdMoon } from "react-icons/io";
import { LuMonitor, LuSun } from "react-icons/lu";
import { useShallow } from "zustand/react/shallow";

import { useGlobalStore } from "@/lib/domains/global";

import { type ColorSchemeSliceType } from "./store";

type ColorScheme = NonNullable<ColorSchemeSliceType["colorScheme"]>;
const COLOR_SCHEME_ORDER = ["system", "light", "dark"] satisfies Array<ColorScheme>;

export function parseColorScheme(value: string): ColorScheme | "" {
	if (value === "system" || value === "light" || value === "dark") return value;
	return "";
}

function getDocumentColorScheme() {
	const raw = window.document.documentElement.style.getPropertyValue("--initial-color-scheme");
	return parseColorScheme(raw);
}

function getSystemColorSchemePreference(): Extract<
	ColorSchemeSliceType["colorScheme"],
	"light" | "dark"
> {
	const mql = window.matchMedia("(prefers-color-scheme: dark)");
	const hasSystemColorSchemePreference = typeof mql.matches === "boolean";

	if (hasSystemColorSchemePreference) {
		return mql.matches ? "dark" : "light";
	}
	return "light";
}

export function getNextColorScheme(current: ColorScheme | undefined): ColorScheme {
	const currentIndex = COLOR_SCHEME_ORDER.findIndex((scheme) => scheme === current);
	if (currentIndex === -1) {
		return "system";
	}

	return COLOR_SCHEME_ORDER[(currentIndex + 1) % COLOR_SCHEME_ORDER.length];
}

export function applyDocumentColorScheme(preference: Extract<ColorScheme, "light" | "dark">) {
	switch (preference) {
		case "dark":
			document.documentElement.setAttribute("data-color-scheme", "dark");
			break;

		default: // "light"
			document.documentElement.removeAttribute("data-color-scheme");
			break;
	}
}

export const ColorSchemeSync = () => {
	const { colorScheme, setColorScheme } = useGlobalStore(
		useShallow((state) => ({
			colorScheme: state.colorScheme,
			setColorScheme: state.setColorScheme,
		})),
	);

	function handleSystemColorSchemePreference(isColorSchemeDark?: boolean) {
		const preference =
			isColorSchemeDark === undefined
				? getSystemColorSchemePreference()
				: isColorSchemeDark === true
					? "dark"
					: "light";

		applyDocumentColorScheme(preference);
	}

	useEffect(() => {
		const documentColorScheme = getDocumentColorScheme();

		if (documentColorScheme === "") {
			setColorScheme("system");
		} else {
			setColorScheme(documentColorScheme);
		}
	}, []);

	useEffect(() => {
		if (colorScheme === undefined) {
			return undefined;
		}

		window.localStorage.setItem("color-scheme", colorScheme);

		switch (colorScheme) {
			case "system": {
				handleSystemColorSchemePreference();
				const colorSchemeDarkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
				function colorSchemeChangeListener() {
					handleSystemColorSchemePreference(colorSchemeDarkMediaQuery.matches);
				}

				colorSchemeDarkMediaQuery.addEventListener("change", colorSchemeChangeListener);

				return () =>
					colorSchemeDarkMediaQuery.removeEventListener("change", colorSchemeChangeListener);
			}
			case "dark":
				applyDocumentColorScheme("dark");
				break;

			default: // "light"
				applyDocumentColorScheme("light");
				break;
		}

		return undefined;
	}, [colorScheme]);

	return null;
};

export const ColorSchemeToggle = () => {
	const { colorScheme, setColorScheme } = useGlobalStore(
		useShallow((state) => ({
			colorScheme: state.colorScheme,
			setColorScheme: state.setColorScheme,
		})),
	);

	function handleColorSchemeToggle() {
		setColorScheme(getNextColorScheme(colorScheme));
	}

	return (
		<button
			onClick={() => handleColorSchemeToggle()}
			className="link-base text-foreground hover:text-primary flex h-6 w-6 items-center text-2xl"
			type="button"
		>
			<ToggleIcon colorScheme={colorScheme} />
		</button>
	);
};

const ToggleIcon = ({ colorScheme }: Pick<ColorSchemeSliceType, "colorScheme">) => {
	switch (colorScheme) {
		case "light":
			return <LuSun aria-label="Currently using dark mode" title="Currently using dark mode" />;
		case "dark":
			return (
				<IoMdMoon aria-label="Currently using light mode" title="Currently using light mode" />
			);
		case "system":
			return (
				<LuMonitor
					aria-label="Currently using system preference"
					title="Currently using system preference"
				/>
			);
		default:
			return <span className="inline-block" />;
	}
};
