/**
 * Client page-view server-function hook.
 *
 * Metrics reads stay separate and replay-safe; this hook calls the same-origin
 * server function once per pathname per hydrated page so cached HTML can still
 * record views without adding a raw public API endpoint.
 */
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { recordPageViewServerFn, type PageViewRecordResult } from "./ViewRecorder.server";

const recordedPathnames = new Set<string>();

export function useRecordPageView(normalizedPathname: string, disabled: boolean) {
	const queryClient = useQueryClient();
	const recordPageView = useServerFn<() => Promise<PageViewRecordResult>>(() =>
		recordPageViewServerFn({ data: { slug: normalizedPathname, disabled } }),
	);

	useEffect(() => {
		if (disabled || recordedPathnames.has(normalizedPathname)) {
			return;
		}

		recordedPathnames.add(normalizedPathname);
		void recordPageView()
			.then((result) => {
				if (result.recorded) {
					void queryClient.invalidateQueries({ queryKey: [normalizedPathname] });
				}
			})
			.catch(() => undefined);
	}, [disabled, normalizedPathname, queryClient, recordPageView]);
}
