"use client";

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { fetchPageMetricsServerFn, type PageMetrics } from "./Metrics.server";
import { waitForPageViewRecord } from "./useRecordPageView";

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
		queryFn: async () => {
			await waitForPageViewRecord(normalizedPathname);
			return fetchMetrics();
		},
		queryKey: pageMetricsQueryKey(normalizedPathname),
		enabled: !disabled,
		staleTime: 1000 * 30,
		// This RPC no longer records a view (the increment moved to the Worker
		// document-request path), but we still avoid background replays so a stale
		// window doesn't churn the counter reads.
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
	});
}
