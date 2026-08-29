import * as Sentry from "@sentry/cloudflare";
/**
 * First-party Plausible event proxy. Browsers post analytics to this route so
 * the public site can keep one same-origin analytics endpoint while the Worker
 * forwards the minimal headers Plausible needs upstream.
 */
import { createFileRoute } from "@tanstack/react-router";
import { env, waitUntil } from "cloudflare:workers";

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
 *  hostname from the URL. Unknown event names become collector custom events.
 *  Props are only forwarded for custom events — pageview/engagement with props
 *  would be rejected by the collector validator (properties_not_allowed). */
export function translateCompactPayload(parsed: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	const name = typeof parsed.n === "string" ? parsed.n : "";
	const isCustom = name !== "pageview" && name !== "engagement";
	if (isCustom) {
		out.name = "custom";
		out.event_name = name;
	} else {
		out.name = name;
	}
	if (typeof parsed.u === "string") {
		out.url = parsed.u;
	}
	if (typeof parsed.r === "string" || parsed.r === null) {
		out.referrer = parsed.r;
	}
	if (isCustom) {
		const props = stringProps(parsed.p);
		if (props !== null) {
			out.props = props;
		}
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

/**
 * Build the collector-format relay body from whatever the browser posted. Two
 * shapes arrive: the tracker's compact v36 keys and our own long-key collector
 * format. The envelope fields (event_id, schema_version) are synthesized here
 * because the v36 script never sends them. A non-JSON body is passed through
 * untouched so the relay — not this route — decides to reject it.
 * `eventId` is injectable so tests can assert an exact body.
 */
export function buildRelayBody(bodyText: string, eventId?: string): string {
	let parsed: unknown;
	try {
		parsed = JSON.parse(bodyText);
	} catch {
		return bodyText;
	}
	if (!isRecord(parsed)) {
		return bodyText;
	}
	const translated =
		typeof parsed.n === "string" && parsed.url === undefined && parsed.name === undefined
			? translateCompactPayload(parsed)
			: parsed;
	return JSON.stringify({
		schema_version: 1,
		event_id: eventId ?? crypto.randomUUID().replaceAll("-", ""),
		wd: false,
		...translated,
	});
}

export interface RelayFetcher {
	fetch: (input: string, init: RequestInit) => Promise<Response>;
}

export interface RelayFacts {
	slug: string;
	token: string;
	ip: string;
	ua: string;
	country: string;
	city: string;
}

export interface RelayOutcome {
	status: number;
	reason: string | null;
}

/**
 * Mirror one accepted event to the native stats collector over the private
 * Service Binding. Returns a coarse outcome for privacy-safe counters — never
 * the payload, URL, IP, UA or relay headers.
 */
export async function relayToNativeStats(
	target: RelayFetcher,
	body: string,
	facts: RelayFacts,
): Promise<RelayOutcome> {
	const response = await target.fetch(`https://stats.internal/v1/relay/${facts.slug}`, {
		method: "POST",
		headers: {
			"content-type": "text/plain;charset=UTF-8",
			"x-relay-token": facts.token,
			"x-relay-ip": facts.ip,
			"x-relay-ua": facts.ua,
			"x-relay-country": facts.country,
			"x-relay-city": facts.city,
		},
		body,
	});
	let reason: string | null = null;
	try {
		const data = (await response.json()) as { reason?: unknown };
		reason = typeof data.reason === "string" ? data.reason.slice(0, 80) : null;
	} catch {
		reason = null;
	}
	return { status: response.status, reason };
}

/**
 * Coarse ingestion counters. Attributes carry no payload, URL, IP or UA.
 * `stage` separates what Plausible accepted from what native accepted, so the
 * parity alert is simply native_accepted < plausible_accepted.
 */
function recordTee(
	stage: "plausible" | "native",
	outcome: "accepted" | "rejected" | "error",
	reason: string,
): void {
	const project = env.ANALYTICS_PROJECT_SLUG ?? "unknown";
	Sentry.metrics.count("analytics.tee", 1, {
		attributes: { stage, outcome, reason, project },
	});
	if (stage === "native" && outcome !== "accepted") {
		Sentry.logger.warn("native stats tee did not accept", { outcome, reason, project });
	}
}

export async function handlePlausibleEventPost(request: Request): Promise<Response> {
	try {
		// Phase-1 tee (plan §19): keep the Plausible tracker stream untouched and
		// mirror each accepted event to the native stats collector over a private
		// Service Binding. Native failures never affect the primary Plausible
		// response, and the tee runs after the response via waitUntil so it never
		// sits on the beacon's critical path.
		const bodyText = await request.clone().text();
		const relayBody = buildRelayBody(bodyText);

		// Capture transient request facts now — they must not be read after the
		// response is returned.
		const cf = request.cf as { country?: unknown; city?: unknown } | undefined;
		const facts: RelayFacts = {
			slug: env.ANALYTICS_PROJECT_SLUG ?? "",
			token: (env as unknown as Record<string, string>).RELAY_TOKEN ?? "",
			ip: request.headers.get("cf-connecting-ip") ?? "",
			ua: request.headers.get("user-agent") ?? "",
			country: typeof cf?.country === "string" ? cf.country : "",
			city: typeof cf?.city === "string" ? cf.city : "",
		};

		const upstream = await fetch("https://plausible.io/api/event", {
			method: "POST",
			headers: {
				"content-type": request.headers.get("content-type") ?? "text/plain",
				"user-agent": facts.ua,
				"x-forwarded-for": facts.ip,
			},
			body: request.body,
		});

		const stats = env.STATS as RelayFetcher | undefined;
		if (upstream.ok) {
			recordTee("plausible", "accepted", "ok");
			if (stats !== undefined && facts.slug !== "" && facts.token !== "") {
				waitUntil(
					relayToNativeStats(stats, relayBody, facts)
						.then((outcome) => {
							recordTee(
								"native",
								outcome.status === 202 ? "accepted" : "rejected",
								outcome.reason ?? String(outcome.status),
							);
						})
						.catch(() => {
							// Tee failures never affect the primary response; Plausible stays
							// authoritative. Counted so a silent outage is still visible.
							recordTee("native", "error", "relay_unreachable");
						}),
				);
			} else {
				recordTee("native", "error", "tee_not_configured");
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
