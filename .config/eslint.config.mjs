import eslint from "@eslint/js";
import * as mdx from "eslint-plugin-mdx";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ["eslint.config.mjs"],
					defaultProject: "./tsconfig.json",
				},
				tsconfigRootDir: import.meta.dirname,
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	{
		plugins: {
			// react: react,
			// "react-hooks": reactHooks,
			// "jsx-a11y": jsxA11y,
			"simple-import-sort": simpleImportSort,
		},
	},
	{
		...mdx.flat,
		// optional, if you want to lint code blocks at the same
		processor: mdx.createRemarkProcessor({
			lintCodeBlocks: true,
			// optional, if you want to disable language mapper, set it to `false`
			// if you want to override the default language mapper inside, you can provide your own
			languageMapper: {},
		}),
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ["**/*.mdx"],
				},
			},
		},
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		rules: {
			"linebreak-style": ["error", "unix"],
			"no-console": "error",
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					varsIgnorePattern: "^_",
					argsIgnorePattern: "^_",
					destructuredArrayIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
			// from https://github.com/wesbos/eslint-config-wesbos
			"prefer-const": ["error", { destructuring: "all" }],
			"arrow-body-style": ["error", "as-needed"],
			"no-unused-expressions": ["error", { allowTaggedTemplates: true }],
			"no-param-reassign": ["error", { props: false }],
			"simple-import-sort/imports": "warn",
		},
	},
);
