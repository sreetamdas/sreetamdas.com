/**
 * Request-scoped Better Auth lookup kept in a server-only module so the Foobar
 * client bundle never imports auth configuration or Cloudflare bindings.
 */
import "@tanstack/react-start/server-only";
import { getRequestHeader } from "@tanstack/react-start/server";

export type FoobarAuthUser = { id: string; name: string };

export async function getFoobarAuthUser(): Promise<FoobarAuthUser | null> {
	const cookie = getRequestHeader("cookie");
	if (!cookie) return null;
	const { ensureFoobarE2eUser } = await import("./cloud-progress.e2e.server");
	const e2eUser = await ensureFoobarE2eUser(cookie);
	if (e2eUser) return e2eUser;

	const headers = new Headers({ cookie });
	const { getAuth } = await import("@/lib/auth");
	const session = await getAuth().api.getSession({ headers });
	return session?.user ? { id: session.user.id, name: session.user.name } : null;
}
