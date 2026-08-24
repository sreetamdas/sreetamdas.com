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

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Plausible props allow primitives; the collector requires string values. */
function stringProps(value: unknown): Record<string, string> | null {
	if (!isRecord(value)) {
		return null;
	}
	const out: Record<string, string> = {};
	for (const [key, val] of Object.entries(value)) {
		if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
			out[key] = String(val);
		}
	}
	return Object.keys(out).length > 0 ? out : null;
}

/** Map the tracker's compact v36 payload (n/u/r/p/e/sd/i) onto the collector's
 *  long-key format. The domain (d) is dropped — the collector derives the
 *  hostname from the URL. Unknown event names become collector custom events. */
function translateCompactPayload(parsed: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	const name = typeof parsed.n === "string" ? parsed.n : "";
	if (name === "pageview" || name === "engagement") {
		out.name = name;
	} else {
		out.name = "custom";
		out.event_name = name;
	}
	if (typeof parsed.u === "string") {
		out.url = parsed.u;
	}
	if (typeof parsed.r === "string" || parsed.r === null) {
		out.referrer = parsed.r;
	}
	const props = stringProps(parsed.p);
	if (props !== null) {
		out.props = props;
	}
	if (typeof parsed.e === "number") {
		out.engagement_ms = parsed.e;
	}
	if (typeof parsed.sd === "number") {
		out.scroll_depth = parsed.sd;
	}
	if (parsed.i === false) {
		out.interactive = false;
	}
	return out;
}

export async function handlePlausibleEventPost(request: Request): Promise<Response> {
	try {
		// Phase-1 tee (plan §19): keep the Plausible tracker stream untouched and
		// mirror each accepted event to the native stats collector over a private
		// Service Binding. Two payload shapes arrive here: the tracker's compact
		// v36 keys (n/u/d/r/p/e/sd) and our own long-key collector format. The
		// compact shape is translated to the collector format server-side and the
		// envelope fields (event_id, schema_version) are synthesized — the v36
		// script never sends them. Native failures never affect the primary
		// Plausible response.
		const bodyText = await request.clone().text();

		let relayBody = bodyText;
		try {
			const parsed: unknown = JSON.parse(bodyText);
			if (isRecord(parsed)) {
				const translated =
					typeof parsed.n === "string" && parsed.url === undefined && parsed.name === undefined
						? translateCompactPayload(parsed)
						: parsed;
				relayBody = JSON.stringify({
					schema_version: 1,
					event_id: crypto.randomUUID().replaceAll("-", ""),
					wd: false,
					...translated,
				});
			}
		} catch {
			// Non-JSON body: relay rejects it; Plausible still gets the original.
		}

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
					body: relayBody,
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
