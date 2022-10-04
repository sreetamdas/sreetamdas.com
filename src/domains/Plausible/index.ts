import { usePlausible } from "next-plausible";

import { FoobarAchievement } from "@/components/foobar/badges";

export type PlausibleEventsType = {
	foobar: { achievement: FoobarAchievement | "restart" };
};

export function useCustomPlausible() {
	return usePlausible<PlausibleEventsType>();
}
