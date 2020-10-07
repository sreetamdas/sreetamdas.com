import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import {
	FaGithub,
	FaTwitter,
	FaStackOverflow,
	FaLinkedin,
	FaEnvelope,
	FaSteam,
	FaRedditAlien,
	FaSpotify,
} from "react-icons/fa";
import { FiSun } from "react-icons/fi";
import { IoMdMoon } from "react-icons/io";
import { IconContainer, LinkTo, NextIconLink } from "styles/blog";
import RoundedSquare from "public/roundedSquare.svg";
import { Layout } from "styles/layouts";
import { FoobarContext } from "components/foobar";
import { TGlobalThemeObject } from "typings/styled";

const NavbarWithLogo = styled.div`
	padding: 20px 0;
	display: grid;
	grid-template-columns: repeat(2, auto);
	align-content: center;
	grid-gap: 1rem;
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

const Navbar = ({
	currentTheme,
}: {
	currentTheme: TGlobalThemeObject["theme"];
}) => {
	const [darkTheme, setDarkTheme] = useState<boolean | undefined>(undefined);
	const { updateFoobarDataPartially, ...foobar } = useContext(
		FoobarContext
	) as TFoobarContext;
	const handleThemeSwitch = (event: React.MouseEvent) => {
		event.preventDefault();
		setDarkTheme(!darkTheme);
	};

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
			if (
				event.key.toLowerCase() === "l" &&
				event.shiftKey &&
				event.metaKey
			)
				setDarkTheme(!darkTheme);
		};
		window.addEventListener("keydown", handleKeyboardDarkModeToggle);

		return () => {
			window.removeEventListener("keydown", handleKeyboardDarkModeToggle);
		};
	}, [darkTheme]);

	return (
		<Layout>
			<NavbarWithLogo>
				<NextIconLink href="/">
					<RoundedSquare
						aria-label="Home &mdash; Sreetam Das"
						title="Home &mdash; Sreetam Das"
					/>
				</NextIconLink>
				<NavbarWithNavs>
					<LinkTo href="/blog">blog</LinkTo>
					<LinkTo href="/uses">uses</LinkTo>
					<LinkTo href="/about">about</LinkTo>
					<IconContainer
						href="https://github.com/sreetamdas"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FaGithub
							aria-label="Sreetam's GitHub"
							title="Sreetam's GitHub"
						/>
					</IconContainer>
					<IconContainer
						href="https://twitter.com/_SreetamDas"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FaTwitter
							aria-label="Sreetam Das' Twitter"
							title="Sreetam Das' Twitter"
						/>
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
		</Layout>
	);
};

export { Navbar };

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
			title: "Send Mail to Sreetam Das",
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
	];

	return (
		<NavbarWithNavs>
			{externalLinks.map((linkObject) => (
				<IconContainer
					href={linkObject.link}
					title={linkObject.title}
					key={linkObject.title}
					target="_blank"
					rel="noopener noreferrer"
				>
					{linkObject.icon}
				</IconContainer>
			))}
		</NavbarWithNavs>
	);
};
