export const OWNER = process.env.OWNER;
export const DEFAULT_REPO = {
	owner: "sreetamdas",
	repo: "sreetamdas.com",
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const SITE_URL = process.env.SITE_URL!;

export const IS_DEV =
	typeof process.env.DEBUG_MODE !== "undefined"
		? process.env.DEBUG_MODE === "true"
		: process.env.NODE_ENV === "development";
