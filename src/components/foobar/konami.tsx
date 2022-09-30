import { useState, useEffect } from "react";

import { FOOBAR_PAGES, useFoobarStore } from "@/domains/Foobar";
import { KONAMI_CODE } from "@/domains/Foobar/konami";
import { useCustomPlausible } from "@/domains/Plausible";
import { useKeydownEvent } from "@/utils/hooks";

function useKonamiCode() {
	const [count, setCount] = useState(0);
	const [success, setSuccess] = useState(false);
	const key = useKeydownEvent();

	function resetKonami() {
		setSuccess(false);
		setCount(0);
	}

	useEffect(() => {
		if (key === null) return;
		if (key !== KONAMI_CODE[count]) {
			setCount(0);
			return;
		}

		setCount((state) => state + 1);
		if (count + 1 === KONAMI_CODE.length) {
			setSuccess(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	return { success, resetKonami };
}

const KonamiWrapper = () => {
	const plausibleEvent = useCustomPlausible();
	const { success, resetKonami } = useKonamiCode();
	const { foobarData, setFoobarData } = useFoobarStore((state) => ({
		foobarData: {
			completed: state.foobarData.completed,
			konami: state.foobarData.konami,
			unlocked: state.foobarData.unlocked,
		},
		setFoobarData: state.setFoobarData,
	}));
	const [isKonamiActive, setIsKonamiActive] = useState(() => foobarData.konami);

	useEffect(() => {
		if (foobarData.unlocked && success) {
			const firstTimeKonami = !foobarData.completed.includes("konami");

			if (firstTimeKonami) {
				plausibleEvent("foobar", { props: { achievement: "konami" } });
			}
			setFoobarData({
				konami: !isKonamiActive,
				completed: [...new Set([...foobarData.completed, FOOBAR_PAGES.konami])],
			});

			setIsKonamiActive((isActive) => !isActive);
			resetKonami();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [foobarData.unlocked, success]);
	return <div />;
};

export { KonamiWrapper };
