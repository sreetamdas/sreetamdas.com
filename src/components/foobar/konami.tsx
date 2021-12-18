import { useState, useCallback, useEffect, useContext } from "react";

import { FoobarContext } from "@/components/foobar";
import { handleKonami } from "@/utils/console";

const KonamiWrapper = () => {
	const foobarContextObj = useContext(FoobarContext);
	const [konamiCodeInput, setKonamiCodeInput] = useState<Array<string>>([]);

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
		if (foobarContextObj.unlocked) {
			const updated = handleKonami(konamiCodeInput, foobarContextObj);
			if (updated) setKonamiCodeInput(updated);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [konamiCodeInput]);
	return <div />;
};

export { KonamiWrapper };
