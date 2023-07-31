import { type FoobarSliceType, FOOBAR_PAGES } from "./flags";

export function checkIfAllAchievementsAreDone(
	completed: FoobarSliceType["foobarData"]["completed"]
) {
	const allPages = Object.values(FOOBAR_PAGES);
	if (completed.length !== allPages.length) return false;

	return allPages.every((page) => completed.includes(page));
}

export function addFoobarToLocalStorage() {
	localStorage.setItem("foobar", "/foobar/localforage");
}
