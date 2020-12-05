/* eslint-disable indent */
import { useContext } from "react";
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
import styled, { css } from "styled-components";

import { FoobarContext } from "components/foobar";

export const ShowCompletedBadges = () => {
	const foobarContextObj = useContext(FoobarContext);
	const { completed } = foobarContextObj;

	const allBadges = Object.keys(FOOBAR_BADGES) as Array<TFOOBAR_PAGE_EACH>;

	const FoobarBadge = ({ badge }: { badge: TFOOBAR_PAGE_EACH }) => {
		const { icon: Icon } = FOOBAR_BADGES[badge];

		return <Icon aria-label={badge} />;
	};

	return (
		<AllBadgesContainer>
			{allBadges?.map((badge) => {
				// @ts-expect-error
				const badgeUnlocked = completed?.includes(badge);
				return (
					<BadgeBlock key={badge} unlocked={badgeUnlocked}>
						<FoobarBadge badge={badge} />
						<FoobarBadgeText>
							{FOOBAR_BADGES[badge].description}
						</FoobarBadgeText>
					</BadgeBlock>
				);
			})}
		</AllBadgesContainer>
	);
};

export const FOOBAR_PAGES: typeof TFOOBAR_PAGES = {
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
};

type TFOOBAR_PAGE_EACH =
	| typeof TFOOBAR_PAGES[keyof typeof FOOBAR_PAGES]
	| "completed";

type TFoobarBadgeRecord = {
	icon: (props: any) => JSX.Element;
	description: string;
};
type TFOOBAR_BADGES = Record<TFOOBAR_PAGE_EACH, TFoobarBadgeRecord>;
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
		description: "Go offline while Viewing a /foobar page",
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
	completed: {
		icon: (props) => <IoIosRocket {...props} />,
		description: "Complete all the tasks",
	},
};

const AllBadgesContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 1rem;
	padding: 50px 0;
`;

const BadgeBlock = styled.div<{ unlocked?: boolean }>`
	display: grid;
	grid-template-columns: max-content 1fr;
	grid-gap: 1rem;
	padding: 15px;
	font-size: 50px;
	border: 3px solid
		${({ unlocked }) =>
			unlocked
				? "var(--color-primary-accent)"
				: "var(--color-inlineCode-bg)"};
	border-radius: var(--border-radius);
	align-items: center;
	${({ unlocked }) =>
		unlocked
			? css`
					color: var(--color-primary-accent);
			  `
			: css`
					color: var(--color-inlineCode-bg);
			  `}
`;

const FoobarBadgeText = styled.p<{ isHintRevealed?: boolean }>`
	font-size: 16px;
	margin: 0;
	${({ isHintRevealed }) => isHintRevealed && css``}
`;
