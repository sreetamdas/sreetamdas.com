import { createFileRoute } from "@tanstack/react-router";

import { handleSocialLoginRequest } from "@/lib/domains/auth/server";

export const Route = createFileRoute("/(api)/api/login/cloudflare")({
	server: {
		handlers: {
			GET: ({ request }) => handleSocialLoginRequest(request, "cloudflare"),
		},
	},
});
