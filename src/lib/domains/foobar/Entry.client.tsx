import { useShallow } from "zustand/react/shallow";

import { LinkTo } from "@/lib/components/Anchor";
import { FOOBAR_FLAGS } from "@/lib/domains/foobar/flags";
import { useGlobalStore } from "@/lib/domains/global";
import { useCustomPlausible } from "@/lib/domains/Plausible";

export const FoobarEntry = () => {
	const plausible = useCustomPlausible();
	const { setFoobarData, unlocked } = useGlobalStore(
		useShallow((state) => ({
			unlocked: state.foobar_data.unlocked,
			setFoobarData: state.setFoobarData,
		})),
	);

	function handleXDiscovery() {
		if (!unlocked) {
			plausible("foobar", { props: { achievement: FOOBAR_FLAGS.unlocked.name } });
			setFoobarData({ unlocked: true });
		}
	}
	return (
		<span className="flex justify-center">
			<LinkTo href="/foobar" data-testid="Ⅹ" className="text-background" onClick={handleXDiscovery}>
				Ⅹ
			</LinkTo>
		</span>
	);
};
