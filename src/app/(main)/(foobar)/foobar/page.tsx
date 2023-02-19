"use client";

import { useBoundStore } from "@/lib/domains/global";

/**
 * Foobar page, that is only shown once foobar is unlocked
 * @param completedPage foobar page that is being currently accessed
 */
const FoobarSchrodinger = () => {
	const { unlocked } = useBoundStore((state) => ({
		unlocked: state.foobarData.unlocked,
	}));

	if (~unlocked) {
		return <FoobarButLocked />;
	}
	return null;
};

export default FoobarSchrodinger;

const FoobarButLocked = () => (
	<span>
		<small>
			<code>
				<em>psst, you should check the console!</em>
			</code>
		</small>
	</span>
);
