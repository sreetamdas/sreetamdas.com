import { createFileRoute } from "@tanstack/react-router";

import { handleSocialLoginRequest } from "@/lib/domains/auth/server";

export const Route = createFileRoute("/(api)/api/login/github")({
	server: {
		handlers: {
			GET: ({ request }) => handleSocialLoginRequest(request, "github"),
		},
	},
});
