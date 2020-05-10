import React from "react";
import Link from "next/link";
import styled from "styled-components";

const NavbarWithLogo = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(2, auto);
`;

const NavbarWithNavs = styled.div`
	display: grid;
	grid-template-columns: repeat(3, min-content);
	grid-column-gap: 10px;
	white-space: nowrap;
	justify-self: end;
`;

const Navbar = () => {
	return (
		<NavbarWithLogo>
			<Link href="/">
				<div>Logo</div>
			</Link>
			<NavbarWithNavs>
				<div>About</div>
				<Link href="/blog" prefetch={true}>
					<div>Blog</div>
				</Link>
				<div>Another One</div>
			</NavbarWithNavs>
		</NavbarWithLogo>
	);
};

export { Navbar };
