import React, { useState, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
import {
	FaGithub,
	FaTwitter,
	FaStackOverflow,
	FaLinkedin,
	FaEnvelope,
} from "react-icons/fa";
import { FiSun } from "react-icons/fi";
import { IoMdMoon } from "react-icons/io";
import { StyledLink } from "components/styled/blog";
import RoundedSquare from "public/roundedSquare.svg";
import { Layout } from "components/styled/Layouts";

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

const IconContainer = styled.a`
	color: var(--color-primary-accent);
	font-size: 25px;
`;

const Navbar = () => {
	const [darkTheme, setDarkTheme] = useState(undefined);
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
				document.documentElement.setAttribute("data-theme", "dark");
				window.localStorage.setItem("theme", "dark");
			} else {
				document.documentElement.removeAttribute("data-theme");
				window.localStorage.setItem("theme", "light");
			}
		}
	}, [darkTheme]);

	return (
		<Layout>
			<NavbarWithLogo>
				<Link href="/">
					<IconContainer>
						<RoundedSquare />
					</IconContainer>
				</Link>
				<NavbarWithNavs>
					<Link href="/blog">
						<StyledLink>blog</StyledLink>
					</Link>
					<Link href="/uses">
						<StyledLink>uses</StyledLink>
					</Link>
					<Link href="/about">
						<StyledLink>about</StyledLink>
					</Link>
					<IconContainer
						href="https://github.com/sreetamdas"
						target="_blank"
						rel="noopener noreferrer"
						title="Sreetam Das' GitHub"
					>
						<FaGithub />
					</IconContainer>
					<IconContainer
						href="https://twitter.com/_SreetamDas"
						target="_blank"
						rel="noopener noreferrer"
						title="Sreetam Das' Twitter"
					>
						<FaTwitter />
					</IconContainer>
					<IconContainer onClick={handleThemeSwitch}>
						{darkTheme === undefined ? (
							<div style={{ width: "25px" }} />
						) : darkTheme ? (
							<IoMdMoon />
						) : (
							<FiSun />
						)}
					</IconContainer>
				</NavbarWithNavs>
			</NavbarWithLogo>
		</Layout>
	);
};

export { Navbar };

export const ExternalLinksOverlay = () => {
	return (
		<NavbarWithNavs>
			<IconContainer
				href="https://twitter.com/_SreetamDas"
				target="_blank"
				rel="noopener noreferrer"
				title="Sreetam Das' GitHub"
			>
				<FaGithub />
			</IconContainer>
			<IconContainer
				href="https://twitter.com/_SreetamDas"
				target="_blank"
				rel="noopener noreferrer"
				title="Sreetam Das' Twitter"
			>
				<FaTwitter />
			</IconContainer>
			<IconContainer
				href="https://stackoverflow.com/users/5283213"
				target="_blank"
				rel="noopener noreferrer"
				title="Sreetam Das' StackOverflow"
			>
				<FaStackOverflow />
			</IconContainer>
			<IconContainer
				href="https://www.linkedin.com/in/sreetamdas"
				target="_blank"
				rel="noopener noreferrer"
				title="Sreetam Das' LinkedIn"
			>
				<FaLinkedin />
			</IconContainer>
			<IconContainer
				href="mailto:sreetam@sreetamdas.com"
				target="_blank"
				rel="noopener noreferrer"
				title="Send Mail to Sreetam Das"
			>
				<FaEnvelope />
			</IconContainer>
		</NavbarWithNavs>
	);
};
