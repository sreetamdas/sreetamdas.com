/* eslint-disable @typescript-eslint/no-var-requires */
const { withPlausibleProxy } = require("next-plausible");

process.env.SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL || "https://sreetamdas.com";

module.exports = withPlausibleProxy()({
	compiler: {
		// ssr and displayName are configured by default
		styledComponents: true,
	},
	pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
	env: {
		SITE_URL: process.env.SITE_URL,
		OWNER: process.env.OWNER,
	},
	images: {
		domains: ["avatars.githubusercontent.com"],
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
