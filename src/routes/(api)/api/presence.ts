import { createFileRoute } from "@tanstack/react-router";

type PresenceBinding = {
	getByName: (name: string) => {
		fetch: (request: Request) => Promise<Response> | Response;
	};
};

type PresenceEnv = {
	SITE_PRESENCE?: PresenceBinding;
};

export function handlePresenceGet(
	request: Request,
	env: PresenceEnv,
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
