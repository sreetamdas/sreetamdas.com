/*
Test-only Worker entrypoint used by @cloudflare/vitest-pool-workers.
Keeps runtime tests independent from TanStack Start virtual module resolution.
*/

export { PresenceDurableObject } from "../lib/cloudflare/PresenceDurableObject";
export { SlideSessionDurableObject } from "../lib/cloudflare/SlideSessionDurableObject";

const worker: ExportedHandler<CloudflareEnv> = {
	fetch(request, env) {
		const { pathname } = new URL(request.url);

		if (pathname === "/health") {
			const hasPresenceBinding = typeof env.SITE_PRESENCE?.getByName === "function";
			const hasSlideSessionsBinding = typeof env.SLIDE_SESSIONS?.getByName === "function";
			return Response.json({ ok: true, hasPresenceBinding, hasSlideSessionsBinding });
		}

		return new Response("Not Found", { status: 404 });
	},
};

export default worker;
