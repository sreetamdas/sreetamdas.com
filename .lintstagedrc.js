module.exports = {
	"**/*.ts?(x)": () => "tsc -p tsconfig.json",
	"*.{js,jsx,ts,tsx}": [
		"eslint 'src/*/**/*.{js,jsx,ts,tsx}' --cache",
		"prettier --write",
	],
};
