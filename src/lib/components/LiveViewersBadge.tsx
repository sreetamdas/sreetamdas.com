"use client";

import { cn } from "@/lib/helpers/utils";

import { useLiveViewerCount } from "./useLiveViewerCount";

export const LiveViewersBadge = ({
	className,
	bare = false,
}: {
	className?: string;
	bare?: boolean;
}) => {
	const { count, connected } = useLiveViewerCount();

	return (
		<div
			className={cn(
				"flex items-center gap-2 font-mono text-xs text-foreground",
				bare
					? null
					: "mx-4 rounded-global border border-solid border-foreground/15 bg-background px-2 py-1",
				className,
			)}
			title={connected ? "Live viewers (real-time)" : "Live viewers (connecting...)"}
			aria-live="polite"
		>
			{connected ? (
				<span className="relative flex h-2 w-2">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
					<span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
				</span>
			) : (
				<span className="relative flex h-2 w-2">
					<span className="relative inline-flex h-2 w-2 rounded-full bg-foreground/30" />
				</span>
			)}
			<span className="whitespace-nowrap">
				Live:{" "}
				<span className="text-primary">{count === null ? "..." : count.toLocaleString()}</span>
			</span>
		</div>
	);
};
