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

/**
 * Salt era for blog like visitor hashes. Bump this in the same change that
 * intentionally rotates like identity secrets: likes recorded under an older
 * salt keep their rows for audit but stop counting, so a rotation can't silently
 * inflate the counter or let prior visitors like again under the same era.
 */
export const LIKES_SALT_VERSION = 1;

/** Maximum anonymous like tokens accepted from one `(slug, ipHash)` bucket. */
export const LIKES_IP_ABUSE_LIMIT = 10;

export const IS_DEV = import.meta.env?.DEV ?? false;
export const IS_DEBUG = import.meta.env?.VITE_DEBUG_MODE === "true";

/**
 * Whether the build is running in CI. Set `VITE_CI=1` in the CI build step so
 * Vite statically inlines it — `process.env` isn't available in the Worker runtime.
 */
export const IS_CI = import.meta.env?.VITE_CI === "1";
