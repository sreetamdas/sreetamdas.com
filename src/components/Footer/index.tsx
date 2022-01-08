import styled, { css } from "styled-components";

import { GitHubStats } from "@/components/Footer/GitHubStats";
import { breakpoint } from "@/utils/style";

export const Footer = () => {
	return (
		<FooterContent>
			<GitHubStats />
			Made with <a href="https://nextjs.org">Next.js</a> &bull; View source on{" "}
			<a href="https://github.com/sreetamdas/sreetamdas.com">Github</a>
			<span>&bull;</span> <br />
			Find me on <a href="https://twitter.com/_SreetamDas">Twitter</a>
		</FooterContent>
	);
};

const FooterContent = styled.footer`
	font-size: 0.8rem;
	padding: 0 1rem;
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
