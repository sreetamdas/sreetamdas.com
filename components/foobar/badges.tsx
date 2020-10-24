import { BsEgg } from "react-icons/bs";
import {
	FaCode,
	FaCompass,
	FaDog,
	FaGamepad,
	FaHeading,
	FaRegFlag,
	FaSkull,
} from "react-icons/fa";
import { IoIosRocket } from "react-icons/io";
import { MdDns } from "react-icons/md";
import { RiWifiOffLine } from "react-icons/ri";
import { VscDebug, VscTelescope } from "react-icons/vsc";

import { FOOBAR_PAGES } from "pages/foobar";

/**
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
	"404": "404",
	dogs: "dogs",
 */

type TFOOBAR_PAGE_EACH =
	| typeof TFOOBAR_PAGES[keyof typeof FOOBAR_PAGES]
	| "completed";
type TFOOBAR_BADGES = Record<TFOOBAR_PAGE_EACH, JSX.Element>;
export const FOOBAR_BADGES: TFOOBAR_BADGES = {
	"source-code": <FaCode />,
	headers: <FaHeading />,
	"dns-txt": <MdDns />,
	devtools: <VscDebug />,
	konami: <FaGamepad />,
	offline: <RiWifiOffLine />,
	hack: <FaSkull />,
	dogs: <FaDog />,
	"404": <VscTelescope />,
	navigator: <FaCompass />,
	"easter-egg": <BsEgg />,
	"/": <FaRegFlag />,
	completed: <IoIosRocket />,
};

// IoIosRocket
