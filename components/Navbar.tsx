import React, { useState, useEffect, PropsWithChildren } from "react";
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
import { LinkTo } from "components/styled/blog";
import RoundedSquare from "public/roundedSquare.svg";
import { Layout } from "components/styled/Layouts";
import Link from "next/link";

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
	const [darkTheme, setDarkTheme] = useState<boolean | undefined>(undefined);
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

	const NextIconLink = ({
		children,
		href,
	}: PropsWithChildren<{ href: string }>) => {
		return (
			<Link href={href} passHref>
				<IconContainer href={href} tabIndex={0}>
					{children}
				</IconContainer>
			</Link>
		);
	};

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
					<IconContainer onClick={handleThemeSwitch} tabIndex={0}>
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
