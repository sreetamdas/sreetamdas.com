/**
 * First-party Plausible event proxy. Browsers post analytics to this route so
 * the public site can keep one same-origin analytics endpoint while the Worker
 * forwards the minimal headers Plausible needs upstream.
 */
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export function handlePlausibleEventGet(): Response {
	return Response.json(
		{ error: "Method not allowed", allowed: ["POST"] },
		{
			status: 405,
			headers: { Allow: "POST" },
		},
	);
}

export async function handlePlausibleEventPost(request: Request): Promise<Response> {
	try {
		// Phase-1 tee (plan §19): keep the Plausible tracker stream untouched and
		// mirror the exact payload + transient request facts to the native stats
		// collector over a private Service Binding. Native failures never affect
		// the primary Plausible response.
		const bodyText = await request.clone().text();

		const upstream = await fetch("https://plausible.io/api/event", {
			method: "POST",
			headers: {
				"content-type": request.headers.get("content-type") ?? "text/plain",
				"user-agent": request.headers.get("user-agent") ?? "",
				"x-forwarded-for": request.headers.get("cf-connecting-ip") ?? "",
			},
			body: request.body,
		});

		if (upstream.ok) {
			try {
				const cf = request.cf as { country?: unknown; city?: unknown } | undefined;
				await env.STATS.fetch(`https://stats.internal/v1/relay/${env.ANALYTICS_PROJECT_SLUG}`, {
					method: "POST",
					headers: {
						"content-type": "text/plain;charset=UTF-8",
						"x-relay-token": env.RELAY_TOKEN,
						"x-relay-ip": request.headers.get("cf-connecting-ip") ?? "",
						"x-relay-ua": request.headers.get("user-agent") ?? "",
						"x-relay-country": typeof cf?.country === "string" ? cf.country : "",
						"x-relay-city": typeof cf?.city === "string" ? cf.city : "",
					},
					body: bodyText,
				});
			} catch {
				// Tee failures are intentionally swallowed; Plausible stays authoritative.
			}
		}

		return new Response(upstream.body, {
			status: upstream.status,
			headers: upstream.headers,
		});
	} catch {
		return Response.json({ error: "Plausible upstream is unavailable" }, { status: 502 });
	}
}

export const Route = createFileRoute("/(api)/prxy/plsbl/api/event")({
	server: {
		handlers: {
			POST: async ({ request }: { request: Request }) => handlePlausibleEventPost(request),
			GET: () => handlePlausibleEventGet(),
		},
	},
});
