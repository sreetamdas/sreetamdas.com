"use client";

import { LinkTo } from "@/lib/components/Anchor";
import { useCustomPlausible } from "@/lib/domains/Plausible";
import { useGlobalStore } from "@/lib/domains/global";

export const FoobarEntry = () => {
	const plausible = useCustomPlausible();
	const { setFoobarData, unlocked } = useGlobalStore((state) => ({
		unlocked: state.foobar_data.unlocked,
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
