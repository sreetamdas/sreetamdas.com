import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";

import { LinkTo } from "@/lib/components/Anchor";
import { getGitHubStats } from "@/lib/domains/GitHub";
import { cn } from "@/lib/helpers/utils";

/**
 * Allow passing `FoobarPixel` as a child so that we can optionally set the `path` prop for it
 */

export const Footer = ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
	<footer
		className={cn(
			"sticky top-[100vh] col-start-2 col-end-3 pb-5 pt-20 text-center text-sm",
			className,
		)}
	>
		{children}
		<GitHubStats />
		Made with <LinkTo href="https://nextjs.org">Next.js</LinkTo> &bull; View source on{" "}
		<LinkTo href="https://github.com/sreetamdas/sreetamdas.com">GitHub</LinkTo>{" "}
		<span className="hidden md:inline-block">&bull;</span> <br className="md:hidden" />
		Find me on <LinkTo href="https://twitter.com/_SreetamDas">Twitter</LinkTo>
		<p className="pt-8">I hope you have a very nice day :)</p>
	</footer>
);

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
