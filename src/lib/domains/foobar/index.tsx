"use client";

// import { usePathname } from "next/navigation";
// import { useEffect } from "react";

// import { logConsoleMessages } from "./console";
import { FoobarSliceType } from "./flags";
// import { addFoobarToLocalStorage, checkIfAllAchievementsAreDone } from "./helpers";

// import { IS_DEV } from "@/config";
import { LinkTo } from "@/lib/components/Anchor";
// import { useCustomPlausible } from "@/lib/domains/Plausible";
import { useBoundStore } from "@/lib/domains/global";
import { useHasMounted } from "@/lib/helpers/hooks";

const foobarDataSelector = (state: FoobarSliceType) => ({
	foobarStoreData: state.foobarData,
	setFoobarStoreData: state.setFoobarData,
});

/**
 * Entry point into /foobar
 * - Adds link to resume /foobar
 * - Adds required console messages and other helpers
 */
export const FoobarPixel = () => {
	// const pathname = usePathname();
	const hasMounted = useHasMounted();
	// const plausibleEvent = useCustomPlausible();
	const { foobarStoreData } = useBoundStore(foobarDataSelector);
	const { unlocked } = foobarStoreData;

	// useEffect(() => {
	// 	// Add functions for Foobar badges
	// 	addFoobarToLocalStorage();

	// 	// @ts-expect-error add custom function
	// 	window.hack = () => {
	// 		// eslint-disable-next-line no-console
	// 		console.warn("/foobar/hack");
	// 	};

	// 	if (!IS_DEV) logConsoleMessages();
	// }, []);

	// useEffect(() => {
	// 	let pageName = pathname;
	// 	if (pathname === "/404") pageName = "/404";

	// 	if (!visitedPages?.includes(pageName)) {
	// 		setFoobarStoreData({
	// 			visitedPages: [...visitedPages, pageName],
	// 		});
	// 	}

	// 	// for the `navigator` achievement
	// 	if (visitedPages.length >= 5 && !completed.includes(FOOBAR_PAGES.navigator)) {
	// 		plausibleEvent("foobar", { props: { achievement: FOOBAR_PAGES.navigator } });
	// 		setFoobarStoreData({
	// 			completed: [...completed, FOOBAR_PAGES.navigator],
	// 		});
	// 	}
	// }, [completed, visitedPages, pathname]);

	// useEffect(() => {
	// 	// for the `completed` achievement
	// 	if (checkIfAllAchievementsAreDone(completed)) {
	// 		plausibleEvent("foobar", { props: { achievement: "completed" } });
	// 		setFoobarStoreData({
	// 			allAchievements: true,
	// 		});
	// 	}
	// }, [completed]);

	// useEffect(() => {
	// 	console.log("pathname", pathname);
	// }, [pathname]);

	return hasMounted && unlocked ? (
		<span>
			<code>
				<LinkTo href="/foobar" style={{ border: "none" }}>
					resume /foobar
				</LinkTo>
			</code>
		</span>
	) : null;
};
