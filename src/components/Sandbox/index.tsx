import {
	SandpackProvider,
	SandpackLayout,
	SandpackCodeEditor,
	SandpackPreview,
	SandpackProps,
	SandpackThemeProp,
} from "@codesandbox/sandpack-react";

import { Wrapper } from "./styles";

type SandboxProps = SandpackProps & {
	bleed?: boolean;
};

const KARMA_SANDPACK_THEME: SandpackThemeProp = {
	palette: {
		activeText: "#f7f1ff",
		defaultText: "#696969",
		inactiveText: "#444344",
		activeBackground: "#444344",
		defaultBackground: "#0a0e14",
		inputBackground: "rgb(25, 24, 26)",
		accent: "#e3cf65",
		errorBackground: "#ffcdca",
		errorForeground: "#811e18",
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
	typography: {
		bodyFont:
			// eslint-disable-next-line quotes
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
		// eslint-disable-next-line quotes
		monoFont: 'Iosevka, "Iosevka Web", consolas',
		fontSize: "16px",
		lineHeight: "1.5",
	},
};

export const Sandbox = ({
	theme = KARMA_SANDPACK_THEME,
	files,
	customSetup,
	bleed = true,
	...props
}: SandboxProps) => (
	<SandpackProvider {...props} customSetup={{ ...customSetup, files }}>
		<Wrapper $bleed={bleed}>
			<SandpackLayout {...{ theme }}>
				<SandpackCodeEditor />
				<SandpackPreview />
			</SandpackLayout>
		</Wrapper>
	</SandpackProvider>
);
