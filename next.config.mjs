import { withContentlayer } from "next-contentlayer2";
import { withPlausibleProxy } from "next-plausible";

process.env.SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL || "http://localhost:3000";

/** @type {import("next").NextConfig} */
let nextConfig = {
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	experimental: {
		// typedRoutes: true,
		mdxRs: true,
		ppr: true,
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
};

nextConfig = withContentlayer(nextConfig);
nextConfig = withPlausibleProxy({
	subdirectory: "prxy/plsbl",
	scriptName: "plsbl",
})(nextConfig);

export default nextConfig;
