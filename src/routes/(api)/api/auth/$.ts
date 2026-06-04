import { createFileRoute } from "@tanstack/react-router";

import { getAuth } from "@/lib/auth";

export function handleAuthRequest(request: Request, env: CloudflareEnv): Promise<Response> {
	return getAuth(env).handler(request);
}

export const Route = createFileRoute("/(api)/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request, context }) => handleAuthRequest(request, context.env),
			POST: ({ request, context }) => handleAuthRequest(request, context.env),
		},
	},
});
