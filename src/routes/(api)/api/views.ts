/**
 * Uncached page-view beacon endpoint.
 *
 * Cached HTML never reaches the Worker, so the client sends a same-origin POST
 * here after hydration. The handler validates the browser origin and delegates
 * deduped D1 writes to the page interaction domain.
 */
import { createFileRoute } from "@tanstack/react-router";

import { handleViewRecordRequest } from "@/lib/domains/PageInteraction/ViewRecorder.server";

export const Route = createFileRoute("/(api)/api/views")({
	server: {
		handlers: {
			POST: ({ request }) => handleViewRecordRequest(request),
		},
	},
});
