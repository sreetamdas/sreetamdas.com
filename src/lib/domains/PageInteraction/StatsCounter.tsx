"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FaEye, FaHeart, FaRegCircleUser, FaRegHeart } from "react-icons/fa6";

import { IS_CI } from "@/config";
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
	disabled = IS_CI,
	variant = "engagement",
}: StatsCounterProps) => {
	const { pathname } = useLocation();
	const normalized_slug = slug ?? pathname;
	const normalizedPathname = normalizePathname(normalized_slug);

	if (variant === "engagement") {
		return (
			<div
				className={cn(
					"mx-auto mt-auto mb-5 w-full flex-row flex-wrap items-center justify-center gap-2 pt-40",
					hidden ? "hidden" : "flex",
				)}
			>
				<StatsSentence
					normalizedPathname={normalizedPathname}
					disabled={disabled}
					page_type={page_type}
				/>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"mx-auto mt-auto mb-5 w-full flex-row flex-wrap items-center justify-center gap-2 pt-40",
				hidden ? "hidden" : "flex",
			)}
		>
			<StandaloneViews
				normalizedPathname={normalizedPathname}
				disabled={disabled}
				page_type={page_type}
			/>
		</div>
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
		<dl
			className="m-0 flex flex-wrap items-center justify-center gap-4 text-sm"
			aria-label={`${noun} engagement stats`}
		>
			<ViewsStat value={data.view_count} />
			<LikeStat
				normalizedPathname={normalizedPathname}
				disabled={disabled}
				metrics={data}
				noun={noun}
			/>
			<LiveStat />
		</dl>
	);
};

const ViewsStat = ({ value }: { value: number }) => (
	<div className="flex items-center gap-1.5">
		<dt className="sr-only">Views</dt>
		<dd className="m-0 flex items-center gap-1.5" title={`${value.toLocaleString()} views`}>
			<FaEye aria-hidden="true" focusable={false} className="size-5 text-primary" />
			{value.toLocaleString()}
		</dd>
	</div>
);

const LiveStat = () => {
	const { count, connected } = useLiveViewerCount();

	if (count === null) return null;

	const formattedCount = count.toLocaleString();

	return (
		<div className="flex items-center gap-1.5">
			<dt className="sr-only">Live viewers across the site</dt>
			<dd
				className="m-0 inline-flex items-center gap-1.5"
				title={`${formattedCount} live viewers across the site`}
			>
				<span
					aria-hidden="true"
					className="relative inline-flex size-5 items-center justify-center"
				>
					{connected ? (
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 animate-duration-[1000ms] motion-reduce:animate-none" />
					) : null}
					<FaRegCircleUser
						aria-hidden="true"
						focusable={false}
						className="relative inline-flex size-5 rounded-full text-primary"
					/>
				</span>
				{formattedCount}
			</dd>
		</div>
	);
};

const LikeStat = ({
	normalizedPathname,
	disabled,
	metrics,
	noun,
}: {
	normalizedPathname: string;
	disabled: boolean;
	metrics: PageMetrics;
	noun: "post" | "page";
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

	const like_count = metrics.likes;
	const hasLiked = metrics.hasLiked;
	const readOnly = metrics.readOnly ?? false;
	const is_disabled = disabled || hasLiked || isPending || readOnly;
	const formatted_like_count = like_count.toLocaleString();
	const likeUnit = like_count === 1 ? "like" : "likes";
	const likeSummary = `${formatted_like_count} ${likeUnit}`;
	const likeActionLabel = hasLiked ? `You liked this ${noun}` : `Like this ${noun}`;
	const likeButtonLabel = isPending
		? `Saving like for this ${noun}. ${likeSummary}`
		: `${likeActionLabel}. ${likeSummary}`;
	const likeButtonTitle = isPending
		? `Saving like for this ${noun} — ${likeSummary}`
		: `${likeActionLabel} — ${likeSummary}`;

	return (
		<div className="flex items-center gap-1.5">
			<dt className="sr-only">Likes</dt>
			<dd className="m-0 flex items-center gap-1.5" title={likeSummary}>
				<button
					type="button"
					onClick={() => mutate()}
					aria-label={likeButtonLabel}
					aria-pressed={hasLiked}
					title={likeButtonTitle}
					className={cn(
						"cursor-pointer text-primary underline-offset-4 transition-colors hover:underline disabled:cursor-default disabled:hover:no-underline",
						hasLiked && "text-primary/80",
					)}
					disabled={is_disabled}
				>
					{hasLiked ? (
						<FaHeart aria-hidden="true" focusable={false} className="size-5" />
					) : (
						<FaRegHeart aria-hidden="true" focusable={false} className="size-5" />
					)}
				</button>
				<span aria-hidden="true">{formatted_like_count}</span>
			</dd>
		</div>
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
