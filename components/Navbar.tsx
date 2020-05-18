import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { ExternalLink } from "components/Layouts";
import OrangeSquare from "public/orangeSquare.svg";

const NavbarWithLogo = styled.div`
	width: 100%;
	padding-top: 20px;
	display: grid;
	grid-template-columns: repeat(2, auto);
	align-items: center;
`;

const NavbarWithNavs = styled.div`
	display: grid;
	grid-template-columns: repeat(5, minmax(min-content, max-content));
	grid-column-gap: 1rem;
	white-space: nowrap;
	justify-self: end;
	align-items: center;
`;

const IconToExternalLink = styled.a`
	color: var(--primary-accent-color);
	font-size: 25px;
`;

const Navbar = () => {
	return (
		<NavbarWithLogo>
			<Link href="/">
				<IconToExternalLink>
					<OrangeSquare />
				</IconToExternalLink>
				{/* <img
					src="/favicon.png"
					width={25}
					alt="just a orange square with rounded corners"
				/> */}
			</Link>
			<NavbarWithNavs>
				<Link href="/about">
					<ExternalLink>About</ExternalLink>
				</Link>
				<Link href="/blog">
					<ExternalLink>Blog</ExternalLink>
				</Link>
				<IconToExternalLink
					href="https://github.com/sreetamdas"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaGithub />
				</IconToExternalLink>
				<IconToExternalLink
					href="https://twitter.com/_SreetamDas"
					target="_blank"
					rel="noopener noreferrer"
				>
					<FaTwitter />
				</IconToExternalLink>
			</NavbarWithNavs>
		</NavbarWithLogo>
	);
};

export { Navbar };
