/* eslint-disable @typescript-eslint/no-var-requires */
// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require("@sentry/nextjs");
const { withPlausibleProxy } = require("next-plausible");

process.env.SITE_URL = process.env.SITE_URL || process.env.VERCEL_URL || "https://sreetamdas.com";

const moduleExports = withPlausibleProxy()({
	compiler: {
		// ssr and displayName are configured by default
		styledComponents: true,
	},
	swcMinify: true,
	sentry: {
		hideSourceMaps: true,
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

const sentryWebpackPluginOptions = {
	// Additional config options for the Sentry Webpack plugin. Keep in mind that
	// the following options are set automatically, and overriding them is not
	// recommended:
	//   release, url, org, project, authToken, configFile, stripPrefix,
	//   urlPrefix, include, ignore

	silent: true, // Suppresses all logs
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
