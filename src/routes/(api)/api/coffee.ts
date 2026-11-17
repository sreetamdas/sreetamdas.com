import { createFileRoute } from "@tanstack/react-router";

import { getFoobarRewardPath } from "@/lib/domains/foobar/codes";

export function handleCoffee(request: Request): Response {
	if (request.method !== "POST") {
		return Response.json(
			{ error: "Method not allowed", allowed: ["POST"] },
			{ status: 405, headers: { Allow: "POST" } },
		);
	}

	return Response.json(
		{
			message: "Cannot brew coffee, I'm a teapot",
			foobar: getFoobarRewardPath("teapot"),
			jar: "/api/foobar/cookie",
		},
		{ status: 418 },
	);
}

export const Route = createFileRoute("/(api)/api/coffee")({
	server: {
		handlers: {
			GET: ({ request }) => handleCoffee(request),
			POST: ({ request }) => handleCoffee(request),
		},
	},
});
