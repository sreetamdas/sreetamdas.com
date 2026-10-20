import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

import { HTML_CACHE_HEADERS } from "@/lib/cacheHeaders";
import { NotFound404 } from "@/lib/components/Error";
import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";
import { FoobarPixel } from "@/lib/domains/foobar/Pixel";
import { fetchGitHubStats } from "@/lib/domains/GitHub/server";

export const Route = createFileRoute("/(main)")({
	component: RouteComponent,
	loader: () => fetchGitHubStats().catch(() => ({ stars: 0, forks: 0 })),
	// Route headers merge root->leaf across all matches, so every (main) page
	// inherits this cache policy; /stats overrides it with STATS_CACHE_HEADERS.
	headers: () => HTML_CACHE_HEADERS,
	// A not-found match renders this instead of RouteComponent, so the layout's
	// FoobarPixel is absent; this one claims the error404 achievement.
	notFoundComponent: () => (
		<>
			<NotFound404 />
			<FoobarPixel path="/404" />
		</>
	),
});

function RouteComponent() {
	const gitHubStats = Route.useLoaderData();
	return (
		<>
			<Header />
			<main
				id="main-content"
				className="relative grid grid-flow-col grid-cols-[1fr_min(var(--max-width),calc(100%-2rem))_1fr] gap-x-4 *:[grid-column:2]"
			>
				<Outlet />
			</main>
			<Footer gitHubStats={gitHubStats}>
				<FoobarPixel />
			</Footer>
		</>
	);
}
