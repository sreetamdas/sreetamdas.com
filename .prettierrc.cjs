module.exports = {
	trailingComma: "es5",
	useTabs: true,
	tabWidth: 2,
	semi: true,
	singleQuote: false,
	printWidth: 100,
	plugins: ["prettier-plugin-tailwindcss"],
	overrides: [
		{
			files: "*.mdx",
			options: {
				useTabs: false,
				tabWidth: 2,
				printWidth: 70,
			},
		},
	],
};
