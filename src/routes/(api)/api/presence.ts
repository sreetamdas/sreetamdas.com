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

	const stub = presence.getByName(getPresenceRoom(request));
	return stub.fetch(request);
}

const PRESENCE_ROOM_PATTERN = /^[a-zA-Z0-9._-]{1,64}$/;

/**
 * Namespaces presence by an optional `room` query parameter so concurrent
 * consumers (for example parallel e2e workers) do not count each other as
 * hunters. Unspecified or malformed rooms fall back to the shared "global" room.
 */
export function getPresenceRoom(request: Request): string {
	const room = new URL(request.url).searchParams.get("room");
	return room !== null && PRESENCE_ROOM_PATTERN.test(room) ? room : "global";
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
