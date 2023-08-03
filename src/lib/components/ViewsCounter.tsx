import { clsx } from "clsx";

import { IS_DEV } from "@/config";
import { getPageViews, upsertPageViews } from "@/lib/domains/Supabase";

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
	if (disabled) {
		// eslint-disable-next-line no-console
		console.warn("ViewsCounter is disabled", { IS_DEV });
	}

	// when disabled, only read, not update and get
	const { data, error } = disabled ? await getPageViews(slug) : await upsertPageViews(slug);

	// eslint-disable-next-line no-console
	console.log({ data, slug, CI: process.env.CI, error });

	return (
		<div
			className={clsx(
				"mx-auto mb-5 mt-auto w-full flex-row items-center justify-center gap-2 pt-40",
				hidden ? "hidden" : "flex"
			)}
		>
			<span role="img" aria-label="eyes">
				👀
			</span>
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
