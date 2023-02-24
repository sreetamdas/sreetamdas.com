"use client";

import { LinkTo } from "@/lib/components/Anchor";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import { useBoundStore } from "@/lib/domains/global";

export const FoobarEntry = () => {
	const plausible = useCustomPlausible();
	const { setFoobarData, unlocked } = useBoundStore((state) => ({
		unlocked: state.foobarData.unlocked,
		setFoobarData: state.setFoobarData,
	}));

	function handleXDiscovery() {
		if (!unlocked) {
			plausible("foobar", { props: { achievement: "/" } });
			setFoobarData({ unlocked: true });
		}
	}
	return (
		<span className="flex justify-center">
			<LinkTo
				href="/foobar"
				data-testid="Ⅹ"
				className="text-background"
				onClick={handleXDiscovery}
				prefetch={false}
			>
				Ⅹ
			</LinkTo>
		</span>
	);
};
