import {
	SandpackThemeProp,
	Sandpack,
	SandpackProps,
	SandpackOptions,
} from "@codesandbox/sandpack-react";

import { Wrapper } from "./styles";

const KARMA_SANDPACK_THEME: SandpackThemeProp = {
	colors: {
		hover: "#f7f1ff",
		clickable: "#fff",
		surface2: "#444344",
		base: "#444344",
		surface1: "#0a0e14",
		surface3: "#19181a",
		accent: "#e3cf65",
		error: "#811e18",
		errorSurface: "#ffcdca",
	},
	syntax: {
		plain: "rgb(252, 252, 250)",
		comment: {
			color: "#696969",
			fontStyle: "italic",
		},
		keyword: "#fc618d",
		tag: "#51c7da",
		punctuation: "#88898f",
		definition: "#7bd88f",
		property: "#d7d7d7",
		static: "#af98e6",
		string: "#e3cf65",
	},
	font: {
		body: "Iosevka, 'Iosevka Web', consolas",
		mono: "Iosevka, 'Iosevka Web', consolas",
		size: "16px",
		lineHeight: "1.5",
	},
};

const defaultSandpackOptions: SandpackOptions = {};

interface SandboxProps extends SandpackProps {
	bleed?: boolean;
}

export const Sandbox = ({
	bleed = true,
	theme = KARMA_SANDPACK_THEME,
	files,
	customSetup,
	options,
	...props
}: SandboxProps) => (
	<Wrapper $bleed={bleed}>
		<Sandpack
			{...props}
			customSetup={customSetup}
			files={files}
			theme={theme}
			options={{ ...defaultSandpackOptions, ...options }}
		></Sandpack>
	</Wrapper>
);
