import { createFileRoute } from "@tanstack/react-router";

import { FoobarSchrodinger } from "@/lib/domains/foobar/DashboardClient";
import { StatsCounter } from "@/lib/domains/PageInteraction/StatsCounter";

export const Route = createFileRoute("/(main)/(foobar)/foobar/")({
	component: FoobarPage,
});

function FoobarPage() {
	return (
		<>
			<FoobarSchrodinger completed_page="/" />
			<StatsCounter />
		</>
	);
}
