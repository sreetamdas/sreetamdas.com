import { motion } from "framer-motion";
import styled, { css } from "styled-components";

import { LinkedIcon } from "@/styles/blog";
import { sharedTransition } from "@/styles/components";
import { LinkTo, LinkToProps } from "@/styles/typography";
import { breakpoint } from "@/utils/style";

export const Container = styled.div`
	display: grid;
	grid-auto-flow: column;
	column-gap: 15px;
	justify-self: end;
	place-items: center;
	justify-content: center;
`;

export const PlatformLinksContainer = styled.div`
	display: grid;
	grid-auto-flow: column;
	column-gap: 15px;
	place-items: center;
	justify-content: center;
	padding: 15px 0;

	${breakpoint.until.md(css`
		display: flex;
		flex-wrap: wrap;
		row-gap: 15px;
		padding: 15px 3rem;
	`)}
`;

export const NavLink = (props: LinkToProps) => <LinkTo {...props} $primary />;

export const LogoSVG = styled.svg.attrs({
	width: "25",
	height: "25",
	viewBox: "0 0 25 25",
	xmlns: "http://www.w3.org/2000/svg",
})`
	color: var(--color-primary-accent);
	fill: var(--color-primary-accent);
`;

export const ThemeSwitch = styled(LinkedIcon).attrs({ as: "button" })``;

export const MobileMenuToggle = styled(LinkedIcon).attrs({ as: "button" })`
	color: var(--color-primary-accent);

	${breakpoint.from.md(css`
		&& {
			display: none;
		}
	`)}
`;

export const Header = styled.header`
	position: sticky;
	top: 0;
	width: 100%;
	height: 60px;
	padding: 0 20px;
	z-index: 2;

	background-color: var(--color-background);

	${sharedTransition("color, background-color")}

	${LinkedIcon}, ${ThemeSwitch}, ${MobileMenuToggle} {
		z-index: 10;
	}
`;

export const HeaderInner = styled.div`
	padding: 15px 0;
	margin: 0 auto;
	width: 100%;
	height: 100%;
	max-width: var(--max-width);

	display: grid;
	grid-template-columns: max-content auto;
	align-content: center;
	gap: 30px;
`;

export const Nav = styled.nav`
	display: contents;
	padding-right: 30px;
	width: min-content;
`;

export const navLinksMixin = css`
	display: grid;
	list-style: none;

	${breakpoint.from.md(css`
		display: contents;
	`)}
`;

export const PageLinks = styled.ul`
	${navLinksMixin}
`;

export const IconLinks = styled.ul`
	${navLinksMixin}

	${breakpoint.until.md(css`
		grid-auto-flow: column;
		gap: 30px;
		width: min-content;
	`)}

	& > li {
		padding: 0;
	}
`;

export const NavLinksDesktop = styled.div`
	display: none;

	${breakpoint.from.md(css`
		display: contents;
	`)}
`;

export const FullScreenWrapper = styled(motion.div)<{ $visible: boolean }>`
	height: 100vh;
	width: 100vw;
	background-color: var(--color-bg-blurred);

	position: absolute;
	top: 0;
	left: 0;

	display: grid;
	align-content: center;

	${({ $visible }) =>
		$visible
			? css`
					pointer-events: auto;
			  `
			: css`
					pointer-events: none;
			  `}

	${Nav} {
		display: grid;
		gap: 30px;

		& > ${PageLinks}, ${IconLinks} {
			padding-left: 3rem;
			font-size: 1.5rem;
			width: min-content;
		}

		& > ${PageLinks} > li {
			padding: 0.5rem 0;
		}
	}

	${breakpoint.from.md(css`
		display: none;
	`)}
`;

export const NavContainer = styled(motion(Container))<{ $showDrawer: boolean }>``;
