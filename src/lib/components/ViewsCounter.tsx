import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { IS_CI, IS_DEV } from "@/config";
import { getPageViews, upsertPageViews } from "@/lib/domains/Supabase";
import { cn } from "@/lib/helpers/utils";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useParams } from "@tanstack/react-router";

type IsomorphicFetchOptions = {
	disabled?: boolean;
};

const getViewCount = createServerFn({ method: "GET" }).handler(async ({ data }) => {
	console.log({ data });
	return isomorphicFetchPageViews(data.slug, { disabled: true });
});

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
	slug?: string;
	page_type?: "post" | "page";
	hidden?: boolean;
	disabled?: boolean;
};
export const ViewsCounter = ({
	slug,
	page_type = "page",
	hidden = false,
	disabled = IS_DEV || IS_CI,
}: ViewsCounterProps) => (
	<div
		className={cn(
			"mx-auto mt-auto mb-5 w-full flex-row items-center justify-center gap-2 pt-40",
			hidden ? "hidden" : "flex",
		)}
	>
		<span role="img" aria-label="eyes">
			👀
		</span>
		{/* <Suspense fallback={<p className="m-0 text-xs">Getting view count</p>}>
			<Views slug={slug} page_type={page_type} disabled={disabled} />
		</Suspense> */}
	</div>
);

const Views = async ({ slug, page_type, disabled }: Omit<ViewsCounterProps, "hidden">) => {
	// const { data } = await isomorphicFetchPageViews(slug, { disabled });
	const route = useParams({ strict: false });

	console.log(">>", { route });

	const getViews = useServerFn(() => getViewCount({ data: route }));
	const { data } = useQuery({ queryKey: route, queryFn: getViews });

	// const res = getViews();
	console.log("client", { data });

	return <p className="m-0 text-xs">{getViewCountCopy(0, page_type)}</p>;
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
			}
			if (view_count > 1000) {
				return (
					<>
						This {page_type} has been viewed <ViewCount>{view_count.toLocaleString()}</ViewCount>{" "}
						times. Holy crap. 🤯
					</>
				);
			}
			if (view_count > 10000) {
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
	<span className="rounded-global border-primary bg-background text-primary border-2 border-solid p-1 font-mono text-base transition-colors">
		{children}
	</span>
);
