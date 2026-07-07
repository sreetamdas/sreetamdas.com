/**
 * Client page-view server-function hook.
 *
 * Metrics reads stay separate and replay-safe; this hook calls the same-origin
 * server function once per pathname per hydrated page so cached HTML can still
 * record views without adding a raw public API endpoint.
 */
"use client";

import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { recordPageViewServerFn, type PageViewRecordResult } from "./ViewRecorder.server";

const recordedPathnames = new Set<string>();
const recordPromises = new Map<string, Promise<PageViewRecordResult>>();

export function waitForPageViewRecord(normalizedPathname: string) {
	return (
		recordPromises.get(normalizedPathname) ??
		Promise.resolve<PageViewRecordResult>({ recorded: false })
	);
}

export function useRecordPageView(normalizedPathname: string, disabled: boolean) {
	const recordPageView = useServerFn<() => Promise<PageViewRecordResult>>(() =>
		recordPageViewServerFn({ data: { slug: normalizedPathname, disabled } }),
	);

	useEffect(() => {
		if (disabled || recordedPathnames.has(normalizedPathname)) {
			return;
		}

		recordedPathnames.add(normalizedPathname);
		const recordPromise = recordPageView().catch(() => ({ recorded: false }));
		recordPromises.set(normalizedPathname, recordPromise);
		void recordPromise;
	}, [disabled, normalizedPathname, recordPageView]);
}
