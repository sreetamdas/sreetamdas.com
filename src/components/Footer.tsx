import { useEffect, useState } from "react";
import styled, { css } from "styled-components";

import { breakpoint } from "utils/style";

type StatsResult = {
	stars: number;
	forks: number;
};

type StatsQuery = {
	owner: string;
	repo: string;
};

const getGitHubStats = async (body: StatsQuery) => {
	const response = await (
		await fetch("/api/github/stats", {
			body: JSON.stringify(body),
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		})
	).json();

	return response;
};

/**
 * Fetch GitHub stats from /api/github/stats
 */
const GitHubStats = () => {
	const [stats, setStats] = useState<StatsResult>({
		stars: 0,
		forks: 0,
	});

	useEffect(() => {
		getGitHubStats({
			owner: "sreetamdas",
			repo: "sreetamdas.com",
		}).then((stats) => setStats(stats));
	}, []);

	if (!stats) return null;

	return (
		<Container>
			<Stats>
				<Stat>
					<StatLabel>Stars</StatLabel>
					<StatValue>{stats.stars}</StatValue>
				</Stat>
				<Stat>
					<StatLabel>Forks</StatLabel>
					<StatValue>{stats.forks}</StatValue>
				</Stat>
			</Stats>
		</Container>
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

const Stat = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 1rem;
`;

const Stats = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
`;

const StatLabel = styled.div`
	font-size: 0.8rem;
	margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
	font-size: 1.2rem;
	font-weight: bold;
`;

const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 1rem;
	/* background-color: #fafafa; */
`;
