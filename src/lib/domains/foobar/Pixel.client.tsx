"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { FOOBAR_FLAGS, type FoobaFlagPageSlug } from "./flags";
import { type FoobarSliceType } from "./store";

import { IS_DEV } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";
import { Code } from "@/lib/components/Typography";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import {
	addFoobarToLocalStorage,
	checkIfAllAchievementsAreDone,
	logConsoleMessages,
} from "@/lib/domains/foobar/helpers";
import { useGlobalStore } from "@/lib/domains/global";
import { useHasMounted } from "@/lib/helpers/hooks";

const foobarDataSelector = (state: FoobarSliceType) => ({
	foobar_data: state.foobar_data,
	setFoobarData: state.setFoobarData,
});

type FoobarPixelProps = {
	path?: `/${Extract<FoobaFlagPageSlug, "404">}`;
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
	const { foobar_data, setFoobarData } = useGlobalStore(foobarDataSelector);
	const { unlocked, visited_pages, completed } = foobar_data;

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
		if (props.path === `/${FOOBAR_FLAGS.error404.slug}`) {
			page_name = `/${FOOBAR_FLAGS.error404.slug}`;

			if (!completed.includes(FOOBAR_FLAGS.error404.name)) {
				setFoobarData({
					completed: completed.concat([FOOBAR_FLAGS.error404.name]),
				});
			}
		}

		if (!visited_pages?.includes(page_name)) {
			setFoobarData({
				visited_pages: visited_pages.concat([page_name]),
			});
		}

		// for the `navigator` achievement
		if (visited_pages.length >= 5 && !completed.includes(FOOBAR_FLAGS.navigator.name)) {
			plausibleEvent("foobar", { props: { achievement: FOOBAR_FLAGS.navigator.name } });
			setFoobarData({
				completed: completed.concat([FOOBAR_FLAGS.navigator.name]),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [completed, visited_pages, pathname]);

	useEffect(() => {
		// for the `completed` achievement
		if (checkIfAllAchievementsAreDone(completed)) {
			plausibleEvent("foobar", { props: { achievement: "completed" } });
			setFoobarData({
				all_achievements: true,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [completed]);

	return has_mounted && unlocked ? (
		<span className="col-start-2 col-end-3">
			<Code>
				<LinkTo href="/foobar" style={{ border: "none" }}>
					resume /foobar
				</LinkTo>
			</Code>
		</span>
	) : null;
};
