/**
 * Server bridge for sign-in providers this deployment can actually complete.
 * Slides use it so the presenter UI never offers an OAuth provider whose
 * credentials are missing from the environment.
 */
import { createServerFn } from "@tanstack/react-start";

export const fetchConfiguredSignInProvidersServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const { getConfiguredSignInProviders } = await import("@/lib/auth");
		return getConfiguredSignInProviders();
	},
);
