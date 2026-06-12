import { createFileRoute } from "@tanstack/react-router";

import { FoobarSchrodinger } from "@/lib/domains/foobar/DashboardClient";
import { ViewsCounter } from "@/lib/domains/PageInteraction/ViewsCounter";

export const Route = createFileRoute("/(main)/(foobar)/foobar/")({
	component: FoobarPage,
});

function FoobarPage() {
	return (
		<>
			<FoobarSchrodinger completed_page="/" />
			<ViewsCounter />
		</>
	);
}
