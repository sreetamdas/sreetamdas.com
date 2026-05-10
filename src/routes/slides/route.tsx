import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ViewsCounter } from "@/lib/components/ViewsCounter";

export const Route = createFileRoute("/slides")({
	component: MainLayout,
});

function MainLayout() {
	return (
		<>
			<main id="main-content">
				<Outlet />
			</main>
			<ViewsCounter hidden />
		</>
	);
}
