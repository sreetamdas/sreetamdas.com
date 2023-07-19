/* eslint-disable @typescript-eslint/no-var-requires */
const { withContentlayer } = require("next-contentlayer");
const { withPlausibleProxy } = require("next-plausible");

process.env.SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL || "http://localhost:3000";

const moduleExports = withPlausibleProxy()({
	experimental: {
		appDir: true,
		mdxRs: true,
		typedRoutes: true,
	},
	images: {
		domains: ["avatars.githubusercontent.com", "i.imgur.com"],
	},

	async headers() {
		return [
			{
				source: "/foobar",
				headers: [
					{
						key: "x-foobar",
						value: "/foobar/headers",
					},
				],
			},
		];
	},
});

module.exports = withContentlayer(moduleExports);
