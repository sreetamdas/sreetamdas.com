/* eslint-disable indent */
import { useContext, useState } from "react";
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
import { IoIosRocket } from "react-icons/io";
import { MdDns } from "react-icons/md";
import { RiWifiOffLine } from "react-icons/ri";
import { VscDebug, VscTelescope } from "react-icons/vsc";
import styled, { css } from "styled-components";

import { FoobarContext } from "components/foobar";
import { TFoobarData, TFoobarPage } from "typings/console";
import { breakpoint } from "utils/style";

const FoobarBadge = ({ badge }: { badge: TFoobarBadge }) => {
	const { icon: Icon } = FOOBAR_BADGES[badge];
	return <Icon aria-label={badge} />;
};

type TBadgeProps = {
	badge: TFoobarBadge;
} & Pick<TFoobarData, "completed" | "allAchievements">;
const Badge = ({ badge, completed, allAchievements }: TBadgeProps) => {
	const [clicks, setClicks] = useState(0);
	const badgeUnlocked =
		badge === "completed" ? allAchievements : completed.includes(badge);

	return (
		<BadgeBlock
			$unlocked={badgeUnlocked}
			$showHint={clicks >= 5}
			onClick={() => setClicks(clicks + 1)}
		>
			<FoobarBadge badge={badge} />
			<FoobarBadgeText>
				{FOOBAR_BADGES[badge].description}
			</FoobarBadgeText>
		</BadgeBlock>
	);
};

const renderBadges = (
	allBadges: Array<TFoobarBadge>,
	completed: Array<TFoobarPage>,
	allAchievements: boolean
) => {
	return allBadges.map((badge) => (
		<Badge key={badge} {...{ badge, completed, allAchievements }} />
	));
};

export const ShowCompletedBadges = () => {
	const { completed, allAchievements } = useContext(FoobarContext);
	const allBadges = Object.keys(FOOBAR_BADGES) as Array<TFoobarBadge>;

	return (
		<div>
			Here are your completed challenges:
			<AllBadgesContainer>
				{renderBadges(allBadges, completed, allAchievements)}
			</AllBadgesContainer>
		</div>
	);
};

type TFoobarBadge = TFoobarPage | "completed";

type TFoobarBadgeRecord = {
	icon: (props: any) => JSX.Element;
	description: string;
};
type TFOOBAR_BADGES = Readonly<Record<TFoobarBadge, TFoobarBadgeRecord>>;

export const FOOBAR_BADGES: TFOOBAR_BADGES = {
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
	"easter-egg": { icon: (props) => <BsEgg {...props} />, description: "" },
	localforage: {
		icon: (props) => <FaDatabase {...props} />,
		description: "Check the local storage/indexedDB",
	},
	completed: {
		icon: (props) => <IoIosRocket {...props} />,
		description: "Complete all the tasks",
	},
} as const;

const AllBadgesContainer = styled.div`
	display: grid;
	grid-gap: 1rem;
	padding: 50px 0;

	${breakpoint.from.md(css`
		grid-template-columns: 1fr 1fr;
	`)}
`;

const FoobarBadgeText = styled.p`
	font-size: 16px;
	margin: 0;
`;

const BadgeBlock = styled.div<{ $unlocked?: boolean; $showHint: boolean }>`
	display: grid;
	grid-template-columns: max-content 1fr;
	grid-gap: 1rem;
	padding: 15px;
	font-size: 50px;
	border-radius: var(--border-radius);
	align-items: center;

	${({ $unlocked, $showHint }) =>
		!$unlocked &&
		!$showHint &&
		css`
			${FoobarBadgeText} {
				display: none;
			}
		`}
	${({ $unlocked }) =>
		$unlocked
			? css`
					border: 3px solid var(--color-primary-accent);
					color: var(--color-primary-accent);
			  `
			: css`
					border: 3px solid var(--color-inlineCode-bg);
					color: var(--color-inlineCode-bg);
			  `}
`;
