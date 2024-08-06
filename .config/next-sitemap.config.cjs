/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.SITE_URL ?? "https://example.com",
	transform: async (config, path) => {
		if (path.startsWith("/foobar")) {
			return null;
		}

		// Use default transformation for all other cases
		return {
			loc: path,
			changefreq: config.changefreq,
			priority: config.priority,
			lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
			alternateRefs: config.alternateRefs ?? [],
		};
	},
};
