import { useQuery } from "@tanstack/react-query";
import { IS_CI, IS_DEV } from "@/config";
import { cn } from "@/lib/helpers/utils";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useLocation } from "@tanstack/react-router";
import { z } from "zod";
import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { getPageViews, upsertPageViews } from "@/lib/domains/PageViews";

type PageViewCount = {
	view_count: number;
};

const PagePathname = z.object({
	slug: z.string().min(1),
	disabled: z.boolean(),
});

const fetchViewCountServerFn = createServerFn<"GET", "data", PageViewCount>({
	method: "GET",
})
	.inputValidator((data) => {
		return PagePathname.parse(data);
	})
	.handler(async ({ data }) => {
		const db = getDb(env);
		const normalizedSlug = normalizePathname(data.slug);

		if (data.disabled) {
			return getPageViews(db, normalizedSlug);
		}

		return upsertPageViews(db, normalizedSlug);
	});

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
			<Views slug={slug} page_type={page_type} disabled={disabled} />
		</div>
	);
};

const Views = ({ slug, page_type, disabled }: Omit<ViewsCounterProps, "hidden">) => {
	const { pathname } = useLocation();
	const normalizedPathname = normalizePathname(slug ?? pathname);

	const fetchViewCount = useServerFn<() => Promise<PageViewCount>>(() =>
		fetchViewCountServerFn({ data: { slug: normalizedPathname, disabled } }),
	);
	const { data, isLoading } = useQuery({
		queryFn: fetchViewCount,
		queryKey: [normalizedPathname, "get-views"],
	});

	if (isLoading) {
		return <p className="m-0 animate-pulse text-xs">Getting view count</p>;
	}

	return <p className="m-0 text-xs">{getViewCountCopy(data?.view_count, page_type)}</p>;
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
	<span className="rounded-global border-primary bg-background text-primary border-2 border-solid p-1 font-mono text-base transition-colors">
		{children}
	</span>
);

function normalizePathname(pathname: string) {
	if (pathname !== "/" && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}

	return pathname;
}
