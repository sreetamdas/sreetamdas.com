import { createFileRoute } from "@tanstack/react-router";

import { handleAnalyticsEventGet, handleAnalyticsEventPost } from "@/lib/analytics/event.server";

export { handleAnalyticsEventGet, handleAnalyticsEventPost };

export const Route = createFileRoute("/(api)/api/prxy/nltyx/event")({
	server: {
		handlers: {
			POST: ({ request }) => handleAnalyticsEventPost(request),
			GET: () => handleAnalyticsEventGet(),
		},
	},
});
