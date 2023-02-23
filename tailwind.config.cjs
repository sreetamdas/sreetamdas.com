// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		fontFamily: {
			sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
			serif: ["var(--font-made-mellow)", ...defaultTheme.fontFamily.serif],
			mono: ["var(--font-iosevka)", ...defaultTheme.fontFamily.mono],
		},
		extend: {
			colors: {
				primary: "rgb(var(--color-primary))",
				secondary: "rgb(var(--color-secondary))",
				foreground: "rgb(var(--color-foreground))",
				background: "rgb(var(--color-background))",
			},
			borderRadius: {
				global: "var(--border-radius)",
			},
		},
	},
	darkMode: ["class", '[data-color-scheme="dark"]'],
	plugins: [],
};
