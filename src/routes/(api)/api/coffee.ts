import { createFileRoute } from "@tanstack/react-router";

import { getFoobarRewardPath } from "@/lib/domains/foobar/codes";

export const Route = createFileRoute("/(api)/api/coffee")({
	server: {
		handlers: {
			GET: () => {
				return Response.json(
					{ error: "Method not allowed", allowed: ["POST"] },
					{ status: 405, headers: { Allow: "POST" } },
				);
			},
			POST: () => {
				return Response.json(
					{ message: "Cannot brew coffee, I'm a teapot", foobar: getFoobarRewardPath("teapot") },
					{ status: 418 },
				);
			},
		},
	},
});
