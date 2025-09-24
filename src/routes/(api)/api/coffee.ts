import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(api)/api/coffee")({
	server: {
		handlers: {
			GET: () => {
				return new Response(JSON.stringify({}), { status: 405, headers: { Allow: "POST" } });
			},
			POST: () => {
				return new Response(
					JSON.stringify({ message: "Cannot brew coffee, I'm a teapot", foobar: "/foobar/teapot" }),
					{ status: 418 },
				);
			},
		},
	},
});
