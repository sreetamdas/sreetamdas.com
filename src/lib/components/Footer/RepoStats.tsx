import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";

import { LinkTo } from "@/lib/components/Anchor";
import { getGitHubStats } from "@/lib/domains/GitHub";

export const GitHubStats = async () => {
	const data = await getGitHubStats();

	return (
		<div className="grid grid-cols-[max-content_max-content] justify-center gap-4 py-2.5">
			<LinkTo
				href="https://github.com/sreetamdas/sreetamdas.com/stargazers"
				className="flex w-max items-center gap-1 text-foreground transition-[color] hover:text-primary hover:no-underline"
			>
				<span className="leading-4">
					<FaRegStar title="star" aria-label="star" className="h-[18px] w-[18px] text-current" />
				</span>
				<span>{data?.stars ?? "—"}</span>
			</LinkTo>
			<LinkTo
				href="https://github.com/sreetamdas/sreetamdas.com/network/members"
				className="flex w-max items-center gap-1 text-foreground transition-[color] hover:text-primary hover:no-underline"
			>
				<span className="leading-4">
					<VscRepoForked
						title="fork"
						aria-label="fork"
						className="h-[18px] w-[18px] text-current"
					/>
				</span>
				<span>{data?.forks ?? "—"}</span>
			</LinkTo>
		</div>
	);
};
