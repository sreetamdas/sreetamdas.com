/**
 * Client page-view beacon hook.
 *
 * Metrics reads stay separate and replay-safe; this hook sends one same-origin
 * POST per pathname per hydrated page so cached HTML can still record views.
 */
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const recordedPathnames = new Set<string>();

export function useRecordPageView(normalizedPathname: string, disabled: boolean) {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (disabled || recordedPathnames.has(normalizedPathname)) {
			return;
		}

		recordedPathnames.add(normalizedPathname);
		const request = fetch("/api/views", {
			method: "POST",
			body: JSON.stringify({ slug: normalizedPathname }),
			headers: { "content-type": "application/json" },
			credentials: "same-origin",
			keepalive: true,
		});

		void request
			.then((response) => {
				if (response.ok) {
					void queryClient.invalidateQueries({ queryKey: [normalizedPathname] });
				}
			})
			.catch(() => undefined);
	}, [disabled, normalizedPathname, queryClient]);
}
