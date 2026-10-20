import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { HTML_CACHE_HEADERS } from "@/lib/cacheHeaders";
import { NotFound404 } from "@/lib/components/Error";
import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";
import { FoobarPixel } from "@/lib/domains/foobar/Pixel";
import { fetchGitHubStats } from "@/lib/domains/GitHub/server";

const mainClassName =
	"relative grid grid-flow-col grid-cols-[1fr_min(var(--max-width),calc(100%-2rem))_1fr] gap-x-4 *:[grid-column:2]";

export const Route = createFileRoute("/(main)")({
	component: RouteComponent,
	loader: () => fetchGitHubStats().catch(() => ({ stars: 0, forks: 0 })),
	// Route headers merge root->leaf across all matches, so every (main) page
	// inherits this cache policy; /stats overrides it with STATS_CACHE_HEADERS.
	headers: () => HTML_CACHE_HEADERS,
	// Every leaf route in this layout sets its own title; this fallback only
	// reaches the document when a not-found boundary replaces the leaf.
	head: () => ({ meta: [{ title: `Page not found ${SITE_TITLE_APPEND}` }] }),
	// A not-found match renders this instead of RouteComponent, so the layout
	// is repeated here to keep the header and footer around NotFound404.
	notFoundComponent: () => (
		<>
			<Header />
			<main id="main-content" className={mainClassName}>
				<NotFound404 />
			</main>
			<Footer>
				<FoobarPixel path="/404" />
			</Footer>
		</>
	),
});

function RouteComponent() {
	const gitHubStats = Route.useLoaderData();
	return (
		<>
			<Header />
			<main id="main-content" className={mainClassName}>
				<Outlet />
			</main>
			<Footer gitHubStats={gitHubStats}>
				<FoobarPixel />
			</Footer>
		</>
	);
}
