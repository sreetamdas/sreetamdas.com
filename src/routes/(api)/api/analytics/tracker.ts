import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export async function handleTrackerGet(): Promise<Response> {
	try {
		const response = await env.STATS.fetch("https://stats.internal/v1/tracker.js");
		return new Response(response.body, {
			status: response.status,
			headers: response.headers,
		});
	} catch {
		return new Response("Tracker unavailable", { status: 502 });
	}
}

export const Route = createFileRoute("/(api)/api/analytics/tracker")({
	server: {
		handlers: {
			GET: () => handleTrackerGet(),
		},
	},
});
