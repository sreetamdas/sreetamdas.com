import { usePlausible } from "next-plausible";

import { type FoobarFlag } from "@/lib/domains/foobar/flags";

export type PlausibleEventsType = {
	// TODO implement the "restart" flag
	foobar: { achievement: FoobarFlag | "restart" };
};

export function useCustomPlausible() {
	return usePlausible<PlausibleEventsType>();
}
