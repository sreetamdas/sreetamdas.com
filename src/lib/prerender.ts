/**
 * Keep TanStack Start's static prerender crawler focused on stable, repo-owned pages.
 * Newsletter issue bodies come from Buttondown and may contain stale internal links,
 * so detail pages should render on demand instead of being build blockers.
 */
export function shouldPrerenderPath(path: string) {
	return !isNewsletterDetailPath(path);
}

function isNewsletterDetailPath(path: string) {
	if (path === "/newsletter" || path === "/newsletter/") {
		return false;
	}

	return path.startsWith("/newsletter/");
}
