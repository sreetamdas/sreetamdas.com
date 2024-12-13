"use client";

import { useShallow } from "zustand/react/shallow";

import { LinkTo } from "@/lib/components/Anchor";
import { FOOBAR_FLAGS } from "@/lib/domains/foobar/flags";
import { useGlobalStore } from "@/lib/domains/global";
import { useCustomPlausible } from "@/lib/domains/Plausible";

export const NotFoundDogsLink = () => {
	const { setFoobarData, completed } = useGlobalStore(
		useShallow((state) => ({
			completed: state.foobar_data.completed,
			setFoobarData: state.setFoobarData,
		})),
	);
	const plausibleEvent = useCustomPlausible();

	function handleDogsLinkClicked() {
		if (!completed.includes(FOOBAR_FLAGS.dogs.name)) {
			plausibleEvent("foobar", { props: { achievement: FOOBAR_FLAGS.dogs.name } });
			setFoobarData({
				completed: completed.concat([FOOBAR_FLAGS.dogs.name]),
			});
		}
	}

	return (
		<p className="pt-4 text-center">
			or check out{" "}
			<LinkTo
				href="https://www.theguardian.com/lifeandstyle/gallery/2018/jul/18/dog-photographer-of-the-year-2018-in-pictures"
				target="_blank"
				onClick={handleDogsLinkClicked}
			>
				the winners of Dog Photographer of the Year 2018
				<br />
				from The Guardian
			</LinkTo>
		</p>
	);
};
