/**
 * First-party Plausible event proxy. Browsers post analytics to this route so
 * the public site can keep one same-origin analytics endpoint while the Worker
 * forwards the minimal headers Plausible needs upstream.
 */
import { createFileRoute } from "@tanstack/react-router";

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
		const upstream = await fetch("https://plausible.io/api/event", {
			method: "POST",
			headers: {
				"content-type": request.headers.get("content-type") ?? "text/plain",
				"user-agent": request.headers.get("user-agent") ?? "",
				"x-forwarded-for": request.headers.get("cf-connecting-ip") ?? "",
			},
			body: request.body,
		});

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
