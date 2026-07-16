/** Public certificate lookup exposed as a read-only server function. */
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";

import type { FoobarCertificate } from "./certificate";

export const fetchFoobarCertificateServerFn = createServerFn({ method: "GET" })
	.validator((value) => ({ token: readCertificateToken(value) }))
	.handler(async ({ data }) => fetchFoobarCertificateFromDb(data.token));

const fetchFoobarCertificateFromDb = createServerOnlyFn(
	async (token: string): Promise<FoobarCertificate | null> => {
		try {
			const [{ getDb }, { getFoobarCertificate }] = await Promise.all([
				import("@/db"),
				import("./cloud-progress.data.server"),
			]);
			return await getFoobarCertificate(getDb(), token);
		} catch {
			return null;
		}
	},
);

function readCertificateToken(value: unknown): string {
	if (
		typeof value !== "object" ||
		value === null ||
		!("token" in value) ||
		typeof value.token !== "string" ||
		!/^[-_a-zA-Z0-9]{1,80}$/.test(value.token)
	) {
		throw new Error("Invalid Foobar certificate token");
	}
	return value.token;
}
