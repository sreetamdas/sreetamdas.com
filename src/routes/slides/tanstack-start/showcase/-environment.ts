import { createIsomorphicFn, createServerOnlyFn } from "@tanstack/react-start";

export const getRuntimeSide = createIsomorphicFn()
	.server(() => "server render")
	.client(() => "hydrated browser");

export const getServerOnlyBoundaryLabel = createServerOnlyFn(() => {
	return "server-only code stayed behind the boundary";
});
