/**
 * Reward addresses shared by the route catalogue, code-level clues, build
 * scripts, and tests. Kept free of React so non-UI callers can import it.
 */
export const FOOBAR_REWARD_ADDRESSES = {
	"source-code": "skeleton-key",
	headers: "duck-and-cover",
	"dns-txt": "unlisted-number",
	"well-known": "bulletin-board",
	"print-preview": "hard-copy",
	"paper-trail": "disallowed",
	"feed-reader": "plus-one",
	"og-qr": "sleight-of-hand",
	"cookie-jar": "forty-thieves",
	"service-worker": "works-from-home",
	devtools: "x-ray-specs",
	"tab-visibility": "peekaboo",
	hack: "there-there",
	localforage: "farmers-market",
	teapot: "milk-no-sugar",
} as const;

export type FoobarRewardFlag = keyof typeof FOOBAR_REWARD_ADDRESSES;

export function getFoobarRewardPath(flag: FoobarRewardFlag): string {
	return `/foobar/${FOOBAR_REWARD_ADDRESSES[flag]}`;
}
