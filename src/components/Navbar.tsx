import { useRouter } from "next/router";
import React, {
	useState,
	useEffect,
	useContext,
	Fragment,
	cloneElement,
} from "react";
import {
	FaGithub,
	FaTwitter,
	FaStackOverflow,
	FaLinkedin,
	FaEnvelope,
	FaSteam,
	FaRedditAlien,
	FaSpotify,
	FaDiscord,
} from "react-icons/fa";
import { FiRss, FiSun } from "react-icons/fi";
import { IoMdMoon } from "react-icons/io";
import styled from "styled-components";

import { FoobarContext } from "components/foobar";
import { IconContainer, NextIconLink } from "styles/blog";
import { LinkTo } from "styles/typography";
import { TGlobalThemeObject } from "typings/styled";
import { checkIfNavbarShouldBeHidden } from "utils/misc";

const NavbarWithLogo = styled.div`
	padding: 20px 0;
	display: grid;
	grid-template-columns: repeat(2, auto);
	align-content: center;
	gap: 1rem;
`;

const NavbarWithNavs = styled.div`
	display: grid;
	grid-auto-flow: column;
	grid-template-columns: repeat(auto-fill, minmax(min-content, 1fr));
	grid-column-gap: 1rem;
	white-space: nowrap;
	justify-self: end;
	place-items: center;
	justify-content: center;
`;

const NavLink = styled(LinkTo)`
	border: none !important;
	color: var(--color-primary);

	&:hover {
		color: var(--color-primary-accent);
	}
`;

export const Navbar = ({
	currentTheme,
}: {
	currentTheme: TGlobalThemeObject["theme"];
}) => {
	const [darkTheme, setDarkTheme] = useState<boolean | undefined>(undefined);
	const [isNavbarShown, setIsNavbarShown] = useState(true);
	const { updateFoobarDataPartially, ...foobar } = useContext(FoobarContext);
	const { pathname } = useRouter();

	useEffect(() => {
		const root = window.document.documentElement;
		const initialColorValue: "light" | "dark" = root.style.getPropertyValue(
			"--initial-color-mode"
		) as "light" | "dark";
		setDarkTheme(initialColorValue === "dark");
	}, []);

	useEffect(() => {
		if (darkTheme !== undefined) {
			if (darkTheme) {
				document.documentElement.setAttribute(
					"data-theme",
					foobar.konami ? "batman" : "dark"
				);
				window.localStorage.setItem("theme", "dark");
			} else {
				document.documentElement.removeAttribute("data-theme");
				window.localStorage.setItem("theme", "light");
			}
		}
	}, [darkTheme, foobar.konami]);

	useEffect(() => {
		if (currentTheme) setDarkTheme(currentTheme === "dark");
	}, [currentTheme]);

	useEffect(() => {
		const handleKeyboardDarkModeToggle = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() === "l" && event.shiftKey && event.metaKey) {
				event.preventDefault();
				setDarkTheme(!darkTheme);
			}
		};
		window.addEventListener("keydown", handleKeyboardDarkModeToggle);

		return () => {
			window.removeEventListener("keydown", handleKeyboardDarkModeToggle);
		};
	}, [darkTheme]);

	useEffect(() => {
		setIsNavbarShown(!checkIfNavbarShouldBeHidden(pathname.slice(1)));
	}, [pathname]);

	const handleThemeSwitch = (event: React.MouseEvent) => {
		event.preventDefault();
		setDarkTheme(!darkTheme);
	};

	return isNavbarShown ? (
		<Fragment>
			<NavbarWithLogo>
				<NextIconLink href="/">
					<img src="/logo.svg" alt="logo" height="25px" width="25px" />
				</NextIconLink>
				<NavbarWithNavs>
					<NavLink href="/blog">blog</NavLink>
					<NavLink href="/uses">uses</NavLink>
					<NavLink href="/about">about</NavLink>
					<IconContainer
						href="https://github.com/sreetamdas"
						target="_blank"
						rel="noopener noreferrer"
						$styledOnHover
					>
						<FaGithub
							aria-label="Sreetam's GitHub"
							title="Sreetam Das' GitHub"
						/>
					</IconContainer>
					<IconContainer
						href="https://twitter.com/_SreetamDas"
						target="_blank"
						rel="noopener noreferrer"
						$styledOnHover
					>
						<FaTwitter
							aria-label="Sreetam Das' Twitter"
							title="Sreetam Das' Twitter"
						/>
					</IconContainer>
					<IconContainer
						href="https://sreetamdas.com/rss/feed.xml"
						$styledOnHover
					>
						<FiRss aria-label="Blog RSS feed" title="Blog RSS feed" />
					</IconContainer>
					<IconContainer onClick={handleThemeSwitch} href="#">
						{darkTheme === undefined ? (
							<div style={{ width: "25px" }} />
						) : darkTheme ? (
							<IoMdMoon
								aria-label="Switch to Light Mode"
								title="Switch to Light Mode"
							/>
						) : (
							<FiSun
								aria-label="Switch to Dark Mode"
								title="Switch to Dark Mode"
							/>
						)}
					</IconContainer>
				</NavbarWithNavs>
			</NavbarWithLogo>
		</Fragment>
	) : null;
};

type TExternalLinksArray = Array<{
	link: string;
	title: string;
	icon: JSX.Element;
}>;
export const ExternalLinksOverlay = () => {
	const externalLinks: TExternalLinksArray = [
		{
			link: "https://twitter.com/_SreetamDas",
			title: "Sreetam Das' GitHub",
			icon: <FaGithub />,
		},
		{
			link: "https://twitter.com/_SreetamDas",
			title: "Sreetam Das' Twitter",
			icon: <FaTwitter />,
		},
		{
			link: "https://stackoverflow.com/users/5283213",
			title: "Sreetam Das' StackOverflow",
			icon: <FaStackOverflow />,
		},
		{
			link: "https://www.linkedin.com/in/sreetamdas",
			title: "Sreetam Das' LinkedIn",
			icon: <FaLinkedin />,
		},
		{
			link: "mailto:sreetam@sreetamdas.com",
			title: "Send email to Sreetam Das",
			icon: <FaEnvelope />,
		},
		{
			link: "https://steamcommunity.com/id/sreetamdas",
			title: "Sreetam Das' Steam",
			icon: <FaSteam />,
		},
		{
			link: "https://giphy.com/gifs/LrmU6jXIjwziE/tile",
			title: "Sreetam Das' Reddit",
			icon: <FaRedditAlien />,
		},
		{
			link: "https://open.spotify.com/user/22nkuerb2tgjpqwhy4tp4aecq",
			title: "Sreetam Das' Spotify",
			icon: <FaSpotify />,
		},
		{
			link: "https://discord.gg/HGZc5G7CeR",
			title: "Join Sreetam Das' Discord server",
			icon: <FaDiscord />,
		},
	];

	const IconWithProps = ({
		icon,
		title,
	}: {
		icon: JSX.Element;
		title: string;
	}) => cloneElement(icon, { title });

	return (
		<NavbarWithNavs>
			{externalLinks.map(({ link, title, icon }) => (
				<IconContainer
					href={link}
					title={title}
					key={title}
					target="_blank"
					rel="noopener noreferrer"
				>
					<IconWithProps {...{ icon, title }} />
				</IconContainer>
			))}
		</NavbarWithNavs>
	);
};
