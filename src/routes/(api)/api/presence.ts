import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

type PresenceStub = {
	fetch: (request: Request) => Promise<Response> | Response;
};

type PresenceNamespace = {
	getByName: (name: string) => PresenceStub;
};

export function handlePresenceGet(request: Request): Promise<Response> | Response {
	return handlePresenceGetForNamespace(request, env.SITE_PRESENCE);
}

export function handlePresenceGetForNamespace(
	request: Request,
	presence: PresenceNamespace | undefined,
): Promise<Response> | Response {
	if (!presence) {
		// oxlint-disable-next-line no-console
		console.error("SITE_PRESENCE binding is not available");
		return Response.json({ error: "Live presence is unavailable" }, { status: 500 });
	}

	const stub = presence.getByName("global");
	return stub.fetch(request);
}

export const Route = createFileRoute("/(api)/api/presence")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				return handlePresenceGet(request);
			},
		},
	},
});
