import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export function handleAnalyticsEventGet(): Response {
	return new Response("Method not allowed", {
		status: 405,
		headers: { Allow: "POST" },
	});
}

export async function handleAnalyticsEventPost(request: Request): Promise<Response> {
	const relayToken =
		"RELAY_TOKEN" in env && typeof env.RELAY_TOKEN === "string" ? env.RELAY_TOKEN : "";
	const projectSlug =
		"ANALYTICS_PROJECT_SLUG" in env && typeof env.ANALYTICS_PROJECT_SLUG === "string"
			? env.ANALYTICS_PROJECT_SLUG
			: "";
	if (relayToken.trim() === "" || projectSlug.trim() === "") {
		return new Response("Analytics unavailable", { status: 503 });
	}

	const cf = request.cf;
	const ip = request.headers.get("cf-connecting-ip");
	try {
		const response = await env.STATS.fetch(
			`https://stats.internal/v1/relay/${encodeURIComponent(projectSlug)}`,
			{
				method: "POST",
				headers: {
					"content-type": request.headers.get("content-type") ?? "text/plain;charset=UTF-8",
					"x-relay-token": relayToken,
					"x-relay-ua": request.headers.get("user-agent") ?? "",
					"x-relay-country": typeof cf?.country === "string" ? cf.country : "",
					"x-relay-city": typeof cf?.city === "string" ? cf.city : "",
					...(ip === null ? {} : { "x-relay-ip": ip }),
				},
				body: request.body,
			},
		);
		if (response.status === 202) return new Response(null, { status: 202 });
		return new Response("Analytics rejected", { status: 502 });
	} catch {
		return new Response("Analytics unavailable", { status: 502 });
	}
}

export const Route = createFileRoute("/(api)/api/prxy/nltyx/event")({
	server: {
		handlers: {
			POST: ({ request }) => handleAnalyticsEventPost(request),
			GET: () => handleAnalyticsEventGet(),
		},
	},
});
