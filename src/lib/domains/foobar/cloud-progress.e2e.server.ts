/** CI-only authenticated Foobar fixture. Production builds statically disable it. */
import "@tanstack/react-start/server-only";
import { IS_CI } from "@/config";

import type { FoobarAuthUser } from "./cloud-progress.request.server";

const E2E_COOKIE = "foobar-e2e-auth=enabled";
const E2E_USER = { id: "foobar-e2e-user", name: "Foobar E2E Hunter" };

export function readFoobarE2eUser(cookie: string, enabled = IS_CI): FoobarAuthUser | null {
	if (!enabled || !cookie.split(";").some((part) => part.trim() === E2E_COOKIE)) return null;
	return E2E_USER;
}

export async function ensureFoobarE2eUser(cookie: string): Promise<FoobarAuthUser | null> {
	const user = readFoobarE2eUser(cookie);
	if (!user) return null;

	const [{ getDb }, { authUser }] = await Promise.all([import("@/db"), import("@/db/schema")]);
	const now = new Date();
	await getDb()
		.insert(authUser)
		.values({
			...user,
			email: "foobar-e2e@example.invalid",
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: authUser.id,
			set: { name: user.name, updatedAt: now },
		});
	return user;
}
