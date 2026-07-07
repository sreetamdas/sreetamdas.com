/**
 * Lightweight stats island shell.
 * Page-view recording stays on the initial hydration path so cached pages still
 * count visits quickly, while the below-the-fold stats UI and its React Query /
 * icon / presence dependencies load as a lazy island.
 */
"use client";

import { useLocation } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { IS_CI } from "@/config";
import { normalizePathname } from "@/lib/helpers/utils";

import { useRecordPageView } from "./useRecordPageView";

export type StatsCounterProps = {
	slug?: string;
	page_type?: "post" | "page";
	hidden?: boolean;
	disabled?: boolean;
	variant?: "views" | "engagement";
};

const StatsCounterView = lazy(() =>
	import("./StatsCounter.view").then((module) => ({ default: module.StatsCounterView })),
);

export const StatsCounter = (props: StatsCounterProps) => {
	const { pathname } = useLocation();
	const disabled = props.disabled ?? IS_CI;
	const normalizedPathname = normalizePathname(props.slug ?? pathname);

	useRecordPageView(normalizedPathname, disabled);

	return (
		<Suspense fallback={null}>
			<StatsCounterView {...props} normalizedPathname={normalizedPathname} disabled={disabled} />
		</Suspense>
	);
};
