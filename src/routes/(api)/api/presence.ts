import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export const Route = createFileRoute("/(api)/api/presence")({
	server: {
		handlers: {
			GET: ({ request }: { request: Request }) => {
				if (request.method !== "GET") {
					return new Response("Method Not Allowed", { status: 405 });
				}

				const stub = env.SITE_PRESENCE.getByName("global");
				return stub.fetch(request);
			},
		},
	},
});
