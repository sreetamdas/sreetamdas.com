import { clsx } from "clsx";

import { getSupabaseClient } from "./client";

import { IS_DEV } from "@/config";

type ViewsCounterProps = {
	slug: string;
	page_type?: "post" | "page";
	hidden?: boolean;
	disabled?: boolean;
};
export const ViewsCounter = async ({
	slug,
	page_type = "page",
	hidden = false,
	disabled = IS_DEV,
}: ViewsCounterProps) => {
	const { enabled: supabaseEnabled, supabaseClient } = getSupabaseClient();

	if (!supabaseEnabled) {
		// eslint-disable-next-line no-console
		console.error("Supabase is not enabled");
		return null;
	}

	if (disabled) {
		// eslint-disable-next-line no-console
		console.warn("ViewsCounter is disabled", { IS_DEV });
	}

	const getPageViews = async () =>
		disabled
			? await supabaseClient
					.from("page_details")
					.select("view_count")
					.eq("slug", slug)
					.limit(1)
					.single()
			: await supabaseClient.rpc("upsert_page_view", {
					page_slug: slug,
			  });

	const { data, error } = await getPageViews();

	console.log({ data, error });

	return (
		<div
			className={clsx(
				"mx-auto w-fit flex-row justify-center gap-2 pb-10 pt-20",
				hidden ? "hidden" : "flex"
			)}
		>
			<span role="img" aria-label="eyes">
				👀
			</span>
			{/* @ts-expect-error view_count is number here, not number[] */}
			<p className="m-0 text-xs">{getViewCountCopy(data?.view_count ?? 0, page_type)}</p>
		</div>
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
