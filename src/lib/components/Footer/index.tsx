"use client";

import styled, { css } from "styled-components";

import { breakpoint } from "@/lib/styles/helpers";

// import { GitHubStats } from "@/components/GitHub/FooterStats";
// import { Foobar } from "@/components/foobar";

export const Footer = () => (
	<FooterWrapper>
		{/* <Foobar /> */}
		{/* <GitHubStats /> */}
		Made with <a href="https://nextjs.org">Next.js</a> &bull; View source on{" "}
		<a href="https://github.com/sreetamdas/sreetamdas.com">Github</a> <span>&bull;</span> <br />
		Find me on <a href="https://twitter.com/_SreetamDas">Twitter</a>
		<MessageWrapper>I hope you have a very nice day :)</MessageWrapper>
	</FooterWrapper>
);

const FooterWrapper = styled.footer`
	position: sticky;
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

const MessageWrapper = styled.div`
	padding-top: 30px;
`;
