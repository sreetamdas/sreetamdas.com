// import { withSentryConfig } from "@sentry/nextjs";
import withNextMDX from "@next/mdx";
import { withPlausibleProxy } from "next-plausible";
import remarkGfm from "remark-gfm";
import remarkSlug from "remark-slug";
import remarkToc from "remark-toc";

process.env.SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL || "http://localhost:3000";
// const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

const moduleExports = withPlausibleProxy()({
	experimental: {
		appDir: true,
	},
	compiler: {
		// ssr and displayName are configured by default
		styledComponents: true,
	},
	// sentry: {
	// 	hideSourceMaps: false,
	// 	tunnelRoute: "/tunnel/sentry",
	// 	disableServerWebpackPlugin: SENTRY_DSN === "",
	// 	disableClientWebpackPlugin: SENTRY_DSN === "",
	// },
	// pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
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

// const sentryWebpackPluginOptions = {
// 	silent: true, // Suppresses all logs
// };
const withMDX = withNextMDX({
	// Optionally provide remark and rehype plugins
	options: {
		remarkPlugins: [],
		rehypePlugins: [remarkGfm, remarkSlug, [remarkToc, { tight: true }]],
	},
});

export default withMDX(moduleExports);
