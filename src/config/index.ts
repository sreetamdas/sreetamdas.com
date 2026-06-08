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
export const IS_DEBUG = false;

/**
 * Check if the site is currently being built, to affect build-time behaviour.
 * @see https://vercel.com/docs/concepts/projects/environment-variables/system-environment-variables#system-environment-variables
 */
export const IS_CI = false;
