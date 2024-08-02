import { type Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

export default {
	content: ["./src/**/*.{js,ts,jsx,tsx}", "./content/**/*.mdx"],
	theme: {
		fontFamily: {
			sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
			serif: ["var(--font-bricolage-grotesque)", ...defaultTheme.fontFamily.serif],
			mono: ["var(--font-iosevka)", ...defaultTheme.fontFamily.mono],
		},
		extend: {
			colors: {
				primary: "rgb(var(--color-primary))",
				secondary: "rgb(var(--color-secondary))",
				foreground: "rgb(var(--color-foreground))",
				background: "rgb(var(--color-background))",
				"karma-background": "rgb(var(--color-karma-background))",
			},
			borderRadius: {
				global: "var(--border-radius)",
			},
			transitionDuration: {
				global: "var(--transition-duration)",
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
		plugin(({ addVariant }) => {
			addVariant("children", "&>*");
		}),

		plugin(
			/**
			 * from tailwindcss-animate
			 * @see https://github.com/jamiebuilds/tailwindcss-animate
			 */
			({ addUtilities, matchUtilities, theme }) => {
				addUtilities({
					"@keyframes enter": theme("keyframes.enter"),
					"@keyframes exit": theme("keyframes.exit"),
					".animate-in": {
						animationName: "enter",
						"--tw-enter-opacity": "initial",
						"--tw-enter-scale": "initial",
						"--tw-enter-rotate": "initial",
						"--tw-enter-translate-x": "initial",
						"--tw-enter-translate-y": "initial",
					},
					".animate-out": {
						animationName: "exit",
						"--tw-exit-opacity": "initial",
						"--tw-exit-scale": "initial",
						"--tw-exit-rotate": "initial",
						"--tw-exit-translate-x": "initial",
						"--tw-exit-translate-y": "initial",
					},
				});

				matchUtilities(
					{
						"fade-in": (value) => ({ "--tw-enter-opacity": value }),
						"fade-out": (value) => ({ "--tw-exit-opacity": value }),
					},
					{ values: theme("animationOpacity") },
				);

				matchUtilities(
					{
						"slide-in-from-left": (value) => ({
							"--tw-enter-translate-x": `-${value}`,
						}),
						"slide-out-to-left": (value) => ({
							"--tw-exit-translate-x": `-${value}`,
						}),
					},
					{ values: theme("animationTranslate") },
				);

				matchUtilities(
					{ "animate-duration": (value) => ({ animationDuration: value }) },
					{ values: theme("animationDuration") },
				);
			},
			{
				theme: {
					extend: {
						animationDuration: ({ theme }) => ({
							0: "0ms",
							...theme("transitionDuration"),
						}),
						animationOpacity: ({ theme }) => ({
							DEFAULT: 0,
							...theme("opacity"),
						}),
						animationTranslate: ({ theme }) => ({
							DEFAULT: "100%",
							...theme("translate"),
						}),
						keyframes: {
							enter: {
								from: {
									opacity: "var(--tw-enter-opacity, 1)",
									transform:
										"translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0))",
								},
							},
							exit: {
								to: {
									opacity: "var(--tw-exit-opacity, 1)",
									transform:
										"translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0))",
								},
							},
						},
					},
				},
			},
		),
	],
} satisfies Config;
