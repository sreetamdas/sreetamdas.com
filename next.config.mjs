import { withSentryConfig } from "@sentry/nextjs";
import { withContentlayer } from "next-contentlayer";
import { withPlausibleProxy } from "next-plausible";

process.env.SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL || "http://localhost:3000";

/** @type {import("next").NextConfig} */
let nextConfig = withPlausibleProxy({
	subdirectory: "prxy",
	scriptName: "plsbl",
})({
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
	experimental: {
		// typedRoutes: true,
		mdxRs: true,
		instrumentationHook: true,
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

nextConfig = withContentlayer(nextConfig);

export default withSentryConfig(nextConfig, {
	project: process.env.SENTRY_PROJECT,
	org: process.env.SENTRY_ORG,
	authToken: process.env.SENTRY_AUTH_TOKEN,
	silent: false,
	tunnelRoute: "/prxy/sntry",
});
