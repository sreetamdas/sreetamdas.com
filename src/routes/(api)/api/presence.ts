import { createFileRoute } from "@tanstack/react-router";

type PresenceStub = {
	fetch: (request: Request) => Promise<Response> | Response;
};

type PresenceNamespace = {
	getByName: (name: string) => PresenceStub;
};

export function handlePresenceGet(
	request: Request,
	env: CloudflareEnv,
): Promise<Response> | Response {
	return handlePresenceGetForNamespace(request, env.SITE_PRESENCE);
}

export function handlePresenceGetForNamespace(
	request: Request,
	presence: PresenceNamespace | undefined,
): Promise<Response> | Response {
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
