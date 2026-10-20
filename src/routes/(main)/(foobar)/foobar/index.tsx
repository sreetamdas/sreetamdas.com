import { createFileRoute } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { FoobarSchrodinger } from "@/lib/domains/foobar/DashboardClient";
import { StatsCounter } from "@/lib/domains/PageInteraction/StatsCounter";

export const Route = createFileRoute("/(main)/(foobar)/foobar/")({
	component: FoobarPage,
	head: () => ({ meta: [{ title: `/foobar ${SITE_TITLE_APPEND}` }] }),
});

function FoobarPage() {
	return (
		<>
			<FoobarSchrodinger completed_page="/" />
			<StatsCounter />
		</>
	);
}
