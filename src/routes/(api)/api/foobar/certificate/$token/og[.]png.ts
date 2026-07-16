/**
 * Public, cacheable PNG card for a completed hunter. Certificate IDs are
 * unguessable bearer tokens; no account details beyond the chosen display name
 * and completion date are rendered.
 */
import { createFileRoute } from "@tanstack/react-router";

import {
	type FoobarCertificate,
	formatFoobarCertificateDate,
} from "@/lib/domains/foobar/certificate";

type CertificateResolver = (token: string) => Promise<FoobarCertificate | null>;
type CertificateRenderer = (html: string) => Promise<Response> | Response;

export async function handleFoobarCertificateImage(
	token: string,
	resolve: CertificateResolver = resolveCertificate,
	render: CertificateRenderer = renderCertificate,
): Promise<Response> {
	if (!/^[a-zA-Z0-9_-]{1,80}$/.test(token)) return new Response("Not found", { status: 404 });

	const certificate = await resolve(token);
	if (!certificate) return new Response("Not found", { status: 404 });

	const date = formatFoobarCertificateDate(certificate.completedAt);
	const html = `<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%;height:100%;padding:72px;background:#17131f;color:#f3edf7;font-family:Bitter">
		<div style="display:flex;justify-content:space-between;align-items:center;font-size:24px;color:#c8b8d8"><span>SREETAMDAS.COM</span><span>FOOBAR FIELD CERTIFICATE</span></div>
		<div style="display:flex;flex-direction:column;gap:18px"><div style="display:flex;font-size:30px;color:#a999b8">CERTIFIES THAT</div><div style="display:flex;font-size:76px;font-weight:600">${escapeHtml(certificate.name)}</div><div style="display:flex;font-size:34px;line-height:1.35;max-width:900px">mapped every hidden corner and completed the Foobar hunt.</div></div>
		<div style="display:flex;justify-content:space-between;align-items:flex-end"><div style="display:flex;font-size:24px;color:#c8b8d8">COMPLETED ${escapeHtml(date).toUpperCase()}</div><div style="display:flex;width:84px;height:84px;border:3px solid #c99be8;border-radius:999px;align-items:center;justify-content:center;font-size:40px">F</div></div>
	</div>`;
	const response = await render(html);
	response.headers.set("Content-Type", "image/png");
	response.headers.set("Cache-Control", "public, max-age=86400, immutable");
	return response;
}

async function resolveCertificate(token: string): Promise<FoobarCertificate | null> {
	try {
		const [{ getDb }, { getFoobarCertificate }] = await Promise.all([
			import("@/db"),
			import("@/lib/domains/foobar/cloud-progress.data.server"),
		]);
		return await getFoobarCertificate(getDb(), token);
	} catch {
		return null;
	}
}

async function renderCertificate(html: string): Promise<Response> {
	const { ImageResponse } = await import("workers-og");
	return new ImageResponse(html, { width: 1200, height: 630 });
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

export const Route = createFileRoute("/(api)/api/foobar/certificate/$token/og.png")({
	server: {
		handlers: {
			GET: ({ params }) => handleFoobarCertificateImage(params.token),
		},
	},
});
