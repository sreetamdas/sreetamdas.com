const withMDX = require("@next/mdx")({
	extension: /\.mdx?$/,
});
module.exports = withMDX({
	pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			issuer: {
				test: /\.(js|ts)x?$/,
			},
			use: ["@svgr/webpack"],
		});

		return config;
	},
});
