export const OWNER = process.env.OWNER;
export const DEFAULT_REPO = {
	owner: "sreetamdas",
	repo: "sreetamdas.com",
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const SITE_URL = process.env.SITE_URL!;

export const IS_DEV = process.env.NODE_ENV === "development";

export const IS_DEBUG = process.env.DEBUG_MODE === "true";
