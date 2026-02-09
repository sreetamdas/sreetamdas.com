export const OWNER_NAME = "Sreetam Das";
export const DEFAULT_REPO = {
	owner: "sreetamdas",
	repo: "sreetamdas.com",
};

function getProcessEnv(name: string): string | undefined {
	if (typeof process === "undefined") return undefined;
	return process.env?.[name];
}

function getViteEnvString(name: "VITE_SITE_URL"): string | undefined {
	// `import.meta.env` exists in Vite, but not when running plain Node (e.g. Velite).
	return (import.meta as unknown as { env?: Partial<ImportMetaEnv> }).env?.[name];
}

function getViteEnvBoolean(name: "DEV"): boolean | undefined {
	return (import.meta as unknown as { env?: Partial<ImportMetaEnv> }).env?.[name];
}

// Prefer Vite-exposed env, but fall back to runtime origin (client)
// or the production domain.
export const SITE_URL =
	getViteEnvString("VITE_SITE_URL") ??
	getProcessEnv("VITE_SITE_URL") ??
	(typeof window !== "undefined" ? window.location.origin : "https://sreetamdas.com");
export const SITE_TITLE_APPEND = `| ${OWNER_NAME}`;
export const SITE_DESCRIPTION =
	"Senior software tinkerer from India. 💜 React, Elixir and TypeScript, CS and mechanical keyboards!";
export const SITE_OG_IMAGE = "/og-image.png";

export const IS_DEV =
	getViteEnvBoolean("DEV") ?? getProcessEnv("NODE_ENV") === "development";
export const IS_DEBUG = getProcessEnv("DEBUG_MODE") === "true";

/**
 * Check if the site is currently being built, to affect build-time behaviour.
 * @see https://vercel.com/docs/concepts/projects/environment-variables/system-environment-variables#system-environment-variables
 */
export const IS_CI = getProcessEnv("CI") === "1";
