const remarkSlug = require("remark-slug");
const remarkAutolinkHeadings = require("remark-autolink-headings");

const withMDX = require("@next/mdx")({
	extension: /\.mdx?$/,
	options: {
		remarkPlugins: [
			remarkSlug,
			[
				remarkAutolinkHeadings,
				{
					content: {
						type: "element",
						tagName: "svg",
						properties: {
							className: ["icon2", "icon-link"],
							xmlns: "http://www.w3.org/2000/svg",
							width: "24",
							height: "24",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							strokeLinecap: "round",
							strokeLinejoin: "round",
						},
						children: [
							{
								type: "element",
								tagName: "path",
								properties: {
									d:
										"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
								},
							},
							{
								type: "element",
								tagName: "path",
								properties: {
									d:
										"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
								},
							},
						],
					},
				},
			],
		],
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
