import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export const Route = createFileRoute("/(api)/api/presence")({
	server: {
		handlers: {
			GET: ({ request }: { request: Request }) => {
				if (!env.SITE_PRESENCE) {
					return new Response(JSON.stringify({ count: 0 }), {
						headers: { "content-type": "application/json" },
					});
				}
				// Intentional singleton: one global DO instance tracks site-wide presence.
				const stub = env.SITE_PRESENCE.getByName("global");
				return stub.fetch(request);
			},
		},
	},
});
