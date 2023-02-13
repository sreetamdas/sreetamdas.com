import { usePlausible } from "next-plausible";

export type PlausibleEventsType = {
	// foobar: { achievement: FoobarAchievement | "restart" };
};

export function useCustomPlausible() {
	return usePlausible<PlausibleEventsType>();
}
