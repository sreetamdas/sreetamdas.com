import { createFileRoute } from "@tanstack/react-router";

import { handleSocialLoginRequest, isSocialSignInProvider } from "@/lib/domains/auth/server";

export const Route = createFileRoute("/(api)/api/login/$provider")({
	server: {
		handlers: {
			GET: ({ request, params }) =>
				isSocialSignInProvider(params.provider)
					? handleSocialLoginRequest(request, params.provider)
					: new Response("Not found", { status: 404 }),
		},
	},
});
