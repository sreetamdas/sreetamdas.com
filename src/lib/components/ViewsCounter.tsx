import { useQuery } from "@tanstack/react-query";
import { IS_CI, IS_DEV } from "@/config";
import { cn } from "@/lib/helpers/utils";
import { cloudflareMiddleware } from "@/lib/domains/cloudflare/middleware";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { useLocation } from "@tanstack/react-router";
import { z } from "zod";
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
	.middleware([cloudflareMiddleware])
	.inputValidator((data) => {
		return PagePathname.parse(data);
	})
	.handler(async ({ data, context }) => {
		if (!context?.env) {
			throw new Error("Cloudflare env not available in server function context");
		}

		const [{ getDb }, { getPageViews, upsertPageViews }] = await Promise.all([
			import("@/db"),
			import("@/lib/domains/PageViews"),
		]);

		const db = getDb(context.env);

		if (data.disabled) {
			return getPageViews(db, data.slug);
		}

		return upsertPageViews(db, data.slug);
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

const Views = ({ page_type, disabled }: Omit<ViewsCounterProps, "hidden">) => {
	const { pathname } = useLocation();

	const fetchViewCount = useServerFn<() => Promise<PageViewCount>>(() =>
		fetchViewCountServerFn({ data: { slug: pathname, disabled } }),
	);
	const { data, isLoading } = useQuery({
		queryFn: fetchViewCount,
		queryKey: [pathname, "get-views"],
	});

	if (isLoading) {
		return <p className="m-0 text-xs">Getting view count</p>;
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
