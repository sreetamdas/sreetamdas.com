import { type HTMLAttributes } from "react";
import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";

import { LiveViewersBadge } from "@/lib/components/LiveViewersBadge.client";
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
			Made with{" "}
			<a className="link-base" href="https://nextjs.org">
				Next.js
			</a>{" "}
			&bull; View source on{" "}
			<a className="link-base" href="https://github.com/sreetamdas/sreetamdas.com">
				GitHub
			</a>{" "}
			<span className="hidden md:inline-block">&bull;</span> <br className="md:hidden" />
			Find me on{" "}
			<a className="link-base" href="https://twitter.com/_SreetamDas">
				Twitter
			</a>
		</p>
		<div className="grid w-full place-items-center gap-3 pt-8 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4">
			<div className="md:justify-self-end md:order-3">
				<LiveViewersBadge />
			</div>
			<p className="text-center md:order-2">I hope you have a very nice day :)</p>
			<div className="hidden md:block md:order-1" />
		</div>
	</footer>
);

export const GitHubStats = () => {
	const getGitHubStats = useServerFn(fetchGitHubStats);

	const { data } = useQuery({
		queryFn: getGitHubStats,
		queryKey: ["github-stats"],
		staleTime: Infinity,
	});

	return (
		<div className="grid grid-cols-[max-content_max-content] justify-center gap-4 py-2.5">
			<a
				href="https://github.com/sreetamdas/sreetamdas.com/stargazers"
				className="link-base text-foreground hover:text-primary flex w-max items-center gap-1 transition-[color] hover:no-underline"
			>
				<span className="leading-4">
					<FaRegStar title="star" aria-label="star" className="h-[18px] w-[18px] text-current" />
				</span>
				<span>{data?.stars ?? "—"}</span>
			</a>
			<a
				href="https://github.com/sreetamdas/sreetamdas.com/network/members"
				className="link-base text-foreground hover:text-primary flex w-max items-center gap-1 transition-[color] hover:no-underline"
			>
				<VscRepoForked title="fork" aria-label="fork" className="h-[18px] w-[18px] text-current" />
				<span>{data?.forks ?? "—"}</span>
			</a>
		</div>
	);
};
