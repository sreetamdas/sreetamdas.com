"use client";

/**
 * Site-wide /foobar instrumentation. This component plants clues in browser
 * APIs, tracks page visits for achievements, and exposes a resume link only
 * after the persisted foobar state says the game has been unlocked.
 */
import { Link, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { IS_DEV } from "@/config";
import { Code } from "@/lib/components/Typography";
import { FOOBAR_ACHIEVEMENTS } from "@/lib/domains/foobar/catalog";
import {
	addFoobarToLocalStorage,
	checkIfAllAchievementsAreDone,
	logConsoleMessages,
} from "@/lib/domains/foobar/helpers";
import { useGlobalStore } from "@/lib/domains/global";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import { useHasMounted } from "@/lib/helpers/hooks";

import { type FoobaFlagPageSlug, FOOBAR_FLAGS } from "./flags";
import { type FoobarSliceType } from "./store";
import { useKonamiAchievement } from "./useKonamiAchievement";

const foobarDataSelector = (state: FoobarSliceType) => ({
	foobar_data: state.foobar_data,
	setFoobarData: state.setFoobarData,
	completeFoobarFlag: state.completeFoobarFlag,
	recordFoobarClue: state.recordFoobarClue,
});

type FoobarPixelProps = {
	path?: `/${Extract<FoobaFlagPageSlug, "404">}`;
};

export const FoobarPixel = ({ path }: FoobarPixelProps) => {
	const { pathname } = useLocation();
	const has_mounted = useHasMounted();
	const plausibleEvent = useCustomPlausible();
	const { foobar_data, setFoobarData, completeFoobarFlag, recordFoobarClue } = useGlobalStore(
		useShallow(foobarDataSelector),
	);
	const { unlocked, visited_pages, completed, all_achievements } = foobar_data;
	const handleKonamiComplete = useCallback(() => {
		plausibleEvent("foobar", { props: { achievement: FOOBAR_FLAGS.konami.name } });
		setFoobarData({ konami: true });
		completeFoobarFlag(FOOBAR_FLAGS.konami.name);
	}, [completeFoobarFlag, plausibleEvent, setFoobarData]);

	useKonamiAchievement(
		unlocked && !completed.includes(FOOBAR_FLAGS.konami.name),
		handleKonamiComplete,
	);

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
		if (path === `/${FOOBAR_FLAGS.error404.slug}`) {
			page_name = `/${FOOBAR_FLAGS.error404.slug}`;

			if (!completed.includes(FOOBAR_FLAGS.error404.name)) {
				plausibleEvent("foobar", { props: { achievement: FOOBAR_FLAGS.error404.name } });
				completeFoobarFlag(FOOBAR_FLAGS.error404.name);
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
			completeFoobarFlag(FOOBAR_FLAGS.navigator.name);
		}
	}, [completeFoobarFlag, completed, path, pathname, plausibleEvent, setFoobarData, visited_pages]);

	useEffect(() => {
		// for the `completed` achievement
		if (!all_achievements && checkIfAllAchievementsAreDone(completed)) {
			plausibleEvent("foobar", { props: { achievement: "completed" } });
			recordFoobarClue(FOOBAR_ACHIEVEMENTS.completed.completion.id);
			setFoobarData({
				all_achievements: true,
			});
		}
	}, [all_achievements, completed, plausibleEvent, recordFoobarClue, setFoobarData]);

	return has_mounted && unlocked ? (
		<span className="col-start-2 col-end-3">
			<Link to="/foobar" className="link-base" style={{ border: "none" }}>
				<Code>resume /foobar</Code>
			</Link>
		</span>
	) : null;
};
