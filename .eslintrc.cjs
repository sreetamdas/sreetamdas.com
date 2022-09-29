module.exports = {
	root: true,
	plugins: ["react", "@typescript-eslint", "react-hooks", "jsx-a11y"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2018,
		sourceType: "module",
	},
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript",
		"plugin:jsx-a11y/recommended",
		"prettier",
		"plugin:@next/next/recommended",
	],
	globals: {
		Atomics: "readonly",
		SharedArrayBuffer: "readonly",
	},
	rules: {
		indent: ["error", "tab", { SwitchCase: 1 }],
		"linebreak-style": ["error", "unix"],
		quotes: ["error", "double"],
		semi: ["error", "always"],
		"no-console": "error",
		"no-unused-vars": "off",
		"react/prop-types": "off",
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
		"react/react-in-jsx-scope": "off",
		"react/jsx-no-target-blank": "off",
		"react/jsx-no-undef": "warn",
		"react/display-name": "warn",
		"react/jsx-uses-react": "warn",
		"react/jsx-no-useless-fragment": "warn",
		"react/jsx-fragments": "warn",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		// "@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-unused-vars": [
			"error",
			{ argsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
		],

		// from https://github.com/wesbos/eslint-config-wesbos
		"prefer-const": ["error", { destructuring: "all" }],
		"arrow-body-style": ["error", "as-needed"],
		"no-unused-expressions": ["error", { allowTaggedTemplates: true }],
		"no-param-reassign": ["error", { props: false }],
		"import/prefer-default-export": 0,
		"jsx-a11y/label-has-associated-control": ["error", { assert: "either" }],
		"jsx-a11y/anchor-is-valid": ["warn", { aspects: ["invalidHref"] }],

		"import/order": ["error", { "newlines-between": "always", alphabetize: { order: "asc" } }],
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
