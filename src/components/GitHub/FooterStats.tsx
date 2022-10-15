import { useQuery } from "@tanstack/react-query";
import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";
import styled from "styled-components";

import { DEFAULT_REPO, getGitHubStats, StatsResult } from "@/domains/GitHub";
import { sharedTransition } from "@/styles/components";
import { LinkTo, StyledLinkBase } from "@/styles/typography";

export const Stats = styled.div`
	display: grid;
	grid-template-columns: max-content max-content;
	justify-content: center;
	justify-items: center;
	align-items: center;
	gap: 1rem;
	padding: 10px 0;

	${StyledLinkBase} {
		width: max-content;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--color-primary);

		${sharedTransition("color, background-color")}

		:hover {
			color: var(--color-primary-accent);
			text-decoration: none;
		}
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

export const GitHubStats = () => {
	const { data } = useQuery<StatsResult>(
		["api", "github", "stats"],
		async () => await getGitHubStats(DEFAULT_REPO),
		{
			staleTime: Infinity,
		}
	);

	return (
		<Stats>
			<LinkTo href="https://github.com/sreetamdas/sreetamdas.com/stargazers">
				<StatIcon>
					<FaRegStar title="star" aria-label="star" />
				</StatIcon>
				<StatValue>{data?.stars ?? "—"}</StatValue>
			</LinkTo>
			<LinkTo href="https://github.com/sreetamdas/sreetamdas.com/network/members">
				<StatIcon>
					<VscRepoForked title="fork" aria-label="fork" />
				</StatIcon>
				<StatValue>{data?.forks ?? "—"}</StatValue>
			</LinkTo>
		</Stats>
	);
};
