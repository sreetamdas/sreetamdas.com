import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

export default {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		fontFamily: {
			sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
			serif: ["var(--font-eb-garamond)", ...defaultTheme.fontFamily.serif],
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
			keyframes: {
				"grow-shrink": {
					"0%, 100%": { transform: "scale(0)" },
					"50%": { transform: "scale(1)" },
				},
				overlayShow: {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				contentShow: {
					from: { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
					to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
				},
			},
			animation: {
				overlayShow: "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
				contentShow: "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
			},
		},
	},
	darkMode: ["selector", '[data-color-scheme="dark"]'],
	plugins: [
		plugin(function ({ addVariant }) {
			addVariant("children", "&>*");
		}),
	],
} satisfies Config;
