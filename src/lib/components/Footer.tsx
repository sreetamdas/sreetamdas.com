"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { type HTMLAttributes } from "react";
import { FaRegStar } from "react-icons/fa";
import { VscRepoForked } from "react-icons/vsc";

import { LiveViewersBadge } from "@/lib/components/LiveViewersBadge";
import { fetchGitHubStats } from "@/lib/domains/GitHub/server";
import { cn } from "@/lib/helpers/utils";

/**
 * Allow passing `FoobarPixel` as a child so that we can optionally set the `path` prop for it
 */

export const Footer = ({ children, className }: HTMLAttributes<HTMLDivElement>) => {
	// Blog posts render their own engagement StatsCounter with live presence;
	// hide the footer badge there so a visitor opens only one presence socket.
	const { pathname } = useLocation();
	const isBlogPost = pathname.startsWith("/blog/");

	return (
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
				<a className="link-base" href="https://tanstack.com/start">
					TanStack Start
				</a>{" "}
				on{" "}
				<a className="link-base" href="https://workers.cloudflare.com">
					Cloudflare Workers
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
				<div className="md:order-3 md:justify-self-end">
					{isBlogPost ? null : <LiveViewersBadge />}
				</div>
				<p className="text-center md:order-2">I hope you have a very nice day :)</p>
				<div className="hidden md:order-1 md:block" />
			</div>
		</footer>
	);
};

export const GitHubStats = () => {
	const getGitHubStats = useServerFn(fetchGitHubStats);

	const { data, isLoading } = useQuery({
		queryFn: getGitHubStats,
		queryKey: ["github-stats"],
		staleTime: Infinity,
	});

	return (
		<div className="grid grid-cols-[max-content_max-content] justify-center gap-4 py-2.5">
			<a
				href="https://github.com/sreetamdas/sreetamdas.com/stargazers"
				className="flex w-max items-center gap-1 link-base text-foreground transition-[color] hover:text-primary hover:no-underline"
			>
				<span className="leading-4">
					<FaRegStar title="star" aria-label="star" className="h-[18px] w-[18px] text-current" />
				</span>
				<span className={isLoading ? "animate-pulse" : ""}>{data?.stars ?? "…"}</span>
			</a>
			<a
				href="https://github.com/sreetamdas/sreetamdas.com/network/members"
				className="flex w-max items-center gap-1 link-base text-foreground transition-[color] hover:text-primary hover:no-underline"
			>
				<VscRepoForked title="fork" aria-label="fork" className="h-[18px] w-[18px] text-current" />
				<span className={isLoading ? "animate-pulse" : ""}>{data?.forks ?? "…"}</span>
			</a>
		</div>
	);
};
