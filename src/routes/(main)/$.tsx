import { createFileRoute, notFound } from "@tanstack/react-router";

/**
 * Catch-all for URLs with no matching route. Throwing notFound here lets the
 * (main) boundary render NotFound404 inside the normal header and footer.
 */
export const Route = createFileRoute("/(main)/$")({
	loader: () => {
		throw notFound();
	},
});
