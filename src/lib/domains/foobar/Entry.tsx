"use client";

/**
 * Hidden entry point for /foobar. The invisible Roman numeral X is placed in
 * regular site UI and unlocks the game the first time a curious visitor finds it.
 */
import { Link } from "@tanstack/react-router";
import { useShallow } from "zustand/react/shallow";

import { useTrackEvent } from "@/lib/domains/Analytics";
import { FOOBAR_FLAGS } from "@/lib/domains/foobar/flags";
import { useGlobalStore } from "@/lib/domains/global";

export const FoobarEntry = () => {
	const trackEvent = useTrackEvent();
	const { setFoobarData, unlocked } = useGlobalStore(
		useShallow((state) => ({
			unlocked: state.foobar_data.unlocked,
			setFoobarData: state.setFoobarData,
		})),
	);

	function handleXDiscovery() {
		if (!unlocked) {
			trackEvent("foobar", { props: { achievement: FOOBAR_FLAGS.unlocked.name } });
			setFoobarData({ unlocked: true });
		}
	}
	return (
		<span className="flex justify-center">
			<Link to="/foobar" data-testid="Ⅹ" className="text-background" onClick={handleXDiscovery}>
				Ⅹ
			</Link>
		</span>
	);
};
