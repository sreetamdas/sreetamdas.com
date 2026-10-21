/**
 * Canonical achievement catalogue for /foobar. Slugged entries become routable
 * challenge pages. Entries the game completes itself (navigator, konami, 404,
 * dogs, offline, easter-egg, campfire) have no slug, so a guessed URL cannot skip them.
 * "completed" has a slug, but only awards once every puzzle tier is finished.
 */
import { type IconBaseProps } from "react-icons";
import { BsEgg } from "react-icons/bs";
import {
	FaCode,
	FaCompass,
	FaCookieBite,
	FaDatabase,
	FaDog,
	FaFileAlt,
	FaFire,
	FaGamepad,
	FaGlobe,
	FaHeading,
	FaPrint,
	FaQrcode,
	FaRegFlag,
	FaRegEye,
	FaRobot,
	FaRss,
	FaSkull,
} from "react-icons/fa";
import { GiTeapot } from "react-icons/gi";
import { IoIosRocket } from "react-icons/io";
import { MdDns } from "react-icons/md";
import { RiWifiOffLine } from "react-icons/ri";
import { VscDebug, VscDebugRestart, VscTelescope } from "react-icons/vsc";

import { Code } from "@/lib/components/Typography";

import { FOOBAR_ACHIEVEMENTS } from "./catalog";
import { FOOBAR_REWARD_ADDRESSES } from "./codes";

type FoobarFlags = typeof FOOBAR_FLAGS;

/**
 * All flags, _including_ the "completed" achievement
 */
export type FoobarFlag = FoobarFlags[keyof FoobarFlags]["name"];

/**
 * Navigable challenge pages, so _excluding_ programmatic achievements
 */
export type FoobarNavigableFlag = {
	[K in keyof FoobarFlags]: "slug" extends keyof FoobarFlags[K] ? K : never;
}[keyof FoobarFlags];

export type FoobarFlagPageSlug = FoobarFlags[FoobarNavigableFlag]["slug"];

