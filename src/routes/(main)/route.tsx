import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

import { NotFound404 } from "@/lib/components/Error";
import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";
import { FoobarPixel } from "@/lib/domains/foobar/Pixel";
import { fetchGitHubStats } from "@/lib/domains/GitHub/server";

export const Route = createFileRoute("/(main)")({
	component: RouteComponent,
	loader: () => fetchGitHubStats().catch(() => ({ stars: 0, forks: 0 })),
	notFoundComponent: () => <NotFound404 />,
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
