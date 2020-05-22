import React, { useState, useLayoutEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { FiSun } from "react-icons/fi";
import { IoMdMoon } from "react-icons/io";
import { ExternalLink } from "components/Layouts";
import OrangeSquare from "public/orangeSquare.svg";

const NavbarWithLogo = styled.div`
	width: 100%;
	max-width: 550px;
	padding: 20px 40px;
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
	align-items: center;
`;

const IconContainer = styled.a`
	color: var(--color-primary-accent);
	font-size: 25px;
`;

const Navbar = () => {
	const [darkTheme, setDarkTheme] = useState(false);
	const handleThemeSwitch = (event: React.MouseEvent) => {
		event.preventDefault();
		setDarkTheme(!darkTheme);
	};

	useLayoutEffect(() => {
		if (darkTheme)
			document.documentElement.setAttribute("data-theme", "dark");
		else document.documentElement.removeAttribute("data-theme");
	}, [darkTheme]);

	return (
		<NavbarWithLogo>
			<Link href="/">
				<IconContainer>
					<OrangeSquare />
				</IconContainer>
			</Link>
			<NavbarWithNavs>
				<Link href="/about">
					<ExternalLink>About</ExternalLink>
				</Link>
				<Link href="/blog">
					<ExternalLink>Blog</ExternalLink>
				</Link>
				<Link href="/uses">
					<ExternalLink>Uses</ExternalLink>
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
					{darkTheme ? <IoMdMoon /> : <FiSun />}
				</IconContainer>
			</NavbarWithNavs>
		</NavbarWithLogo>
	);
};

export { Navbar };
