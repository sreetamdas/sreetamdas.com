"use client";

import { useEffect } from "react";

import { LinkTo } from "@/lib/components/Anchor";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import { DocumentHead } from "@/lib/domains/SEO";
import { FoobarPageSlug, FOOBAR_PAGES } from "@/lib/domains/foobar/flags";
import { useBoundStore } from "@/lib/domains/global";

export type T404PageMessage = {
	message?: string;
};
export const Custom404 = ({ message }: T404PageMessage) => {
	const { setFoobarData, completed } = useBoundStore((state) => ({
		completed: state.foobarData.completed,
		setFoobarData: state.setFoobarData,
	}));
	const plausibleEvent = useCustomPlausible();

	useEffect(() => {
		const updatedPages: Array<FoobarPageSlug> = [...completed];

		if (!updatedPages.includes(FOOBAR_PAGES.notFound)) {
			updatedPages.push(FOOBAR_PAGES.notFound);
			setFoobarData({
				completed: updatedPages,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [completed]);

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
		<>
			<DocumentHead title="404!" description="Ugh, you're in the wrong place :/" noIndex />

			<div className="flex flex-col items-center">
				<h1 className="pt-12 font-serif text-[180px]">404!</h1>
				<p className="py-5 font-serif text-6xl">Page not found :(</p>
			</div>

			<p className="flex flex-col items-center pt-20">
				<LinkTo href="/" className="text-3xl font-bold">
					Go back home
				</LinkTo>
				<br />
				<span className="pt-12 text-center">
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
				</span>
				{message ? <em className="py-12 text-sm">{message}</em> : null}
			</p>
		</>
	);
};
