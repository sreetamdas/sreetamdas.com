import { withContentlayer } from "next-contentlayer";
import { withPlausibleProxy } from "next-plausible";

process.env.SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL || "http://localhost:3000";

const moduleExports = withPlausibleProxy()({
	experimental: {
		typedRoutes: true,
		logging: "verbose",
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

export default withContentlayer(moduleExports);
