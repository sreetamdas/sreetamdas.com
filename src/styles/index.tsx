import { createGlobalStyle, css } from "styled-components";

import { sharedTransition } from "@/styles/components";
import { interFont, iosevkaFont } from "@/styles/fonts";
import { BASE_FONT_SIZE, focusVisible } from "@/utils/style";

export const theme = {
	light: {
		foreground: "rgb(0, 0, 0)",
		background: "rgb(255, 255, 255)",
		accentPrimaryValues: "91, 52, 218",
		accentPrimary: "rgb(91, 52, 218)",
		accentSecondary: "rgb(53, 142, 241)",
		accentSecondaryValues: "53, 142, 241",
		backgroundBlurred: "rgba(255, 255, 255, 0.93)",
		inlineCodeBackground: "rgb(220, 220, 220)",
	},
	dark: {
		foreground: "rgb(255, 255, 255)",
		background: "rgb(0, 0, 0)",
		accentPrimaryValues: "157, 134, 233",
		accentPrimary: "rgb(157, 134, 233)",
		accentSecondary: "rgb(97, 218, 251)",
		accentSecondaryValues: "97, 218, 251",
		backgroundBlurred: "rgba(15, 10, 35, 0.9)",
		inlineCodeBackground: "rgb(51, 51, 51)",
	},
};

export const GlobalStyles = createGlobalStyle`
	:root {
	--color-primary: ${theme.light.foreground};
	--color-background: ${theme.light.background};
	--values-primary-accent: ${theme.light.accentPrimaryValues};
	--color-primary-accent: ${theme.light.accentPrimary};
	--color-secondary-accent: ${theme.light.accentSecondary};
	--values-secondary-accent: ${theme.light.accentSecondaryValues};
	--color-bg-blurred: ${theme.light.backgroundBlurred};
	--color-inlineCode-bg: ${theme.light.inlineCodeBackground};
	
	--color-inlineCode-fg: var(--color-primary);
	--color-codeBlock-bg: #0a0e14;
	--color-fancy-pants: var(--color-primary-accent);
	
	--font-family-code: ${iosevkaFont.style.fontFamily}, Consolas, Roboto Mono, Menlo, Monaco,
	Liberation Mono, Lucida Console, monospace;
	--color-success-accent: rgb(0, 255, 127);
	--color-success-accent-faded: rgba(0, 255, 127, 0.19);
	--color-danger-accent: rgb(255, 128, 0);
	--color-danger-accent-faded: rgba(255, 128, 0, 0.2);
	--color-info-accent: rgb(0, 191, 255);
	--color-info-accent-faded: rgba(0, 191, 255, 0.27);
	--color-error: rgb(255, 0, 0);
	
	--max-width: 650px;
	--border-radius: 5px;
	--transition-duration: 0.1s;
	--list-item-spacing: 12px;
	}
	
	[data-theme="dark"] {
		--color-primary: ${theme.dark.foreground};
		--color-background: ${theme.dark.background};
		--values-primary-accent: ${theme.dark.accentPrimaryValues};
		--color-primary-accent: ${theme.dark.accentPrimary};
		--color-secondary-accent: ${theme.dark.accentSecondary};
		--values-secondary-accent: ${theme.dark.accentSecondaryValues};
		--color-inlineCode-bg: ${theme.dark.inlineCodeBackground};
		--color-bg-blurred: ${theme.dark.backgroundBlurred};
	}
	[data-theme="batman"] {
		--color-primary-accent: rgb(255, 255, 0);
		--values-primary-accent: 255, 255, 0;
		--color-secondary-accent: rgb(97, 218, 251);
		--values-secondary-accent: 97, 218, 251;
		--color-primary: rgb(255, 255, 255);
		--color-background: rgb(0, 0, 0);
		--color-inlineCode-bg: rgb(34, 34, 34);
	}

	html,
	body {
		font-size: ${BASE_FONT_SIZE}px;
		font-family: -apple-system, BlinkMacSystemFont, ${interFont.style.fontFamily}, Roboto, Segoe UI,
			Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
			sans-serif;
		color: var(--color-primary);
		background-color: var(--color-background);
		margin: 0;
		line-height: 1.5;
		min-height: 100vh;
		scroll-padding-top: 60px;
		scroll-behavior: smooth;
	}

	*, *:before, *:after {
		box-sizing: border-box;
	}

	:not(pre):not(span)::selection {
		background: rgba(var(--values-secondary-accent), 0.99);
		color: var(--color-background)
	}

	h1,
	h2,
	h3,
	h4 {
		margin: 0;
		padding-top: 2rem;
	}

	h1 {
		font-size: 2.5rem;
	}
	h2 {
		font-size: 2rem;
	}
	h3 {
		font-size: 1.5rem;
	}

	a {
		text-decoration: none;
		color: var(--color-primary-accent);
		cursor: pointer;

		:visited {
			text-decoration: none;
		}
		:hover {
			text-decoration-color: currentColor;
			text-decoration-line: underline;
			text-decoration-style: solid;
			text-decoration-thickness: 2px;
		}
	}

	a,
	button {
		${focusVisible(css`
			outline: 2px dashed var(--color-secondary-accent) !important;
			outline-offset: 2px;
		`)}
	}

	code,
	pre {
		font-family: var(--font-family-code);
	}

	pre:has(code) {
	background-color: var(--color-codeBlock-bg);

	}

	:not(pre) > code, pre {
		font-size: 0.85em;
	}

	:not(pre) > code {
		background-color: var(--color-inlineCode-bg);
		padding: 0.2em;
		border-radius: 3px;
		/* prevent our code block from being broken into different sections on linebreak
			https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break */
		box-decoration-break: clone;
		white-space: nowrap;

		${sharedTransition("color, background-color")}
	}
`;
