import { type IconBaseProps } from "react-icons";
import { BsEgg } from "react-icons/bs";
import {
	FaCode,
	FaCompass,
	FaDatabase,
	FaDog,
	FaGamepad,
	FaHeading,
	FaRegFlag,
	FaSkull,
} from "react-icons/fa";
import { GiTeapot } from "react-icons/gi";
import { IoIosRocket } from "react-icons/io";
import { MdDns } from "react-icons/md";
import { RiWifiOffLine } from "react-icons/ri";
import { VscDebug, VscTelescope } from "react-icons/vsc";

import { Code } from "@/lib/components/Typography";

type FoobarFlags = typeof FOOBAR_FLAGS;

/**
 * All flags, _including_ the "completed" achievement
 */
export type FoobarFlag = FoobarFlags[keyof FoobarFlags]["name"];

/**
 * Navigable challenge pages, so _excluding_ "completed"
 */
export type FoobarNavigableFlag = {
	[K in keyof FoobarFlags]: "slug" extends keyof FoobarFlags[K] ? K : never;
}[keyof FoobarFlags];

export type FoobaFlagPageSlug = FoobarFlags[FoobarNavigableFlag]["slug"];

export const FOOBAR_FLAGS = {
	unlocked: {
		name: "unlocked",
		slug: "/",
		icon: (props: IconBaseProps) => <FaRegFlag {...props} />,
		description: "Discover the foobar homepage (you're here!)",
	},
	"source-code": {
		name: "source-code",
		slug: "source-code",
		icon: (props: IconBaseProps) => <FaCode {...props} />,
		description: "View the source code",
	},
	headers: {
		name: "headers",
		slug: "headers",
		icon: (props: IconBaseProps) => <FaHeading {...props} />,
		description: "Check out the headers of a /foobar page",
	},
	"dns-txt": {
		name: "dns-txt",
		slug: "dns-txt",
		icon: (props: IconBaseProps) => <MdDns {...props} />,
		description: "Lookup the DNS TXT records",
	},
	devtools: {
		name: "devtools",
		slug: "devtools",
		icon: (props: IconBaseProps) => <VscDebug {...props} />,
		description: "Check out the React Devtools",
	},
	konami: {
		name: "konami",
		slug: "konami",
		icon: (props: IconBaseProps) => <FaGamepad {...props} />,
		description: "Use the Konami code",
	},
	offline: {
		name: "offline",
		slug: "offline",
		icon: (props: IconBaseProps) => <RiWifiOffLine {...props} />,
		description: "Go offline while viewing a /foobar page",
	},
	hack: {
		name: "hack",
		slug: "hack",
		icon: (props: IconBaseProps) => <FaSkull {...props} />,
		description: "Hack the console",
	},
	error404: {
		name: "error404",
		slug: "404",
		icon: (props: IconBaseProps) => <VscTelescope {...props} />,
		description: "Hit a 404 error page",
	},
	dogs: {
		name: "dogs",
		slug: "dogs",
		icon: (props: IconBaseProps) => <FaDog {...props} />,
		description: "Check out the link on the 404 page",
	},
	navigator: {
		name: "navigator",
		slug: "navigator",
		icon: (props: IconBaseProps) => <FaCompass {...props} />,
		description: "Visit 5 unique pages",
	},
	"easter-egg": {
		name: "easter-egg",
		slug: "easter-egg",
		icon: (props: IconBaseProps) => <BsEgg {...props} />,
		description: "Hmm, what could this one be?",
	},
	localforage: {
		name: "localforage",
		slug: "localforage",
		icon: (props: IconBaseProps) => <FaDatabase {...props} />,
		description: "Check storage",
	},
	teapot: {
		name: "teapot",
		slug: "teapot",
		icon: (props: IconBaseProps) => <GiTeapot {...props} />,
		description: (
			<>
				Brew some <Code>/api/coffee</Code>
			</>
		),
	},
	completed: {
		name: "completed",
		icon: (props: IconBaseProps) => <IoIosRocket {...props} />,
		description: "Capture all the flags",
	},
} as const;
