export const OWNER = process.env.OWNER;
export const DEFAULT_REPO = {
	owner: "sreetamdas",
	repo: "sreetamdas.com",
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const SITE_URL = process.env.SITE_URL!;
export const SITE_TITLE_APPEND = "| Sreetam Das";

export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_DEBUG = process.env.DEBUG_MODE === "true";

/**
 * Check if the site is currently being built, to affect build-time behaviour—only exposed during build step
 * @see https://vercel.com/docs/concepts/projects/environment-variables/system-environment-variables#system-environment-variables
 */
export const IS_CI = process.env.CI === "1";
