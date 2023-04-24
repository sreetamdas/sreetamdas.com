"use client";

import GlobalNotFound from "@/app/not-found";
import { useGlobalStore } from "@/lib/domains/global";

/**
 * Foobar page, that is only shown once foobar is unlocked
 * @param completedPage foobar page that is being currently accessed
 */
const FoobarSchrodinger = () => {
	const { unlocked } = useGlobalStore((state) => ({
		unlocked: state.foobarData.unlocked,
	}));

	if (!unlocked) {
		return <FoobarButLocked />;
	}
	return <h1>UNLOCKED</h1>;
};

export default FoobarSchrodinger;

const FoobarButLocked = () => (
	<GlobalNotFound
		message={<p className="pt-5 text-center text-xs">psst, you should check the console!</p>}
	/>
);
