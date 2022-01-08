/* eslint-disable @typescript-eslint/no-var-requires */
const { withPlausibleProxy } = require("next-plausible");

module.exports = withPlausibleProxy()({
	experimental: { esmExternals: true, styledComponents: true },
	pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
	env: {
		SITE_URL: "https://sreetamdas.com",
	},
	webpack(config, options) {
		config.module.rules.push(
			{
				test: /\.svg$/,
				use: [
					{
						loader: "@svgr/webpack",
						options: {
							icon: true,
							titleProp: true,
						},
					},
				],
			},
			{
				test: /\.mdx?$/,
				use: [
					// The default `babel-loader` used by Next:
					options.defaultLoaders.babel,
					{
						loader: "@mdx-js/loader",
						/** @type {import('@mdx-js/loader').Options} */
						options: {
							/* jsxImportSource: …, otherOptions… */
						},
					},
				],
			}
		);

		return config;
	},
	async headers() {
		return [
			{
				source: "/foobar",
				headers: [
					{
						key: "x-foobar",
						value: "/foobar/headers", // Matched parameters can be used in the value
					},
				],
			},
		];
	},
});
