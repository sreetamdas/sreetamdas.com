"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { IS_CI, IS_DEV } from "@/config";
import { useLiveViewerCount } from "@/lib/components/useLiveViewerCount";
import { cn, normalizePathname } from "@/lib/helpers/utils";

import { incrementLikeServerFn, type LikeCount } from "./LikeButton.server";
import { type PageMetrics } from "./Metrics.server";
import { pageMetricsQueryKey, usePageMetrics } from "./usePageMetrics";
import { fetchViewCountServerFn, type PageViewCount } from "./ViewsCounter.server";

type StatsCounterProps = {
	slug?: string;
	page_type?: "post" | "page";
	hidden?: boolean;
	disabled?: boolean;
	/**
	 * Read the view count from the shared page-metrics query instead of fetching
	 * views on its own. Set on routes that also like/track metrics so the
	 * requests dedupe into a single combined call.
	 */
	useMetrics?: boolean;
	/** Show the live viewer count as part of the stats sentence. */
	withLive?: boolean;
	/** Show the (clickable) like count as part of the stats sentence. */
	withLikes?: boolean;
};

export const StatsCounter = ({
	slug,
	page_type = "page",
	hidden = false,
	disabled = IS_DEV || IS_CI,
	useMetrics = false,
	withLive = false,
	withLikes = false,
}: StatsCounterProps) => {
	return (
		<div
			className={cn(
				"mx-auto mt-auto mb-5 w-full flex-row flex-wrap items-center justify-center gap-2 pt-40",
				hidden ? "hidden" : "flex",
			)}
		>
			<span role="img" aria-label="eyes">
				👀
			</span>
			<Stats
				slug={slug}
				page_type={page_type}
				disabled={disabled}
				useMetrics={useMetrics}
				withLive={withLive}
				withLikes={withLikes}
			/>
		</div>
	);
};

const Stats = ({
	slug,
	page_type,
	disabled = false,
	useMetrics,
	withLive,
	withLikes,
}: Omit<StatsCounterProps, "hidden">) => {
	const { pathname } = useLocation();
	const normalizedPathname = normalizePathname(slug ?? pathname);

	// Conditional render (not a conditional hook): each mode is fixed per route,
	// so each inner component keeps a stable hook order.
	if (withLive || withLikes) {
		return (
			<StatsSentence
				normalizedPathname={normalizedPathname}
				disabled={disabled}
				page_type={page_type}
				withLive={withLive}
				withLikes={withLikes}
			/>
		);
	}

	return useMetrics ? (
		<MetricsViews
			normalizedPathname={normalizedPathname}
			disabled={disabled}
			page_type={page_type}
		/>
	) : (
		<StandaloneViews
			normalizedPathname={normalizedPathname}
			disabled={disabled}
			page_type={page_type}
		/>
	);
};

type StatsSentenceProps = {
	normalizedPathname: string;
	disabled: boolean;
	page_type: StatsCounterProps["page_type"];
	withLive?: boolean;
	withLikes?: boolean;
};

const StatsSentence = ({
	normalizedPathname,
	disabled,
	page_type,
	withLive,
	withLikes,
}: StatsSentenceProps) => {
	const { data, isLoading } = usePageMetrics(normalizedPathname, disabled);
	const noun = page_type === "post" ? "post" : "page";

	if (isLoading || data?.view_count === undefined) {
		return <p className="m-0 text-xs">Getting stats for this {noun}</p>;
	}

	return (
		<p className="m-0 text-xs">
			This {noun} has <Stat value={data.view_count} unit="view" />
			{withLive ? (
				<>
					, <LiveStat />
				</>
			) : null}
			{withLikes ? (
				<>
					,{" "}
					<LikeStat
						normalizedPathname={normalizedPathname}
						disabled={disabled}
						likes={data.likes}
					/>
				</>
			) : null}
		</p>
	);
};

const Stat = ({ value, unit }: { value: number; unit: string }) => (
	<>
		<span className="font-mono text-primary">{value.toLocaleString()}</span>{" "}
		{value === 1 ? unit : `${unit}s`}
	</>
);

const LiveStat = () => {
	const { count } = useLiveViewerCount();
	return (
		<span title="Live viewers (real-time)">
			<span className="font-mono text-primary">
				{count === null ? "…" : count.toLocaleString()}
			</span>{" "}
			live
		</span>
	);
};

