import { useEffect } from "react";

/** Marks the document as /foobar while mounted; global.css forces the Karma palette from it. */
export function useFoobarKarma() {
	useEffect(() => {
		const root = document.documentElement;
		root.setAttribute("data-foobar-karma", "");
		return () => {
			root.removeAttribute("data-foobar-karma");
		};
	}, []);
}
