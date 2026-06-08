/**
 * Slide live-session API boundary. Each session id maps to one Durable Object
 * instance that owns presenter-controlled navigation and poll state.
 */
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

import { getAllowedPresenterEmail } from "@/lib/auth";

type SlideSessionStub = {
	fetch: (request: Request) => Promise<Response> | Response;
};

type SlideSessionNamespace = {
	getByName: (name: string) => SlideSessionStub;
};

type SlideRole = "master" | "viewer";

type PresenterEmailResolver = (
	request: Request,
) => Promise<string | undefined> | string | undefined;

export const SLIDE_SESSION_ROLE_HEADER = "x-sreetamdas-slide-role";

export async function handleSlideSessionRequest(
	request: Request,
	sessions: SlideSessionNamespace | undefined,
	sessionId: string,
	presenterEmailResolver?: PresenterEmailResolver,
): Promise<Response> {
	if (!sessions) {
		return Response.json({ error: "SLIDE_SESSIONS binding is not available" }, { status: 500 });
	}

	if (!isValidSessionId(sessionId)) {
		return Response.json({ error: "Invalid slide session id" }, { status: 400 });
	}

	const role = await resolveRequestedSlideRole(request, presenterEmailResolver);
	if (role === "unauthorized") {
		return Response.json({ error: "Presenter authentication required" }, { status: 401 });
	}

	return sessions.getByName(sessionId).fetch(withTrustedSlideRole(request, role));
}

export async function resolveRequestedSlideRole(
	request: Request,
	presenterEmailResolver?: PresenterEmailResolver,
): Promise<SlideRole | "unauthorized"> {
	const requestedRole = parseRequestedRole(new URL(request.url).searchParams.get("role"));
	if (requestedRole === "viewer") return "viewer";

	const presenterEmail = await presenterEmailResolver?.(request);
	return presenterEmail ? "master" : "unauthorized";
}

export function withTrustedSlideRole(request: Request, role: SlideRole): Request {
	const headers = new Headers(request.headers);
	headers.set(SLIDE_SESSION_ROLE_HEADER, role);
	return new Request(request, { headers });
}

function parseRequestedRole(value: string | null): SlideRole {
	return value === "master" ? "master" : "viewer";
}

export function isValidSessionId(sessionId: string) {
	return /^[a-zA-Z0-9_-]{1,80}$/.test(sessionId);
}

export const Route = createFileRoute("/(api)/api/slides/session/$sessionId")({
	server: {
		handlers: {
			GET: ({ request, params }) => {
				return handleSlideSessionRequest(request, env.SLIDE_SESSIONS, params.sessionId, () =>
					getAllowedPresenterEmail(request, env),
				);
			},
		},
	},
});
