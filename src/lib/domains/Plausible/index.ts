import { usePlausible } from "next-plausible";

import { type FoobarFlag } from "@/lib/domains/foobar/flags";

export type PlausibleEventsType = {
	foobar: { achievement: FoobarFlag };
};

export function useCustomPlausible() {
	return usePlausible<PlausibleEventsType>();
}
