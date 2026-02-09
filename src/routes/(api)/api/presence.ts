import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export const Route = createFileRoute("/(api)/api/presence")({
	server: {
		handlers: {
			GET: ({ request }: { request: Request }) => {
				const stub = env.SITE_PRESENCE.getByName("global");
				return stub.fetch(request);
			},
		},
	},
});
