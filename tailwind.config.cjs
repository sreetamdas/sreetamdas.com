/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "rgb(var(--color-primary))",
				secondary: "rgb(var(--color-secondary))",
				foreground: "rgb(var(--color-foreground))",
				background: "rgb(var(--color-background))",
			},
		},
	},
	plugins: [],
};
