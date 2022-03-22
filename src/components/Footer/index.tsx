import styled, { css } from "styled-components";

import { GitHubStats } from "@/components/Footer/GitHubStats";
import { breakpoint } from "@/utils/style";

export const Footer = () => (
	<FooterWrapper>
		<GitHubStats />
		Made with <a href="https://nextjs.org">Next.js</a> &bull; View source on{" "}
		<a href="https://github.com/sreetamdas/sreetamdas.com">Github</a>
		<span>&bull;</span> <br />
		Find me on <a href="https://twitter.com/_SreetamDas">Twitter</a>
	</FooterWrapper>
);

const FooterWrapper = styled.footer`
	position: sticky;
	bottom: 0;
	top: 100vh;
	font-size: 0.8rem;
	padding: 0 20px 20px;
	text-align: center;

	& > br {
		${breakpoint.from.md(css`
			display: none;
		`)}
	}

	& > span {
		${breakpoint.until.md(css`
			display: none;
		`)}
	}
`;
