"use client";

/**
 * Site-wide /foobar instrumentation. This component plants clues in browser
 * APIs, tracks page visits for achievements, and exposes a resume link only
 * after the persisted foobar state says the game has been unlocked.
 */
import { Link, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { IS_DEV } from "@/config";
import { Code } from "@/lib/components/Typography";
import { useTrackEvent } from "@/lib/domains/Analytics";
import { FOOBAR_ACHIEVEMENTS } from "@/lib/domains/foobar/catalog";
import {
	addFoobarToLocalStorage,
	checkIfAllAchievementsAreDone,
	logConsoleMessages,
} from "@/lib/domains/foobar/helpers";
import { useSharedHunterPresence } from "@/lib/domains/foobar/sharedHunterPresence";
import { useGlobalStore } from "@/lib/domains/global";
import { captureException } from "@/lib/domains/Sentry";
import { useHasMounted } from "@/lib/helpers/hooks";

import { FoobarAchievementReveal } from "./AchievementReveal";
import { FOOBAR_FLAGS } from "./flags";
import { type FoobarSliceType } from "./store";
import { useKonamiAchievement } from "./useKonamiAchievement";

const foobarDataSelector = (state: FoobarSliceType) => ({
	foobar_data: state.foobar_data,
	hasHydrated: state._hasHydrated,
	setFoobarData: state.setFoobarData,
	recordFoobarVisit: state.recordFoobarVisit,
	completeFoobarFlag: state.completeFoobarFlag,
	enqueueFoobarReveal: state.enqueueFoobarReveal,
	recordFoobarClue: state.recordFoobarClue,
});

type FoobarPixelProps = {
	path?: "/404";
};

export const FoobarPixel = ({ path }: FoobarPixelProps) => {
	const { pathname } = useLocation();
	const has_mounted = useHasMounted();
	const trackEvent = useTrackEvent();
	const {
		foobar_data,
		hasHydrated,
		setFoobarData,
		recordFoobarVisit,
		completeFoobarFlag,
		enqueueFoobarReveal,
		recordFoobarClue,
	} = useGlobalStore(useShallow(foobarDataSelector));
	const { unlocked, visited_pages, completed, all_achievements } = foobar_data;
	const titleBeforeVisibilityClue = useRef<string | null>(null);
	const { hunters } = useSharedHunterPresence(
		unlocked && !completed.includes(FOOBAR_FLAGS.campfire.name),
	);
	const handleKonamiComplete = useCallback(() => {
		trackEvent("foobar", { props: { achievement: FOOBAR_FLAGS.konami.name } });
		setFoobarData({ konami: true });
		completeFoobarFlag(FOOBAR_FLAGS.konami.name);
	}, [completeFoobarFlag, trackEvent, setFoobarData]);

	useKonamiAchievement(
		unlocked && !completed.includes(FOOBAR_FLAGS.konami.name),
		handleKonamiComplete,
	);

	useEffect(() => {
		if (hunters === null || hunters < 2 || completed.includes(FOOBAR_FLAGS.campfire.name)) {
			return;
		}

		trackEvent("foobar", { props: { achievement: FOOBAR_FLAGS.campfire.name } });
		completeFoobarFlag(FOOBAR_FLAGS.campfire.name);
	}, [completeFoobarFlag, completed, hunters, trackEvent]);

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
		if (!unlocked || !("serviceWorker" in navigator)) return;

		let active = true;
		void navigator.serviceWorker.register("/foobar-sw.js").catch((error: unknown) => {
			if (active) captureException(error);
		});

		return () => {
			active = false;
		};
	}, [unlocked]);

	useEffect(() => {
		if (
			!unlocked ||
			completed.includes(FOOBAR_FLAGS["tab-visibility"].name) ||
			(pathname !== "/foobar" && !pathname.startsWith("/foobar/"))
		) {
			return;
		}

		const clueTitle = "/foobar/now-you-see-me";
		function handleVisibilityChange() {
			if (document.hidden) {
				titleBeforeVisibilityClue.current = document.title;
				document.title = clueTitle;
				return;
			}

			if (document.title === clueTitle && titleBeforeVisibilityClue.current !== null) {
				document.title = titleBeforeVisibilityClue.current;
			}
			titleBeforeVisibilityClue.current = null;
		}

		document.addEventListener("visibilitychange", handleVisibilityChange);
		handleVisibilityChange();
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			if (document.title === clueTitle && titleBeforeVisibilityClue.current !== null) {
				document.title = titleBeforeVisibilityClue.current;
			}
			titleBeforeVisibilityClue.current = null;
		};
	}, [completed, pathname, unlocked]);

	useEffect(() => {
		if (!hasHydrated) return;

		if (path === "/404") {
			recordFoobarVisit(path);
			if (!completed.includes(FOOBAR_FLAGS.error404.name)) {
				trackEvent("foobar", { props: { achievement: FOOBAR_FLAGS.error404.name } });
				completeFoobarFlag(FOOBAR_FLAGS.error404.name);
			}
			return;
		}

		recordFoobarVisit(pathname);
	}, [completeFoobarFlag, completed, hasHydrated, path, pathname, recordFoobarVisit, trackEvent]);

	useEffect(() => {
		// for the `navigator` achievement
		if (visited_pages.length >= 5 && !completed.includes(FOOBAR_FLAGS.navigator.name)) {
			trackEvent("foobar", { props: { achievement: FOOBAR_FLAGS.navigator.name } });
			completeFoobarFlag(FOOBAR_FLAGS.navigator.name);
		}
	}, [completeFoobarFlag, completed, trackEvent, visited_pages]);

	useEffect(() => {
		// for the `completed` achievement
		if (!all_achievements && checkIfAllAchievementsAreDone(completed)) {
			trackEvent("foobar", { props: { achievement: "completed" } });
			recordFoobarClue(FOOBAR_ACHIEVEMENTS.completed.completion.id);
			enqueueFoobarReveal("completed");
			setFoobarData({
				all_achievements: true,
			});
		}
	}, [
		all_achievements,
		completed,
		enqueueFoobarReveal,
		trackEvent,
		recordFoobarClue,
		setFoobarData,
	]);

	return (
		<>
			<FoobarAchievementReveal />
			{has_mounted && unlocked ? (
				<span className="col-start-2 col-end-3">
					<Link to="/foobar" className="link-base" style={{ border: "none" }}>
						<Code>resume /foobar</Code>
					</Link>
				</span>
			) : null}
		</>
	);
};
