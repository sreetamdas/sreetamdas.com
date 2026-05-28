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

export function getNextColorScheme(current: ColorScheme | undefined): ColorScheme {
	const currentIndex = COLOR_SCHEME_ORDER.findIndex((scheme) => scheme === current);
	if (currentIndex === -1) {
		return "system";
	}

	return COLOR_SCHEME_ORDER[(currentIndex + 1) % COLOR_SCHEME_ORDER.length];
}

export const ColorSchemeToggle = () => {
	const { colorScheme, setColorScheme } = useGlobalStore(
		useShallow((state) => ({
			colorScheme: state.colorScheme,
			setColorScheme: state.setColorScheme,
		})),
	);

	function applyColorScheme(colorSchemePreference: ColorScheme) {
		window.localStorage.setItem("color-scheme", colorSchemePreference);

		if (colorSchemePreference === "system") {
			document.documentElement.removeAttribute("data-color-scheme");
		} else {
			document.documentElement.setAttribute("data-color-scheme", colorSchemePreference);
		}
	}

	function handleColorSchemeToggle() {
		const nextColorScheme = getNextColorScheme(colorScheme);

		setColorScheme(nextColorScheme);
		applyColorScheme(nextColorScheme);
	}

	useEffect(() => {
		const documentColorScheme = getDocumentColorScheme();

		if (documentColorScheme === "") {
			setColorScheme("system");
		} else {
			setColorScheme(documentColorScheme);
		}
	}, []);

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
