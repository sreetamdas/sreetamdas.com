import { createFileRoute } from "@tanstack/react-router";

import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { FoobarSchrodinger } from "@/lib/domains/foobar/DashboardClient";

export const Route = createFileRoute("/(main)/(foobar)/foobar/")({
	component: FoobarArchivePage,
});

function FoobarArchivePage() {
	return (
		<>
			<FoobarSchrodinger completed_page="/" />
			<ViewsCounter />
		</>
	);
}
