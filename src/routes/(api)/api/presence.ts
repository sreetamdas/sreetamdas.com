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

const PRESENCE_ROOM_PATTERN = /^e2e-worker-\d{1,2}$/;

/**
 * Namespaces presence by an optional `room` query parameter so isolated
 * consumers (the e2e suite) do not count each other as hunters. The pattern
 * is deliberately pinned to the e2e worker names: `/api/presence` is public
 * and each distinct room instantiates a paid Durable Object, so anonymous
 * callers must not be able to mint arbitrary rooms. Unspecified or
 * unauthorized rooms fall back to the shared "global" room.
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
