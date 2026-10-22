/** Token check and D1 lookup shared by the certificate's PNG card and terminal text. */
import { type FoobarCertificate } from "./certificate";

export const FOOBAR_CERTIFICATE_TOKEN = /^[a-zA-Z0-9_-]{1,80}$/;

export type FoobarCertificateResolver = (token: string) => Promise<FoobarCertificate | null>;

export async function resolveFoobarCertificate(token: string): Promise<FoobarCertificate | null> {
	try {
		const [{ getDb }, { getFoobarCertificate }] = await Promise.all([
			import("@/db"),
			import("./cloud-progress.data.server"),
		]);
		return await getFoobarCertificate(getDb(), token);
	} catch {
		return null;
	}
}
