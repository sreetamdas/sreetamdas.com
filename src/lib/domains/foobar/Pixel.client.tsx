"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { FOOBAR_PAGES, type FoobarSliceType } from "./flags";

import { IS_DEV } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import {
	addFoobarToLocalStorage,
	checkIfAllAchievementsAreDone,
	logConsoleMessages,
} from "@/lib/domains/foobar/helpers";
import { useGlobalStore } from "@/lib/domains/global";
import { useHasMounted } from "@/lib/helpers/hooks";

const foobarDataSelector = (state: FoobarSliceType) => ({
	foobarData: state.foobarData,
	setFoobarData: state.setFoobarData,
});

type FoobarPixelProps = {
	path?: "/404";
};

/**
 * Entry point into /foobar
 * - Adds link to resume /foobar
 * - Adds required console messages and other helpers
 * - Track navigation for corresponding achievements
 */
export const FoobarPixel = (props: FoobarPixelProps) => {
	const pathname = usePathname();
	const has_mounted = useHasMounted();
	const plausibleEvent = useCustomPlausible();
	const { foobarData, setFoobarData } = useGlobalStore(foobarDataSelector);
	const { unlocked, visitedPages, completed } = foobarData;

	useEffect(() => {
		// Add functions for Foobar badges
		addFoobarToLocalStorage();

		// @ts-expect-error add custom function
		window.hack = () => {
			// eslint-disable-next-line no-console
			console.warn("/foobar/hack");
		};

		if (!IS_DEV) {
			logConsoleMessages();
		}
	}, []);

	useEffect(() => {
		let page_name = pathname;
		if (props.path === "/404") {
			page_name = "/404";

			if (!completed.includes(FOOBAR_PAGES.notFound)) {
				setFoobarData({
					completed: completed.concat([FOOBAR_PAGES.notFound]),
				});
			}
		}

		if (!visitedPages?.includes(page_name)) {
			setFoobarData({
				visitedPages: visitedPages.concat([page_name]),
			});
		}

		// for the `navigator` achievement
		if (visitedPages.length >= 5 && !completed.includes(FOOBAR_PAGES.navigator)) {
			plausibleEvent("foobar", { props: { achievement: FOOBAR_PAGES.navigator } });
			setFoobarData({
				completed: completed.concat([FOOBAR_PAGES.navigator]),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [completed, visitedPages, pathname]);

	useEffect(() => {
		// for the `completed` achievement
		if (checkIfAllAchievementsAreDone(completed)) {
			plausibleEvent("foobar", { props: { achievement: "completed" } });
			setFoobarData({
				allAchievements: true,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [completed]);

	return has_mounted && unlocked ? (
		<span className="col-start-2 col-end-3">
			<code>
				<LinkTo href="/foobar" style={{ border: "none" }}>
					resume /foobar
				</LinkTo>
			</code>
		</span>
	) : null;
};
