"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { IS_CI, IS_DEV } from "@/config";
import { cn, normalizePathname } from "@/lib/helpers/utils";

import { usePageMetrics } from "./usePageMetrics";
import { fetchViewCountServerFn, type PageViewCount } from "./ViewsCounter.server";

type ViewsCounterProps = {
	slug?: string;
	page_type?: "post" | "page";
	hidden?: boolean;
	disabled?: boolean;
	/**
	 * Read the view count from the shared page-metrics query instead of fetching
	 * views on its own. Set on routes that also render <LikeButton /> so the two
	 * dedupe to a single combined request.
	 */
	useMetrics?: boolean;
};
export const ViewsCounter = ({
	slug,
	page_type = "page",
	hidden = false,
	disabled = IS_DEV || IS_CI,
	useMetrics = false,
}: ViewsCounterProps) => {
	return (
		<div
			className={cn(
				"mx-auto mt-auto mb-5 w-full flex-row items-center justify-center gap-2 pt-40",
				hidden ? "hidden" : "flex",
			)}
		>
			<span role="img" aria-label="eyes">
				👀
			</span>
			<Views slug={slug} page_type={page_type} disabled={disabled} useMetrics={useMetrics} />
		</div>
	);
};

const Views = ({
	slug,
	page_type,
	disabled = false,
	useMetrics,
}: Omit<ViewsCounterProps, "hidden">) => {
	const { pathname } = useLocation();
	const normalizedPathname = normalizePathname(slug ?? pathname);

	// Conditional render (not a conditional hook): useMetrics is fixed per route,
	// so each inner component keeps a stable hook order.
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

type InnerViewsProps = {
	normalizedPathname: string;
	disabled: boolean;
	page_type: ViewsCounterProps["page_type"];
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

const ViewsCopy = ({
	isLoading,
	view_count,
	page_type,
}: {
	isLoading: boolean;
	view_count: number | undefined;
	page_type: ViewsCounterProps["page_type"];
}) => {
	if (isLoading) {
		return <p className="m-0 animate-pulse text-xs">Getting view count</p>;
	}

	return <p className="m-0 text-xs">{getViewCountCopy(view_count, page_type)}</p>;
};

function getViewCountCopy(
	view_count: number | undefined,
	page_type: ViewsCounterProps["page_type"],
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
