"use client";

import { LinkTo } from "@/lib/components/Anchor";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import { FOOBAR_PAGES, type FoobarPageSlug } from "@/lib/domains/foobar/flags";
import { useGlobalStore } from "@/lib/domains/global";

export const NotFoundDogsLink = () => {
	const { setFoobarData, completed } = useGlobalStore((state) => ({
		completed: state.foobarData.completed,
		setFoobarData: state.setFoobarData,
	}));
	const plausibleEvent = useCustomPlausible();

	function handleDogsLinkClicked() {
		const updatedPages: Array<FoobarPageSlug> = [...completed];
		if (!updatedPages.includes(FOOBAR_PAGES.dogs)) {
			updatedPages.push(FOOBAR_PAGES.dogs);
			plausibleEvent("foobar", { props: { achievement: FOOBAR_PAGES.dogs } });
			setFoobarData({
				completed: updatedPages,
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
