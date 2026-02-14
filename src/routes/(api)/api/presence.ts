import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export const Route = createFileRoute("/(api)/api/presence")({
	server: {
		handlers: {
			GET: ({ request }: { request: Request }) => {
				// Intentional singleton: one global DO instance tracks site-wide presence.
				// Non-null assertion: SITE_PRESENCE binding is always present at runtime
				// (wrangler types mark it optional due to Sentry.withSentry wrapper in worker.ts)
				const stub = env.SITE_PRESENCE!.getByName("global");
				return stub.fetch(request);
			},
		},
	},
});