const LikeStat = ({
	normalizedPathname,
	disabled,
	likes,
}: {
	normalizedPathname: string;
	disabled: boolean;
	likes: number;
}) => {
	const queryClient = useQueryClient();
	const queryKey = pageMetricsQueryKey(normalizedPathname);

	const incrementLikeCount = useServerFn<() => Promise<LikeCount>>(() =>
		incrementLikeServerFn({ data: { slug: normalizedPathname, disabled } }),
	);
	const { data } = usePageMetrics(normalizedPathname, disabled);
	const { mutate, isPending } = useMutation({
		mutationFn: incrementLikeCount,
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey });

			const previous = queryClient.getQueryData<PageMetrics>(queryKey);
			if (previous?.hasLiked) {
				return { previous };
			}

			queryClient.setQueryData<PageMetrics>(queryKey, (old) =>
				old ? { ...old, likes: old.likes + 1, hasLiked: true } : old,
			);

			return { previous };
		},
		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData<PageMetrics>(queryKey, context.previous);
			}
		},
		onSuccess: (likeCount) => {
			queryClient.setQueryData<PageMetrics>(queryKey, (old) =>
				old ? { ...old, ...likeCount } : old,
			);
		},
	});

	const likeCount = data?.likes ?? likes;
	const hasLiked = data?.hasLiked ?? false;
	const readOnly = data?.readOnly ?? false;
	const isDisabled = disabled || hasLiked || isPending || readOnly;
	const label = `${likeCount.toLocaleString()} ${likeCount === 1 ? "like" : "likes"}`;

	if (isDisabled) {
		return (
			<span
				className={cn("font-mono", hasLiked ? "font-semibold text-primary" : "text-primary/70")}
				title={hasLiked ? "You liked this post" : label}
			>
				{label}
			</span>
		);
	}

	return (
		<button
			type="button"
			onClick={() => mutate()}
			aria-label={`Like this post — ${label}`}
			title={`Like this post — ${label}`}
			className="cursor-pointer font-mono text-primary underline-offset-4 transition-colors hover:underline"
		>
			{label}
		</button>
	);
};

const MetricsViews = ({ normalizedPathname, disabled, page_type }: InnerViewsProps) => {
	const { data, isLoading } = usePageMetrics(normalizedPathname, disabled);
	return <ViewsCopy isLoading={isLoading} view_count={data?.view_count} page_type={page_type} />;
};

const StandaloneViews = ({ normalizedPathname, disabled, page_type }: InnerViewsProps) => {
	const fetchViewCount = useServerFn<() => Promise<PageViewCount>>(() =>
		fetchViewCountServerFn({ data: { slug: normalizedPathname, disabled } }),
	);
	const { data, isLoading } = useQuery({
		queryFn: fetchViewCount,
		queryKey: [normalizedPathname, "get-views"],
		staleTime: 1000 * 30,
	});
	return <ViewsCopy isLoading={isLoading} view_count={data?.view_count} page_type={page_type} />;
};

type InnerViewsProps = {
	normalizedPathname: string;
	disabled: boolean;
	page_type: StatsCounterProps["page_type"];
};

const ViewsCopy = ({
	isLoading,
	view_count,
	page_type,
}: {
	isLoading: boolean;
	view_count: number | undefined;
	page_type: StatsCounterProps["page_type"];
}) => {
	if (isLoading) {
		return <p className="m-0 animate-pulse text-xs">Getting view count</p>;
	}

	return <p className="m-0 text-xs">{getViewCountCopy(view_count, page_type)}</p>;
};

function getViewCountCopy(
	view_count: number | undefined,
	page_type: StatsCounterProps["page_type"],
) {
	switch (view_count) {
		case undefined:
		case null:
			return "Getting page views";
		case 0:
			return "No views yet. Wait what, HOW? 🤔";
		case 1:
			return "This page has been viewed only once. That's a lot of views!";
		case 69:
			return (
				<>
					This {page_type} has been viewed <ViewCount>{view_count.toLocaleString()}</ViewCount>{" "}
					times. Nice.
				</>
			);
		case 420:
			return (
				<>
					This {page_type} has been viewed <ViewCount>{view_count.toLocaleString()}</ViewCount>{" "}
					times. Hehe.
				</>
			);

		default: {
			if (view_count > 10000) {
				return (
					<>
						This {page_type} has been viewed <ViewCount>{view_count.toLocaleString()}</ViewCount>{" "}
						times. Holy crap.
					</>
				);
			}
			if (view_count > 1000) {
				return (
					<>
						This {page_type} has been viewed <ViewCount>{view_count.toLocaleString()}</ViewCount>{" "}
						times. Holy crap. 🤯
					</>
				);
			}
			if (view_count > 100) {
				return (
					<>
						This {page_type} has been viewed <ViewCount>{view_count.toLocaleString()}</ViewCount>{" "}
						times. Wow.
					</>
				);
			}
			return (
				<>
					This {page_type} has been viewed <ViewCount>{view_count.toLocaleString()}</ViewCount>{" "}
					times
				</>
			);
		}
	}
}
const ViewCount = ({ children }: { children: string }) => (
	<span className="rounded-global border-2 border-solid border-primary bg-background p-1 font-mono text-base text-primary transition-colors">
		{children}
	</span>
);
