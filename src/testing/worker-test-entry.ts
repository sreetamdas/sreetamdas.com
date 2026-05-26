/*
Test-only Worker entrypoint used by @cloudflare/vitest-pool-workers.
Keeps runtime tests independent from TanStack Start virtual module resolution.
*/

export { PresenceDurableObject } from "../lib/cloudflare/PresenceDurableObject";

const worker: ExportedHandler<CloudflareEnv> = {
	fetch(request, env) {
		const { pathname } = new URL(request.url);

		if (pathname === "/health") {
			const hasPresenceBinding = typeof env.SITE_PRESENCE?.getByName === "function";
			return Response.json({ ok: true, hasPresenceBinding });
		}

		return new Response("Not Found", { status: 404 });
	},
};

export default worker;
