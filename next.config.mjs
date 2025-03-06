import { withPlausibleProxy } from "next-plausible";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

process.env.SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL || "http://localhost:3000";

const isDev = process.argv.indexOf("dev") !== -1;
const isBuild = process.argv.indexOf("build") !== -1;
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
	process.env.VELITE_STARTED = "1";
	const { build } = await import("velite");
	await build({
		watch: isDev,
		clean: !isDev,
		inside: "next config",
		config: ".config/velite.config.ts",
	});
}

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
		// ppr: "incremental",
	},
	devIndicators: {
		buildActivity: false,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
			{
				protocol: "https",
				hostname: "i.imgur.com",
			},
		],
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

nextConfig = withPlausibleProxy({
	subdirectory: "prxy/plsbl",
	scriptName: "plsbl",
})(nextConfig);

export default nextConfig;
