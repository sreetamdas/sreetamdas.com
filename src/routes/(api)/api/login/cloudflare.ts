import { createFileRoute } from "@tanstack/react-router";

import { handleSocialLoginRequest } from "@/lib/domains/auth/server-fns";

export const Route = createFileRoute("/(api)/api/login/cloudflare")({
	server: {
		handlers: {
			GET: ({ request, context }) => handleSocialLoginRequest(request, "cloudflare", context.env),
		},
	},
});
