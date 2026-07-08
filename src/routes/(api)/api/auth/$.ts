import { createFileRoute } from "@tanstack/react-router";

import { getAuth } from "@/lib/auth";

export async function handleAuthRequest(request: Request): Promise<Response> {
	const response = await getAuth().handler(request);

	// Workers Cache is enabled globally; auth responses (e.g. `get-session`) can
	// return per-user data with a 200 and no `Set-Cookie`, which would otherwise
	// be cacheable under the shared URL and leak across users. Never cache auth.
	const headers = new Headers(response.headers);
	headers.set("Cache-Control", "no-store");
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export const Route = createFileRoute("/(api)/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => handleAuthRequest(request),
			POST: ({ request }) => handleAuthRequest(request),
		},
	},
});
