import { useShallow } from "zustand/react/shallow";

import { Gradient } from "@/lib/components/Typography";
import { FOOBAR_FLAGS } from "@/lib/domains/foobar/flags";
import { useGlobalStore } from "@/lib/domains/global";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import { ReactNode } from "react";

export const NotFound404 = ({ message }: { message?: ReactNode }) => {
	return (
		<>
			<h1 className="pt-10 text-center font-serif text-[160px] font-bold tracking-tighter">
				<Gradient>404!</Gradient>
			</h1>
			<p className="pt-4 text-center font-serif text-xl">
				{message ?? "The page you\u2019re looking for doesn\u2019t exist :/"}
			</p>

			<p className="pt-40 text-center">
				<a className="link-base" href="/">
					Go back home
				</a>
			</p>

			<NotFoundDogsLink />
		</>
	);
};

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
			<a
				href="https://www.theguardian.com/lifeandstyle/gallery/2018/jul/18/dog-photographer-of-the-year-2018-in-pictures"
				target="_blank"
				onClick={handleDogsLinkClicked}
				className="link-base"
			>
				the winners of Dog Photographer of the Year 2018
				<br />
				from The Guardian
			</a>
		</p>
	);
};