export const FOOBAR_FLAGS = {
	unlocked: {
		...FOOBAR_ACHIEVEMENTS.unlocked,
		name: "unlocked",
		slug: "/",
		icon: (props: IconBaseProps) => <FaRegFlag {...props} />,
		description: "Discover the foobar homepage (you're here!)",
	},
	"source-code": {
		...FOOBAR_ACHIEVEMENTS["source-code"],
		name: "source-code",
		slug: FOOBAR_REWARD_ADDRESSES["source-code"],
		icon: (props: IconBaseProps) => <FaCode {...props} />,
		description: "View the source code",
	},
	headers: {
		...FOOBAR_ACHIEVEMENTS.headers,
		name: "headers",
		slug: FOOBAR_REWARD_ADDRESSES.headers,
		icon: (props: IconBaseProps) => <FaHeading {...props} />,
		description: "Check out the headers of a /foobar page",
	},
	"dns-txt": {
		...FOOBAR_ACHIEVEMENTS["dns-txt"],
		name: "dns-txt",
		slug: FOOBAR_REWARD_ADDRESSES["dns-txt"],
		icon: (props: IconBaseProps) => <MdDns {...props} />,
		description: "Lookup TXT records",
	},
	"well-known": {
		...FOOBAR_ACHIEVEMENTS["well-known"],
		name: "well-known",
		slug: FOOBAR_REWARD_ADDRESSES["well-known"],
		icon: (props: IconBaseProps) => <FaGlobe {...props} />,
		description: "Read the notice in a well-known place",
	},
	campfire: {
		...FOOBAR_ACHIEVEMENTS.campfire,
		name: "campfire",
		icon: (props: IconBaseProps) => <FaFire {...props} />,
		description: "Meet another hunter at the campfire",
	},
	"print-preview": {
		...FOOBAR_ACHIEVEMENTS["print-preview"],
		name: "print-preview",
		slug: FOOBAR_REWARD_ADDRESSES["print-preview"],
		icon: (props: IconBaseProps) => <FaPrint {...props} />,
		description: "Find the note meant for paper",
	},
	"paper-trail": {
		...FOOBAR_ACHIEVEMENTS["paper-trail"],
		name: "paper-trail",
		slug: FOOBAR_REWARD_ADDRESSES["paper-trail"],
		icon: (props: IconBaseProps) => <FaFileAlt {...props} />,
		description: "Read the site's machine-facing rules",
	},
	"feed-reader": {
		...FOOBAR_ACHIEVEMENTS["feed-reader"],
		name: "feed-reader",
		slug: FOOBAR_REWARD_ADDRESSES["feed-reader"],
		icon: (props: IconBaseProps) => <FaRss {...props} />,
		description: "Inspect the RSS feed",
	},
	"og-qr": {
		...FOOBAR_ACHIEVEMENTS["og-qr"],
		name: "og-qr",
		slug: FOOBAR_REWARD_ADDRESSES["og-qr"],
		icon: (props: IconBaseProps) => <FaQrcode {...props} />,
		description: "Scan the site's social card",
	},
	"cookie-jar": {
		...FOOBAR_ACHIEVEMENTS["cookie-jar"],
		name: "cookie-jar",
		slug: FOOBAR_REWARD_ADDRESSES["cookie-jar"],
		icon: (props: IconBaseProps) => <FaCookieBite {...props} />,
		description: "Open the server's sealed cookie",
	},
	"service-worker": {
		...FOOBAR_ACHIEVEMENTS["service-worker"],
		name: "service-worker",
		slug: FOOBAR_REWARD_ADDRESSES["service-worker"],
		icon: (props: IconBaseProps) => <FaRobot {...props} />,
		description: "Ask the invisible worker for its clue",
	},
	devtools: {
		...FOOBAR_ACHIEVEMENTS.devtools,
		name: "devtools",
		slug: FOOBAR_REWARD_ADDRESSES.devtools,
		icon: (props: IconBaseProps) => <VscDebug {...props} />,
		description: "Inspect the dashboard with devtools",
	},
	konami: {
		...FOOBAR_ACHIEVEMENTS.konami,
		name: "konami",
		icon: (props: IconBaseProps) => <FaGamepad {...props} />,
		description: "Use the Konami code",
	},
	offline: {
		...FOOBAR_ACHIEVEMENTS.offline,
		name: "offline",
		icon: (props: IconBaseProps) => <RiWifiOffLine {...props} />,
		description: "Go offline while viewing a /foobar page",
	},
	"tab-visibility": {
		...FOOBAR_ACHIEVEMENTS["tab-visibility"],
		name: "tab-visibility",
		slug: FOOBAR_REWARD_ADDRESSES["tab-visibility"],
		icon: (props: IconBaseProps) => <FaRegEye {...props} />,
		description: "Look away while Foobar is open",
	},
	hack: {
		...FOOBAR_ACHIEVEMENTS.hack,
		name: "hack",
		slug: FOOBAR_REWARD_ADDRESSES.hack,
		icon: (props: IconBaseProps) => <FaSkull {...props} />,
		description: "Hack the console",
	},
	error404: {
		...FOOBAR_ACHIEVEMENTS.error404,
		name: "error404",
		icon: (props: IconBaseProps) => <VscTelescope {...props} />,
		description: "Hit a 404 error page",
	},
	dogs: {
		...FOOBAR_ACHIEVEMENTS.dogs,
		name: "dogs",
		icon: (props: IconBaseProps) => <FaDog {...props} />,
		description: "Explore the 404 page",
	},
	navigator: {
		...FOOBAR_ACHIEVEMENTS.navigator,
		name: "navigator",
		icon: (props: IconBaseProps) => <FaCompass {...props} />,
		description: "Visit 5 unique pages",
	},
	"easter-egg": {
		...FOOBAR_ACHIEVEMENTS["easter-egg"],
		name: "easter-egg",
		icon: (props: IconBaseProps) => <BsEgg {...props} />,
		description: "Hmm, what could this one be?",
	},
	localforage: {
		...FOOBAR_ACHIEVEMENTS.localforage,
		name: "localforage",
		slug: FOOBAR_REWARD_ADDRESSES.localforage,
		icon: (props: IconBaseProps) => <FaDatabase {...props} />,
		description: "Check storage",
	},
	teapot: {
		...FOOBAR_ACHIEVEMENTS.teapot,
		name: "teapot",
		slug: FOOBAR_REWARD_ADDRESSES.teapot,
		icon: (props: IconBaseProps) => <GiTeapot {...props} />,
		description: (
			<>
				Brew some <Code>/api/coffee</Code>
			</>
		),
	},
	restart: {
		name: "restart",
		icon: (props: IconBaseProps) => <VscDebugRestart {...props} />,
		description: "Reset",
	},
	completed: {
		...FOOBAR_ACHIEVEMENTS.completed,
		name: "completed",
		slug: FOOBAR_REWARD_ADDRESSES.completed,
		icon: (props: IconBaseProps) => <IoIosRocket {...props} />,
		description: "Capture all the flags",
	},
} as const;
