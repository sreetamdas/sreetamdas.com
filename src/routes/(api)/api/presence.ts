import { createFileRoute } from "@tanstack/react-router";

export function handlePresenceGet(
	request: Request,
	env: CloudflareEnv,
): Promise<Response> | Response {
	const presence = env.SITE_PRESENCE;
	if (!presence) {
		return Response.json({ error: "SITE_PRESENCE binding is not available" }, { status: 500 });
	}

	const stub = presence.getByName("global");
	return stub.fetch(request);
}

export const Route = createFileRoute("/(api)/api/presence")({
	server: {
		handlers: {
			GET: async ({ request, context }) => {
				return handlePresenceGet(request, context.env);
			},
		},
	},
});
