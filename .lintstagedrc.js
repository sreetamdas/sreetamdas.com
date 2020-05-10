module.exports = {
	"**/*.ts?(x)": () => "tsc -p tsconfig.json",
	"*.{js,jsx,ts,tsx}": ["eslint --cache --fix", "prettier --write"],
};
