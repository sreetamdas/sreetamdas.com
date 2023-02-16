"use client";

import { useEffect } from "react";
import { FiSun, FiMonitor } from "react-icons/fi";
import { IoMdMoon } from "react-icons/io";

import { ColorSchemeSliceType } from "./store";

import { useBoundStore } from "@/lib/domains/global";

function getDocumentColorScheme() {
	const documentColorScheme = window.document.documentElement.style.getPropertyValue(
		"--initial-color-scheme"
	) as NonNullable<ColorSchemeSliceType["colorScheme"]> | "";

	return documentColorScheme;
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

enum COLOR_SCHEME {
	system,
	light,
	dark,
}
type COLOR_SCHEMES = keyof typeof COLOR_SCHEME;
function* colorSchemeGenerator(): Generator<COLOR_SCHEMES, never, COLOR_SCHEMES | undefined> {
	let current = COLOR_SCHEME.system;

	while (true) {
		const override: COLOR_SCHEMES | undefined = yield COLOR_SCHEME[current] as COLOR_SCHEMES;

		current = (current + 1) % 3;
		if (override) {
			current = COLOR_SCHEME[override];
		}
	}
}

const colorSchemeIterator = colorSchemeGenerator();
export const ColorSchemeToggle = () => {
	const { colorScheme, setColorScheme } = useBoundStore((state) => ({
		colorScheme: state.colorScheme,
		setColorScheme: state.setColorScheme,
	}));

	function handleColorSchemeToggle(
		override?: Exclude<ReturnType<typeof getDocumentColorScheme>, "">
	) {
		const { value } = colorSchemeIterator.next(override);

		setColorScheme(value);
		window.localStorage.setItem("color-scheme", value);
	}

	function handleSystemColorSchemePreference(isColorSchemeDark?: boolean) {
		const preference =
			isColorSchemeDark === undefined
				? getSystemColorSchemePreference()
				: isColorSchemeDark === true
				? "dark"
				: "light";

		switch (preference) {
			case "dark":
				document.documentElement.setAttribute("data-color-scheme", "dark");
				break;

			case "light":
			default:
				document.documentElement.removeAttribute("data-color-scheme");
				break;
		}
	}

	useEffect(() => {
		const documentColorScheme = getDocumentColorScheme();

		if (documentColorScheme === "") {
			handleColorSchemeToggle("system");
		} else {
			handleColorSchemeToggle(documentColorScheme);
		}

		const colorSchemeDarkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		function colorSchemeChangeListener() {
			handleSystemColorSchemePreference(colorSchemeDarkMediaQuery.matches);
		}

		colorSchemeDarkMediaQuery.addEventListener("change", colorSchemeChangeListener);

		return () => colorSchemeDarkMediaQuery.removeEventListener("change", colorSchemeChangeListener);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		switch (colorScheme) {
			case "system":
				handleSystemColorSchemePreference();
				break;
			case "dark":
				document.documentElement.setAttribute("data-color-scheme", "dark");
				break;
			case "light":
			default:
				document.documentElement.removeAttribute("data-color-scheme");
				break;
		}
	}, [colorScheme]);

	return (
		<button
			onClick={() => handleColorSchemeToggle()}
			className="link-base flex h-6 w-6 items-center text-2xl text-foreground hover:text-primary"
		>
			<ToggleIcon colorScheme={colorScheme} />
		</button>
	);
};

const ToggleIcon = ({ colorScheme }: Pick<ColorSchemeSliceType, "colorScheme">) => {
	switch (colorScheme) {
		case "light":
			return <FiSun aria-label="Currently Dark Mode" title="Currently Dark mode" />;
		case "dark":
			return <IoMdMoon aria-label="Currently Light Mode" title="Currently Light mode" />;
		case "system":
			return (
				<FiMonitor
					aria-label="Currently using System preference"
					title="Currently using System preference"
				/>
			);
		default:
			return <span className="inline-block" />;
	}
};
