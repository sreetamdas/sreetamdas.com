/** Invalidates client sync responses that belong to an earlier cloud-save lifecycle. */

export type FoobarCloudSyncToken = number;

export function createFoobarCloudSyncSession() {
	let generation = 0;

	return {
		begin: (): FoobarCloudSyncToken => generation,
		invalidate: () => {
			generation += 1;
		},
		isCurrent: (token: FoobarCloudSyncToken) => token === generation,
	};
}
