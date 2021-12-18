import axios from "axios";
import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";
import { useQuery } from "react-query";
import styled from "styled-components";

import { sharedTransition } from "@/styles/components";

export const Stats = styled.div`
	display: grid;
	grid-template-columns: max-content max-content;
	justify-content: center;
	justify-items: center;
	align-items: center;
	gap: 1rem;
	padding: 0.8rem 0;
`;

export const Stat = styled.a.attrs({
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

export const StatIcon = styled.span`
	font-size: 1rem;
	line-height: 1rem;

	svg {
		height: 1rem;
		width: 1rem;
	}
`;

export const StatValue = styled.span``;

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
export async function getGitHubStats(body: StatsQuery) {
	const response = (
		await axios.post<StatsResult>("/api/github/stats", body, {
			headers: {
				"Content-Type": "application/json",
			},
		})
	).data;

	return response;
}

export const GitHubStats = () => {
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
					<FaRegStar title="star" aria-label="star" />
				</StatIcon>
				<StatValue>{data?.stars ?? "—"}</StatValue>
			</Stat>
			<Stat href="https://github.com/sreetamdas/sreetamdas.com/network/members">
				<StatIcon>
					<VscRepoForked title="fork" aria-label="fork" />
				</StatIcon>
				<StatValue>{data?.forks ?? "—"}</StatValue>
			</Stat>
		</Stats>
	);
};
