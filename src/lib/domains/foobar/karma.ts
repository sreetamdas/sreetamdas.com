/** Karma theme colour per tier, shared by the dashboard, toast and certificate. */
import { type FoobarStar, type FoobarTier } from "./catalog";

export const FOOBAR_TIER_TEXT_CLASS = {
	discovery: "text-karma-green",
	browser: "text-karma-cyan",
	archaeology: "text-karma-yellow",
	protocol: "text-karma-pink",
	meta: "text-karma-lavender",
} as const satisfies Record<FoobarTier, string>;

export const FOOBAR_STAR_TEXT_CLASS = {
	gold: "text-karma-yellow",
	silver: "text-karma-silver",
} as const satisfies Record<FoobarStar, string>;

export const FOOBAR_GLOW_CLASS = "[text-shadow:0_0_5px_currentColor]";
