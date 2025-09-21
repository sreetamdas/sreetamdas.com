/** @type {import('prettier').Config} */
export default {
	trailingComma: "all",
	useTabs: true,
	tabWidth: 2,
	semi: true,
	singleQuote: false,
	printWidth: 100,
	plugins: ["@prettier/plugin-oxc", "prettier-plugin-tailwindcss"],
	overrides: [
		{
			files: "*.mdx",
			options: {
				useTabs: false,
				tabWidth: 2,
				printWidth: 70,
			},
		},
		{
			files: ["*.jsonc", "*.json"],
			options: {
				trailingComma: "none",
			},
		},
	],
};
