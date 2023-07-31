import { usePlausible } from "next-plausible";

import { type FoobarAchievement } from "@/lib/domains/foobar/flags";

export type PlausibleEventsType = {
	foobar: { achievement: FoobarAchievement | "restart" };
};

export function useCustomPlausible() {
	return usePlausible<PlausibleEventsType>();
}
