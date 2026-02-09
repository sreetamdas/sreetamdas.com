export const OWNER_NAME = "Sreetam Das";
export const DEFAULT_REPO = {
	owner: "sreetamdas",
	repo: "sreetamdas.com",
};

type RuntimeEnv = Record<string, string | undefined>;

function getEnv(name: string) {
	const viteEnv = (import.meta as any)?.env as RuntimeEnv | undefined;
	if (viteEnv && typeof viteEnv[name] === "string") return viteEnv[name];

	const procEnv =
		typeof process !== "undefined" ? ((process as any).env as RuntimeEnv | undefined) : undefined;
	return procEnv?.[name];
}

// Prefer Vite-exposed env, but fall back to runtime origin (client)
// or the production domain.
export const SITE_URL =
	getEnv("VITE_SITE_URL") ??
	(typeof window !== "undefined" ? window.location.origin : "https://sreetamdas.com");
export const SITE_TITLE_APPEND = `| ${OWNER_NAME}`;
export const SITE_DESCRIPTION =
	"Senior software tinkerer from India. 💜 React, Elixir and TypeScript, CS and mechanical keyboards!";
export const SITE_OG_IMAGE = "/og-image.png";

export const IS_DEV =
	((import.meta as any)?.env?.DEV as boolean | undefined) ?? getEnv("NODE_ENV") === "development";
export const IS_DEBUG = getEnv("DEBUG_MODE") === "true";

/**
 * Check if the site is currently being built, to affect build-time behaviour.
 * @see https://vercel.com/docs/concepts/projects/environment-variables/system-environment-variables#system-environment-variables
 */
export const IS_CI = getEnv("CI") === "1";
