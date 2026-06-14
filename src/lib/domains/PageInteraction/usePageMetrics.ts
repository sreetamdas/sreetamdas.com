"use client";

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { fetchPageMetricsServerFn, type PageMetrics } from "./Metrics.server";

export function pageMetricsQueryKey(normalizedPathname: string) {
	return [normalizedPathname, "metrics"] as const;
}

// Shared between ViewsCounter (in metrics mode) and LikeButton so the two
// components dedupe to a single combined request on blog posts.
export function usePageMetrics(normalizedPathname: string, disabled: boolean) {
	const fetchMetrics = useServerFn<() => Promise<PageMetrics>>(() =>
		fetchPageMetricsServerFn({ data: { slug: normalizedPathname, disabled } }),
	);

	return useQuery({
		queryFn: fetchMetrics,
		queryKey: pageMetricsQueryKey(normalizedPathname),
		staleTime: 1000 * 30,
	});
}
