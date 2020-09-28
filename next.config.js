const remarkSlug = require("remark-slug");
const remarkAutolinkHeadings = require("remark-autolink-headings");

const withMDX = require("@next/mdx")({
	extension: /\.mdx?$/,
	options: {
		remarkPlugins: [remarkSlug, remarkAutolinkHeadings],
	},
});

module.exports = withMDX({
	pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			issuer: {
				test: /\.(js|ts)x?$/,
			},
			use: [
				{
					loader: "@svgr/webpack",
					options: {
						icon: true,
						titleProp: true,
					},
				},
			],
		});

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
