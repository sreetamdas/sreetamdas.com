"use client";

/**
 * Reusable embedded-tweet component backed by `react-tweet` (Vercel).
 *
 * `react-tweet` renders tweets as pure React from X's syndication API via SWR
 * (client fetch), with no third-party `widgets.js` script, so it works in both
 * the SSR blog MDX pipeline and the client-rendered slide deck pipeline. The
 * `theme.css` it pulls in themes the card via `data-theme` / `.dark` / `.light`
 * or `prefers-color-scheme`.
 *
 * Usage in MDX (available site-wide via customMDXComponents/slideMDXComponents):
 *   <Tweet id="2071647669467201657" />
 *   <Tweet id="..." className="[zoom:1.5]" />
 */
import { Tweet as ReactTweet } from "react-tweet";

import { cn } from "@/lib/helpers/utils";

type TweetProps = {
	id: string;
	className?: string;
};

export function Tweet({ id, className }: TweetProps) {
	return (
		<div className={cn("mx-auto flex justify-center [&_.react-tweet-theme]:my-0", className)}>
			<ReactTweet id={id} />
		</div>
	);
}
