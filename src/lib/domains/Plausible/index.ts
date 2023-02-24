import { usePlausible } from "next-plausible";

import { FoobarAchievement } from "@/lib/domains/foobar/flags";

export type PlausibleEventsType = {
	foobar: { achievement: FoobarAchievement | "restart" };
};

export function useCustomPlausible() {
	return usePlausible<PlausibleEventsType>();
}
