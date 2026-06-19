"use client";

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { fetchPageMetricsServerFn, type PageMetrics } from "./Metrics.server";

export function pageMetricsQueryKey(normalizedPathname: string) {
	return [normalizedPathname, "metrics"] as const;
}

// Shared by the engagement StatsCounter so page views and likes come from one
// combined request while live presence stays on its WebSocket.
export function usePageMetrics(normalizedPathname: string, disabled: boolean) {
	const fetchMetrics = useServerFn<() => Promise<PageMetrics>>(() =>
		fetchPageMetricsServerFn({ data: { slug: normalizedPathname, disabled } }),
	);

	return useQuery({
		queryFn: fetchMetrics,
		queryKey: pageMetricsQueryKey(normalizedPathname),
		staleTime: 1000 * 30,
		// The view-count read also records a view; avoid automatic background replays.
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
	});
}
