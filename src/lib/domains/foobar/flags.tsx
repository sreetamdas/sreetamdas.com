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

export const FOOBAR_PAGES = {
	sourceCode: "source-code",
	headers: "headers",
	DNS_TXT: "dns-txt",
	easterEgg: "easter-egg",
	index: "/",
	devtools: "devtools",
	navigator: "navigator",
	konami: "konami",
	offline: "offline",
	hack: "hack",
	notFound: "error404",
	dogs: "dogs",
	localforage: "localforage",
	teapot: "teapot",
} as const;

export type FoobarPageSlug = (typeof FOOBAR_PAGES)[keyof typeof FOOBAR_PAGES];
export type FoobarAchievement = FoobarPageSlug | "completed";

type FoobarChallengeProps = {
	icon: (props: IconBaseProps) => JSX.Element;
	description: string | JSX.Element;
};

export type FoobarChallenges = Readonly<Record<FoobarAchievement, FoobarChallengeProps>>;
export const FOOBAR_CHALLENGES: FoobarChallenges = {
	"/": {
		icon: (props) => <FaRegFlag {...props} />,
		description: "Discover the foobar homepage (you're here!)",
	},
	"source-code": {
		icon: (props) => <FaCode {...props} />,
		description: "View the source code",
	},
	headers: {
		icon: (props) => <FaHeading {...props} />,
		description: "Check out the headers of a /foobar page",
	},
	"dns-txt": {
		icon: (props) => <MdDns {...props} />,
		description: "Lookup the DNS TXT records",
	},
	devtools: {
		icon: (props) => <VscDebug {...props} />,
		description: "Check out the React Devtools",
	},
	konami: {
		icon: (props) => <FaGamepad {...props} />,
		description: "Use the Konami code",
	},
	offline: {
		icon: (props) => <RiWifiOffLine {...props} />,
		description: "Go offline while viewing a /foobar page",
	},
	hack: {
		icon: (props) => <FaSkull {...props} />,
		description: "Hack the console",
	},
	error404: {
		icon: (props) => <VscTelescope {...props} />,
		description: "Hit a 404 error page",
	},
	dogs: {
		icon: (props) => <FaDog {...props} />,
		description: "Check out the link on the 404 page",
	},
	navigator: {
		icon: (props) => <FaCompass {...props} />,
		description: "Visit 5 unique pages",
	},
	"easter-egg": {
		icon: (props) => <BsEgg {...props} />,
		description: "Hmm, what could this one be?",
	},
	localforage: {
		icon: (props) => <FaDatabase {...props} />,
		description: "Check the localStorage/indexedDB",
	},
	teapot: {
		icon: (props) => <GiTeapot {...props} />,
		description: (
			<>
				Brew some <code>/api/coffee</code>
			</>
		),
	},
	completed: {
		icon: (props) => <IoIosRocket {...props} />,
		description: "Complete all the tasks",
	},
} as const;
