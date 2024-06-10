"use client";

import { useEffect, useState } from "react";

import { IS_CI, IS_DEV } from "@/config";
import { getPageViews, upsertPageViews } from "@/lib/domains/db/page-views";
import { cn } from "@/lib/helpers/utils";

type IsomorphicFetchOptions = {
	disabled?: boolean;
};

/**
 * Wrapper for Supabase page views for both only fetching and upserting
 * @param slug page slug
 * @returns page views response
 */
async function isomorphicFetchPageViews(slug: string, options: IsomorphicFetchOptions) {
	if (options.disabled) {
		const response = await getPageViews(slug);
		return response;
	}
	const response = await upsertPageViews(slug);
	return response;
}

type ViewsCounterProps = {
	slug: string;
	page_type?: "post" | "page";
	hidden?: boolean;
	disabled?: boolean;
};
export const ViewsCounter = ({
	slug,
	page_type = "page",
	hidden = false,
	disabled = IS_DEV || IS_CI,
}: ViewsCounterProps) => {
	const [page_views, setPageViews] = useState<number | null>(null);

	useEffect(() => {
		async function fetchPageViews() {
			const { data, error, type } = await isomorphicFetchPageViews(slug, { disabled });

			if (type === "success") {
				const { view_count } = data;
				setPageViews(view_count);
			} else {
				// eslint-disable-next-line no-console
				console.error(error);
				setPageViews(0);
			}
		}

		fetchPageViews();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			className={cn(
				"mx-auto mb-5 mt-auto w-full flex-row items-center justify-center gap-2 pt-40",
				hidden ? "hidden" : "flex",
			)}
		>
			<span role="img" aria-label="eyes">
				👀
			</span>
			<p className="m-0 text-xs">{getViewCountCopy(page_views ?? 0, page_type)}</p>
		</div>
	);
};

function getViewCountCopy(view_count: number | null, page_type: ViewsCounterProps["page_type"]) {
	switch (view_count) {
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
			if (view_count > 100) {
				return (
					<>
						This {page_type} has been viewed <ViewCount>{view_count.toLocaleString()}</ViewCount>{" "}
						times. Wow.
					</>
				);
			} else if (view_count > 1000) {
				return (
					<>
						This {page_type} has been viewed <ViewCount>{view_count.toLocaleString()}</ViewCount>{" "}
						times. Holy crap. 🤯
					</>
				);
			} else if (view_count > 10000) {
				return (
					<>
						This {page_type} has been viewed <ViewCount>{view_count.toLocaleString()}</ViewCount>{" "}
						times. Holy crap.
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
