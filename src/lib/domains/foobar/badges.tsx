import { clsx } from "clsx";
import { useState } from "react";
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

import { LinkTo } from "@/lib/components/Anchor";
import { type FoobarAchievement, type FoobarDataType } from "@/lib/domains/foobar/flags";

type ShowCompletedBadgesProps = Pick<FoobarDataType, "completed" | "allAchievements">;
export const ShowCompletedBadges = ({ completed, allAchievements }: ShowCompletedBadgesProps) => {
	const allBadges = Object.keys(FOOBAR_BADGES) as Array<FoobarAchievement>;

	return (
		<div>
			<h2 className="pt-24 font-serif text-4xl leading-normal">Completed challenges</h2>
			<p className="my-4">
				Here are badges for all the challenges that you&apos;ve completed so far.
				<br />
				Feel free to{" "}
				<LinkTo href="https://twitter.com/messages/compose?recipient_id=520276345" target="_blank">
					reach out to me
				</LinkTo>{" "}
				if you&apos;d like a clue or have any feedback!
				<br />
				<span className="text-xs italic opacity-50">
					Hint: you can click on a badge <code>5</code> times to reveal how to get it
				</span>
			</p>
			<div className="grid gap-6 py-12 md:grid-cols-2">
				{allBadges.map((badge) => (
					<Badge
						key={badge}
						badge={badge}
						completed={completed}
						allAchievements={allAchievements}
					/>
				))}
			</div>
		</div>
	);
};

type BadgeProps = {
	badge: FoobarAchievement;
} & Pick<FoobarDataType, "completed" | "allAchievements">;
const Badge = ({ badge, completed, allAchievements }: BadgeProps) => {
	const [clicks, setClicks] = useState(0);
	const isUnlocked = badge === "completed" ? allAchievements : completed.includes(badge);

	return (
		<button
			onClick={() => setClicks(clicks + 1)}
			className={clsx(
				"group grid grid-cols-[max-content_1fr] items-center gap-4 rounded-global border-2 p-4 text-4xl transition-colors",
				isUnlocked ? "border-primary text-primary" : "border-zinc-400 text-zinc-400",
			)}
		>
			<FoobarBadge badge={badge} />
			<p className={clsx("text-sm", isUnlocked || clicks >= 5 ? "inline" : "hidden")}>
				{FOOBAR_BADGES[badge].description}
			</p>
		</button>
	);
};

const FoobarBadge = ({ badge }: { badge: FoobarAchievement }) => {
	const { icon: Icon } = FOOBAR_BADGES[badge];
	return <Icon aria-label={badge} className="text-5xl" />;
};

type FoobarBadgeRecord = {
	icon: (props: IconBaseProps) => JSX.Element;
	description: string | JSX.Element;
};
type FoobarBadges = Readonly<Record<FoobarAchievement, FoobarBadgeRecord>>;

export const FOOBAR_BADGES: FoobarBadges = {
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
