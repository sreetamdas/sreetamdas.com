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
	variant?: "views" | "engagement";
};

export const StatsCounter = ({
	slug,
	page_type = "page",
	hidden = false,
	disabled = IS_DEV || IS_CI,
	variant = "engagement",
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
			<Stats slug={slug} page_type={page_type} disabled={disabled} variant={variant} />
		</div>
	);
};

const Stats = ({
	slug,
	page_type,
	disabled = false,
	variant = "engagement",
}: Omit<StatsCounterProps, "hidden">) => {
	const { pathname } = useLocation();
	const normalizedPathname = normalizePathname(slug ?? pathname);

	if (variant === "engagement") {
		return (
			<StatsSentence
				normalizedPathname={normalizedPathname}
				disabled={disabled}
				page_type={page_type}
			/>
		);
	}

	return (
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
};

const StatsSentence = ({ normalizedPathname, disabled, page_type }: StatsSentenceProps) => {
	const { data, isError, isLoading } = usePageMetrics(normalizedPathname, disabled);
	const noun = page_type === "post" ? "post" : "page";

	if (isLoading) {
		return <p className="m-0 text-sm">Getting stats for this {noun}</p>;
	}

	if (isError || data?.view_count === undefined) {
		return <p className="m-0 text-sm">Stats unavailable right now</p>;
	}

	return (
		<p className="m-0 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
			<Stat value={data.view_count} unit="view" />
			<span aria-hidden="true">·</span>
			<LikeStat normalizedPathname={normalizedPathname} disabled={disabled} metrics={data} />
			<span aria-hidden="true">·</span>
			<LiveStat />
		</p>
	);
};

const Stat = ({ value, unit }: { value: number; unit: string }) => (
	<>
		<MetricValue>{value.toLocaleString()}</MetricValue> {value === 1 ? unit : `${unit}s`}
	</>
);

const LiveStat = () => {
	const { count, connected } = useLiveViewerCount();
	return (
		<span className="inline-flex items-center gap-1.5" title="Live viewers (real-time)">
			<LivePulse connected={connected} />
			<MetricValue>{count === null ? "…" : count.toLocaleString()}</MetricValue> live across the
			site
		</span>
	);
};

const LivePulse = ({ connected }: { connected: boolean }) => (
	<span aria-hidden="true" className="relative inline-flex h-2 w-2">
		{connected ? (
			<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
		) : null}
		<span
			className={cn(
				"relative inline-flex h-2 w-2 rounded-full",
				connected ? "bg-primary" : "bg-primary/40",
			)}
		/>
	</span>
);

const LikeStat = ({
	normalizedPathname,
	disabled,
	metrics,
}: {
	normalizedPathname: string;
	disabled: boolean;
	metrics: PageMetrics;
}) => {
	const queryClient = useQueryClient();
	const queryKey = pageMetricsQueryKey(normalizedPathname);

	const incrementLikeCount = useServerFn<() => Promise<LikeCount>>(() =>
		incrementLikeServerFn({ data: { slug: normalizedPathname, disabled } }),
	);
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

	const likeCount = metrics.likes;
	const hasLiked = metrics.hasLiked;
	const readOnly = metrics.readOnly ?? false;
	const isDisabled = disabled || hasLiked || isPending || readOnly;
	const formattedLikeCount = likeCount.toLocaleString();
	const likeUnit = likeCount === 1 ? "like" : "likes";
	const label = `${formattedLikeCount} ${likeUnit}`;

	if (isDisabled) {
		return (
			<span
				className={hasLiked ? "font-semibold text-primary" : "text-primary/80"}
				title={hasLiked ? "You liked this post" : label}
			>
				<MetricValue className={hasLiked ? "font-semibold" : undefined}>
					{formattedLikeCount}
				</MetricValue>{" "}
				{likeUnit}
			</span>
		);
	}

	return (
		<button
			type="button"
			onClick={() => mutate()}
			aria-label={`Like this post — ${label}`}
			title={`Like this post — ${label}`}
			className="cursor-pointer text-primary underline-offset-4 transition-colors hover:underline"
		>
			<MetricValue>{formattedLikeCount}</MetricValue> {likeUnit}
		</button>
	);
};

const StandaloneViews = ({ normalizedPathname, disabled, page_type }: InnerViewsProps) => {
	const fetchViewCount = useServerFn<() => Promise<PageViewCount>>(() =>
		fetchViewCountServerFn({ data: { slug: normalizedPathname, disabled } }),
	);
	const { data, isError, isLoading } = useQuery({
		queryFn: fetchViewCount,
		queryKey: [normalizedPathname, "get-views"],
		staleTime: 1000 * 30,
		// Reading the count also records a view; avoid automatic background replays.
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
	});
	return (
		<ViewsCopy
			isError={isError}
			isLoading={isLoading}
			view_count={data?.view_count}
			page_type={page_type}
		/>
	);
};

type InnerViewsProps = {
	normalizedPathname: string;
	disabled: boolean;
	page_type: StatsCounterProps["page_type"];
};

const ViewsCopy = ({
	isError,
	isLoading,
	view_count,
	page_type,
}: {
	isError: boolean;
	isLoading: boolean;
	view_count: number | undefined;
	page_type: StatsCounterProps["page_type"];
}) => {
	if (isLoading) {
		return <p className="m-0 animate-pulse text-sm">Getting view count</p>;
	}

	if (isError || view_count === undefined) {
		return <p className="m-0 text-sm">View count unavailable right now</p>;
	}

	return <p className="m-0 text-sm">{getViewCountCopy(view_count, page_type)}</p>;
};

function getViewCountCopy(view_count: number, page_type: StatsCounterProps["page_type"]) {
	switch (view_count) {
		case 0:
			return "No views yet. Wait what, HOW? 🤔";
		case 1:
			return "This page has been viewed only once. That's a lot of views!";
		case 69:
			return (
				<>
					This {page_type} has been viewed <MetricValue>{view_count.toLocaleString()}</MetricValue>{" "}
					times. Nice.
				</>
			);
		case 420:
			return (
				<>
					This {page_type} has been viewed <MetricValue>{view_count.toLocaleString()}</MetricValue>{" "}
					times. Hehe.
				</>
			);

		default: {
			if (view_count > 10000) {
				return (
					<>
						This {page_type} has been viewed{" "}
						<MetricValue>{view_count.toLocaleString()}</MetricValue> times. Holy crap.
					</>
				);
			}
			if (view_count > 1000) {
				return (
					<>
						This {page_type} has been viewed{" "}
						<MetricValue>{view_count.toLocaleString()}</MetricValue> times. Holy crap. 🤯
					</>
				);
			}
			if (view_count > 100) {
				return (
					<>
						This {page_type} has been viewed{" "}
						<MetricValue>{view_count.toLocaleString()}</MetricValue> times. Wow.
					</>
				);
			}
			return (
				<>
					This {page_type} has been viewed <MetricValue>{view_count.toLocaleString()}</MetricValue>{" "}
					times
				</>
			);
		}
	}
}
const MetricValue = ({ children, className }: { children: string; className?: string }) => (
	<span
		className={cn(
			"rounded-global border-2 border-solid border-primary bg-background p-1 font-mono text-base text-primary transition-colors",
			className,
		)}
	>
		{children}
	</span>
);
