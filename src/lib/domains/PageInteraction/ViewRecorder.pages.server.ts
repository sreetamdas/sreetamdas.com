/**
 * Count only real pages, not caller-created counter keys. Static pages with
 * counters are explicit; dynamic pages follow the same published content and
 * committed newsletter snapshot used by the routes, without remote lookups.
 */
import "@tanstack/react-start/server-only";
import { allBlogPosts, allRootPages } from "content-collections";

import { shouldServeRootPage } from "@/lib/content/visibility";
import { getNewsletterSnapshot } from "@/lib/domains/Buttondown";

const staticViewPages = new Set([
	"/",
	"/about",
	"/blog",
	"/karma",
	"/rwc",
	"/newsletter",
	"/keebs",
	"/stats",
	"/foobar",
	"/resume",
	"/version",
	"/fancy-pants",
	"/slides",
	"/slides/json-schema-form",
	"/slides/tanstack-start",
	"/slides/tanstack-start/dev-lab",
]);
const contentViewPages = new Set([
	...allBlogPosts.filter((post) => post.published).map((post) => post.page_path),
	...allRootPages
		.filter((page) => shouldServeRootPage(page, { includeDrafts: false }))
		.map((page) => page.page_path),
	...(getNewsletterSnapshot()?.results ?? []).map((issue) => `/newsletter/${issue.slug}`),
]);

export function isKnownViewPage(pathname: string): boolean {
	return staticViewPages.has(pathname) || contentViewPages.has(pathname);
}
