import { getBindings } from "@/lib/domains/cloudflare";
import { createMiddleware } from "@tanstack/react-start";

export const cloudfareMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	const bindings = getBindings();

	return next({
		context: { env: bindings },
	});
});
