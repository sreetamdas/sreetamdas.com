/**
 * Slide live-session API boundary. Each session id maps to one Durable Object
 * instance that owns presenter-controlled navigation and poll state.
 */
import { createFileRoute } from "@tanstack/react-router";

type SlideSessionStub = {
	fetch: (request: Request) => Promise<Response> | Response;
};

type SlideSessionNamespace = {
	getByName: (name: string) => SlideSessionStub;
};

export function handleSlideSessionRequest(
	request: Request,
	sessions: SlideSessionNamespace | undefined,
	sessionId: string,
): Promise<Response> | Response {
	if (!sessions) {
		return Response.json({ error: "SLIDE_SESSIONS binding is not available" }, { status: 500 });
	}

	if (!isValidSessionId(sessionId)) {
		return Response.json({ error: "Invalid slide session id" }, { status: 400 });
	}

	return sessions.getByName(sessionId).fetch(request);
}

export function isValidSessionId(sessionId: string) {
	return /^[a-zA-Z0-9_-]{1,80}$/.test(sessionId);
}

export const Route = createFileRoute("/(api)/api/slides/session/$sessionId")({
	server: {
		handlers: {
			GET: ({ request, context, params }) => {
				return handleSlideSessionRequest(request, context.env.SLIDE_SESSIONS, params.sessionId);
			},
		},
	},
});
