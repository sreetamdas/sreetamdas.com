import { createFileRoute, Outlet } from "@tanstack/react-router";

import { Footer } from "@/lib/components/Footer";
import { Header } from "@/lib/components/Header";
import { FoobarPixel } from "@/lib/domains/foobar/Pixel";
import { fetchGitHubStats } from "@/lib/domains/GitHub/server";

export const Route = createFileRoute("/(pure)")({
	component: MainLayout,
	loader: () => fetchGitHubStats().catch(() => ({ stars: 0, forks: 0 })),
});

function MainLayout() {
	const gitHubStats = Route.useLoaderData();
	return (
		<>
			<Header className="print:hidden" />
			<main id="main-content">
				<Outlet />
			</main>
			<Footer className="print:hidden" gitHubStats={gitHubStats}>
				<FoobarPixel />
			</Footer>
		</>
	);
}
