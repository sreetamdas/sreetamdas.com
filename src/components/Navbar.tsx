import { AnimatePresence, motion, Variants } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState, useEffect, useContext, Fragment, cloneElement } from "react";
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
import { FiRss, FiSun, FiMenu } from "react-icons/fi";
import { IoMdMoon } from "react-icons/io";
import styled, { css, ThemeContext } from "styled-components";

import { FoobarContext } from "components/foobar";
import { IconContainer, NextIconLink } from "styles/blog";
import { FullWidth } from "styles/layouts";
import { LinkTo } from "styles/typography";
import { useBreakpointRange } from "utils/hooks";
import { checkIfNavbarShouldBeHidden } from "utils/misc";
import { breakpoint } from "utils/style";

export const Navbar = () => {
	const [isNavbarShown, setIsNavbarShown] = useState(true);
	const { pathname } = useRouter();

	useEffect(() => {
		setIsNavbarShown(!checkIfNavbarShouldBeHidden(pathname.slice(1)));
	}, [pathname]);

	return isNavbarShown ? (
		<Fragment>
			<Nav>
				<NextIconLink href="/">
					<NavbarLogo
						width="25"
						height="25"
						viewBox="0 0 25 25"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<rect width="25" height="25" rx="6" fill="currentColor" />
					</NavbarLogo>
				</NextIconLink>
				<NavbarMenu />
			</Nav>
		</Fragment>
	) : null;
};

const NavLinks = () => (
	<Fragment>
		<PageLinks>
			<li>
				<NavLink href="/blog">blog</NavLink>
			</li>
			<li>
				<NavLink href="/uses">uses</NavLink>
			</li>
			<li>
				<NavLink href="/about">about</NavLink>
			</li>
		</PageLinks>
		<IconLinks>
			<li>
				<IconContainer
					href="https://github.com/sreetamdas"
					target="_blank"
					rel="noopener noreferrer"
					$styledOnHover
				>
					<FaGithub aria-label="Sreetam's GitHub" title="Sreetam Das' GitHub" />
				</IconContainer>
			</li>
			<li>
				<IconContainer
					href="https://twitter.com/_SreetamDas"
					target="_blank"
					rel="noopener noreferrer"
					$styledOnHover
				>
					<FaTwitter aria-label="Sreetam Das' Twitter" title="Sreetam Das' Twitter" />
				</IconContainer>
			</li>
			<li>
				<IconContainer href="https://sreetamdas.com/rss/feed.xml" $styledOnHover>
					<FiRss aria-label="Blog RSS feed" title="Blog RSS feed" />
				</IconContainer>
			</li>
		</IconLinks>
	</Fragment>
);

const variants: Variants = {
	open: { x: 0 },
	closed: { x: "-100%" },
};

const NavbarMenu = () => {
	const [darkTheme, setDarkTheme] = useState<boolean | undefined>(undefined);
	const { theme, changeThemeVariant } = useContext(ThemeContext);
	const { konami } = useContext(FoobarContext);
	const [showDrawer, setShowDrawer] = useState(false);

	const handleMobileOnEnter = () => {
		// eslint-disable-next-line no-console
		console.log("enter");
	};

	const handleMobileOnLeave = () => {
		// eslint-disable-next-line no-console
		console.log("leave");
	};

	useBreakpointRange({ to: "md" }, { onEnter: handleMobileOnEnter, onLeave: handleMobileOnLeave });

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
				document.documentElement.setAttribute("data-theme", konami ? "batman" : "dark");
				changeThemeVariant("dark");
				window.localStorage.setItem("theme", "dark");
			} else {
				document.documentElement.removeAttribute("data-theme");
				changeThemeVariant("light");
				window.localStorage.setItem("theme", "light");
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [darkTheme, konami]);

	useEffect(() => {
		if (theme) setDarkTheme(theme === "dark");
	}, [theme]);

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

	const handleThemeSwitch = (event: React.MouseEvent) => {
		event.preventDefault();
		setDarkTheme(!darkTheme);
	};

	const handleToggleDrawer = () => {
		setShowDrawer((showDrawer) => !showDrawer);
	};

	return (
		<AnimatePresence>
			<NavContainer $showDrawer={showDrawer}>
				<NavLinksDesktop>
					<NavLinks />
				</NavLinksDesktop>
				<ThemeSwitch onClick={handleThemeSwitch}>
					{darkTheme === undefined ? (
						<div style={{ width: "25px" }} />
					) : darkTheme ? (
						<IoMdMoon aria-label="Switch to Light Mode" title="Switch to Light Mode" />
					) : (
						<FiSun aria-label="Switch to Dark Mode" title="Switch to Dark Mode" />
					)}
				</ThemeSwitch>
				<MobileMenuToggle onClick={handleToggleDrawer}>
					<FiMenu />
				</MobileMenuToggle>
			</NavContainer>
			<FullScreenWrapper
				variants={variants}
				initial="closed"
				animate={showDrawer ? "open" : "closed"}
			>
				<NavLinks />
			</FullScreenWrapper>
		</AnimatePresence>
	);
};

const Nav = styled.nav`
	padding: 20px 0;
	display: grid;
	grid-template-columns: max-content auto;
	align-content: center;
	gap: 2rem;
`;

const Container = styled.div`
	display: grid;
	grid-auto-flow: column;
	gap: 1rem;
	justify-self: end;
	place-items: center;
	justify-content: center;
`;

const PlatformLinksContainer = styled(Container)`
	${breakpoint.until.md(css`
		display: flex;
		flex-wrap: wrap;
		padding: 0 3rem;
	`)}
`;

const NavLink = styled(LinkTo)`
	border: none !important;
	color: var(--color-primary);

	&:hover {
		color: var(--color-primary-accent);
	}
`;

const NavbarLogo = styled.svg`
	color: var(--color-primary-accent);
	fill: var(--color-primary-accent);
`;

const ThemeSwitch = styled(IconContainer).attrs({ as: "button" })``;

const MobileMenuToggle = styled(IconContainer).attrs({ as: "button" })`
	z-index: 10;
	color: var(--color-primary-accent);

	${breakpoint.from.md(css`
		color: var(--color-secondary-accent);
	`)}
`;

const navLinksMixin = css`
	display: contents;
	list-style: none;
`;

const PageLinks = styled.ul`
	${navLinksMixin}
`;

const IconLinks = styled.ul`
	${navLinksMixin}
`;

const NavLinksDesktop = styled.div`
	display: none;
	${breakpoint.from.md(css`
		display: contents;
	`)}
`;

const FullScreenWrapper = styled(motion(FullWidth))`
	height: 100vh;
	position: absolute;

	${breakpoint.from.md(css`
		display: none;
	`)}
`;

const NavContainer = styled(motion(Container))<{ $showDrawer: boolean }>``;

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

	const IconWithProps = ({ icon, title }: { icon: JSX.Element; title: string }) =>
		cloneElement(icon, { title });

	return (
		<PlatformLinksContainer>
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
		</PlatformLinksContainer>
	);
};
