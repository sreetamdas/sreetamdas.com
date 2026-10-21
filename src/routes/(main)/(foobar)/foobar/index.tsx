import { createFileRoute } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { FoobarSchrodinger } from "@/lib/domains/foobar/DashboardClient";
import { StatsCounter } from "@/lib/domains/PageInteraction/StatsCounter";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/(main)/(foobar)/foobar/")({
	component: FoobarPage,
	head: () => {
		const ogImage = absoluteUrl("/og-foobar.png");
		return {
			meta: [
				{ title: `/foobar ${SITE_TITLE_APPEND}` },
				{ property: "og:image", content: ogImage },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "600" },
				{ name: "twitter:image", content: ogImage },
			],
		};
	},
});

function FoobarPage() {
	return (
		<>
			<FoobarSchrodinger completed_page="/" />
			<StatsCounter />
		</>
	);
}
