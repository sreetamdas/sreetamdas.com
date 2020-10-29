module.exports = {
	trailingComma: "es5",
	useTabs: true,
	tabWidth: 4,
	semi: true,
	singleQuote: false,
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
