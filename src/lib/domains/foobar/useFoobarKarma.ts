/**
 * /foobar is dark-only: `data-foobar-karma` on <html> makes global.css force
 * the Karma palette. The hook owns the attribute while a Foobar surface is
 * mounted; the early script sets it during <head> parsing so an unlocked
 * dashboard or a certificate never flashes the visitor's light theme first.
 * Locked visitors are left alone, since /foobar must look like a normal 404.
 */
import { useEffect } from "react";

export const FOOBAR_KARMA_EARLY_SCRIPT = `(function () {
	try {
		var root = document.documentElement;
		if (location.pathname.indexOf("/foobar/certificate/") === 0) {
			root.setAttribute("data-foobar-karma", "");
			return;
		}
		var keys = ["foobar-zustand", "foobar-zustand-dev"];
		for (var i = 0; i < keys.length; i++) {
			var saved = JSON.parse(localStorage.getItem(keys[i]) || "null");
			if (saved && saved.state && saved.state.foobar_data && saved.state.foobar_data.unlocked) {
				root.setAttribute("data-foobar-karma", "");
				return;
			}
		}
	} catch (error) {}
})();`;

export function useFoobarKarma() {
	useEffect(() => {
		const root = document.documentElement;
		root.setAttribute("data-foobar-karma", "");
		return () => {
			root.removeAttribute("data-foobar-karma");
		};
	}, []);
}
