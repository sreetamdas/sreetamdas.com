import { type HTMLAttributes } from "react";
import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";

import { LinkTo } from "@/lib/components/Anchor";
import { fetchGitHubStats } from "@/lib/domains/GitHub";
import { cn } from "@/lib/helpers/utils";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

/**
 * Allow passing `FoobarPixel` as a child so that we can optionally set the `path` prop for it
 */

export const Footer = ({ children, className }: HTMLAttributes<HTMLDivElement>) => (
	<footer
		className={cn(
			"sticky top-[100vh] col-start-2 col-end-3 pt-20 pb-5 text-center text-sm",
			className,
		)}
	>
		{children}
		<GitHubStats />
		<p>
			Made with <LinkTo href="https://nextjs.org">Next.js</LinkTo> &bull; View source on{" "}
			<LinkTo href="https://github.com/sreetamdas/sreetamdas.com">GitHub</LinkTo>{" "}
			<span className="hidden md:inline-block">&bull;</span> <br className="md:hidden" />
			Find me on <LinkTo href="https://twitter.com/_SreetamDas">Twitter</LinkTo>
		</p>
		<p className="pt-8">I hope you have a very nice day :)</p>
	</footer>
);

export const GitHubStats = () => {
	// const data = await getGitHubStats();
	// const data = await useServerFn(getGitHubStats)();

	const getGitHubStats = useServerFn(fetchGitHubStats);

	const { data } = useQuery({
		queryFn: getGitHubStats,
		queryKey: ["github-stats"],
		staleTime: Infinity,
	});

	return (
		<div className="grid grid-cols-[max-content_max-content] justify-center gap-4 py-2.5">
			<LinkTo
				href="https://github.com/sreetamdas/sreetamdas.com/stargazers"
				className="text-foreground hover:text-primary flex w-max items-center gap-1 transition-[color] hover:no-underline"
			>
				<span className="leading-4">
					<FaRegStar title="star" aria-label="star" className="h-[18px] w-[18px] text-current" />
				</span>
				<span>{data?.stars ?? "—"}</span>
			</LinkTo>
			<LinkTo
				href="https://github.com/sreetamdas/sreetamdas.com/network/members"
				className="text-foreground hover:text-primary flex w-max items-center gap-1 transition-[color] hover:no-underline"
			>
				<VscRepoForked title="fork" aria-label="fork" className="h-[18px] w-[18px] text-current" />
				<span>{data?.forks ?? "—"}</span>
			</LinkTo>
		</div>
	);
};
