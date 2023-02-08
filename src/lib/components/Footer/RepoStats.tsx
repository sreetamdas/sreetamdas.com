import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";

import { LinkTo } from "@/lib/components/Anchor";
import { getGitHubStats } from "@/lib/domains/GitHub";

export const GitHubStats = async () => {
	const data = await getGitHubStats();

	return (
		<div className="grid grid-cols-[max-content_max-content] gap-4 justify-center py-2.5">
			<LinkTo
				href="https://github.com/sreetamdas/sreetamdas.com/stargazers"
				className="text-foreground hover:text-primary flex items-center gap-1 w-max transition-colors hover:no-underline"
			>
				<span className="text-lg leading-4">
					<FaRegStar title="star" aria-label="star" className="w-[18px] h-[18px] text-current" />
				</span>
				<span>{data?.stars ?? "—"}</span>
			</LinkTo>
			<LinkTo
				href="https://github.com/sreetamdas/sreetamdas.com/network/members"
				className="text-foreground hover:text-primary flex items-center gap-1 w-max transition-colors hover:no-underline"
			>
				<span className="text-lg leading-4">
					<VscRepoForked
						title="fork"
						aria-label="fork"
						className="w-[18px] h-[18px] text-current"
					/>
				</span>
				<span>{data?.forks ?? "—"}</span>
			</LinkTo>
		</div>
	);
};
