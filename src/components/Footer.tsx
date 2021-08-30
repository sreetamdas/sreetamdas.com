import axios from "axios";
import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";
import { useQuery } from "react-query";
import styled, { css } from "styled-components";

import { sharedTransition } from "styles/components";
import { breakpoint } from "utils/style";

type StatsResult = {
	stars: number;
	forks: number;
};

type StatsQuery = {
	owner: string;
	repo: string;
};

/**
 * Fetch GitHub stats from /api/github/stats
 */
const getGitHubStats = async (body: StatsQuery) => {
	try {
		const response = (
			await axios({
				url: "/api/github/stats",
				method: "POST",
				data: body,
				headers: {
					"Content-Type": "application/json",
				},
			})
		).data;

		return response;
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
		return;
	}
};

const GitHubStats = () => {
	const { data } = useQuery<StatsResult>(
		["api", "github", "stats"],
		async () =>
			await getGitHubStats({
				owner: "sreetamdas",
				repo: "sreetamdas.com",
			}),
		{
			staleTime: Infinity,
		}
	);

	return (
		<Stats>
			<Stat href="https://github.com/sreetamdas/sreetamdas.com/stargazers">
				<StatIcon>
					<FaRegStar />
				</StatIcon>
				<StatValue>{data?.stars ?? "—"}</StatValue>
			</Stat>
			<Stat href="https://github.com/sreetamdas/sreetamdas.com/network/members">
				<StatIcon>
					<VscRepoForked />
				</StatIcon>
				<StatValue>{data?.forks ?? "—"}</StatValue>
			</Stat>
		</Stats>
	);
};

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

const FooterContent = styled.div`
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

const Stat = styled.a.attrs({
	target: "_blank",
	rel: "noopener noreferrer",
})`
	width: max-content;
	display: flex;
	align-items: center;
	gap: 0.25rem;
	color: var(--color-primary);

	${sharedTransition("color, background-color")}

	&:hover {
		color: var(--color-primary-accent);
		text-decoration: none;
	}
`;

const Stats = styled.div`
	display: grid;
	grid-template-columns: max-content max-content;
	justify-content: center;
	justify-items: center;
	align-items: center;
	gap: 1rem;
	padding: 0.8rem 0;
`;

const StatIcon = styled.span`
	font-size: 1rem;
	line-height: 1rem;

	svg {
		height: 1rem;
		width: 1rem;
	}
`;

const StatValue = styled.span``;
