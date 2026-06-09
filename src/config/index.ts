export const OWNER_NAME = "Sreetam Das";
export const DEFAULT_REPO = {
	owner: "sreetamdas",
	repo: "sreetamdas.com",
};

// Prefer Vite-exposed env, but fall back to runtime origin (client)
// or the production domain.
export const SITE_URL =
	import.meta.env?.VITE_SITE_URL ??
	(typeof window !== "undefined" ? window.location.origin : "https://sreetamdas.com");
export const SITE_TITLE_APPEND = `| ${OWNER_NAME}`;
export const SITE_DESCRIPTION =
	"Senior software tinkerer from India. 💜 React, Elixir and TypeScript, CS and mechanical keyboards!";
export const SITE_OG_IMAGE = "/og-image.png";

export const IS_DEV = import.meta.env?.DEV ?? false;
export const IS_DEBUG = import.meta.env?.VITE_DEBUG_MODE === "true";

/**
 * Whether the build is running in CI. Set `VITE_CI=1` in the CI build step so
 * Vite statically inlines it — `process.env` isn't available in the Worker runtime.
 */
export const IS_CI = import.meta.env?.VITE_CI === "1";
