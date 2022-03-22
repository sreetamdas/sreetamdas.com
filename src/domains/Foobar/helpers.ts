/**
 * Earlier, we'd used localForage to store the data—which tries to store this
 * information on indexedDB—but we've since moved to using Zustand which
 * allows us to persist the data in a much easier manner.
 *
 * Below are some helpers to allow migrating from localForage to Zustand.
 *
 */

import localForage from "localforage";

import { FoobarDataType, FOOBAR_ZUSTAND_KEY, useFoobarStore } from "@/domains/Foobar";

async function getLocalForageData<Type>(key: string): Promise<Type | null> {
	const data = await localForage.getItem<Type>(key);
	return data;
}

export async function migrateLocalForageToZustand<Type extends FoobarDataType>(key: string) {
	const data = await getLocalForageData<Type>(key);
	if (data !== null) {
		useFoobarStore.setState({ foobarData: data });
		await localForage.removeItem(key);
		// eslint-disable-next-line no-console
		console.log(`Migrated data from localForage (${key}) to Zustand (${FOOBAR_ZUSTAND_KEY})`);
	}
}
