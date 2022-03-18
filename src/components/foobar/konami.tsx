import { useState, useCallback, useEffect } from "react";

import { useFoobarStore } from "@/domains/Foobar";
import { handleKonami } from "@/domains/Foobar/konami";

const KonamiWrapper = () => {
	const [konamiCodeInput, setKonamiCodeInput] = useState<Array<string>>([]);
	const foobarStoreData = useFoobarStore((state) => ({
		foobarData: {
			completed: state.foobarData.completed,
			konami: state.foobarData.konami,
			unlocked: state.foobarData.unlocked,
		},
		setFoobarData: state.setFoobarData,
	}));
	const {
		foobarData: { unlocked },
	} = foobarStoreData;

	const handleKonamiCode = useCallback((event: KeyboardEvent) => {
		setKonamiCodeInput((prev) => [...prev, event.key]);
	}, []);
	useEffect(() => {
		window.addEventListener("keydown", handleKonamiCode);

		return () => {
			window.removeEventListener("keydown", handleKonamiCode);
		};
	}, [handleKonamiCode]);

	useEffect(() => {
		if (unlocked) {
			const updated = handleKonami(konamiCodeInput, foobarStoreData);
			if (updated) setKonamiCodeInput(updated);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [konamiCodeInput]);
	return <div />;
};

export { KonamiWrapper };
