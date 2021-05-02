module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript",
		"plugin:jsx-a11y/recommended",
	],
	globals: {
		Atomics: "readonly",
		SharedArrayBuffer: "readonly",
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2018,
		sourceType: "module",
	},
	plugins: ["react", "@typescript-eslint", "react-hooks", "jsx-a11y"],
	rules: {
		indent: ["error", "tab", { SwitchCase: 1 }],
		"linebreak-style": ["error", "unix"],
		quotes: ["error", "double"],
		semi: ["error", "always"],
		"no-console": "error",
		"no-unused-vars": "off",
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
		"react/react-in-jsx-scope": "off",
		"react/jsx-no-undef": "off",
		"react/display-name": "off",
		"react/jsx-uses-react": "off",
		"import/order": [
			"error",
			{
				"newlines-between": "always",
				alphabetize: { order: "asc" },
			},
		],
	},
	settings: {
		react: {
			version: "detect",
		},
		"import/resolver": {
			typescript: {},
		},
	},
};
