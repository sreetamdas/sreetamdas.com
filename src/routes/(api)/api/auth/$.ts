import { createFileRoute } from "@tanstack/react-router";

import { getAuth } from "@/lib/auth";

export function handleAuthRequest(request: Request): Promise<Response> {
	return getAuth().handler(request);
}

export const Route = createFileRoute("/(api)/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => handleAuthRequest(request),
			POST: ({ request }) => handleAuthRequest(request),
		},
	},
});
