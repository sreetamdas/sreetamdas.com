module.exports = {
	root: true,
	plugins: ["react", "@typescript-eslint", "react-hooks", "jsx-a11y", "prettier"],
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
		"plugin:import/recommended",
		"plugin:import/typescript",
		"plugin:jsx-a11y/recommended",
		"prettier",
		"plugin:prettier/recommended",
		"plugin:@next/next/recommended",
		"plugin:mdx/recommended",
	],
	globals: {
		Atomics: "readonly",
		SharedArrayBuffer: "readonly",
	},
	rules: {
		"linebreak-style": ["error", "unix"],
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
		"@typescript-eslint/consistent-type-imports": "warn",
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

		"import/order": ["warn", { "newlines-between": "always", alphabetize: { order: "asc" } }],
		"prettier/prettier": ["error"],
	},
	settings: {
		react: {
			version: "detect",
		},
		"import/resolver": {
			typescript: {},
		},
	},
	overrides: [
		{
			files: ["*.mdx", "**/*.mdx/**"],
			extends: "plugin:mdx/recommended",
			rules: {
				"react/jsx-no-undef": "warn",
			},
		},
	],
};
