import { captureException } from "@sentry/nextjs";
import { clsx } from "clsx";
import { Suspense } from "react";

import { IS_DEV } from "@/config";
import { getPageViews, upsertPageViews } from "@/lib/domains/Supabase";

/**
 * Wrapper for Supabase page views for both only fetching and upserting
 * @param slug page slug
 * @returns page views response
 */
async function isomorphicFetchPageViews(slug: string) {
	if (IS_DEV) {
		return await getPageViews(slug);
	}
	return await upsertPageViews(slug);
}

type ViewsCounterProps = {
	slug: string;
	page_type?: "post" | "page";
	hidden?: boolean;
};
export const ViewsCounter = ({ slug, page_type = "page", hidden = false }: ViewsCounterProps) => (
	<div
		className={clsx(
			"mx-auto mb-5 mt-auto w-full flex-row items-center justify-center gap-2 pt-40",
			hidden ? "hidden" : "flex",
		)}
	>
		<span role="img" aria-label="eyes">
			👀
		</span>
		<Views slug={slug} page_type={page_type} />
	</div>
);

const Views = async ({ slug, page_type }: Omit<ViewsCounterProps, "hidden">) => {
	const { data, error } = await isomorphicFetchPageViews(slug);

	if (error) {
		captureException(error, { extra: { slug } });
	}

	return (
		<Suspense fallback={<p className="m-0 text-xs">Getting view count</p>}>
			<p className="m-0 text-xs">{getViewCountCopy(data?.view_count ?? 0, page_type)}</p>
		</Suspense>
	);
};

function getViewCountCopy(view_count: number, page_type: ViewsCounterProps["page_type"]) {
	switch (view_count) {
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
	<span
		className="rounded-global border-2 border-solid border-primary bg-background p-1 font-mono 
	text-base text-primary transition-colors"
	>
		{children}
	</span>
);
