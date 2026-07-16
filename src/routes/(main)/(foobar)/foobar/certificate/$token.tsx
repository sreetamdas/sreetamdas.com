/** Public, bearer-token completion certificate and social-sharing surface. */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import {
	createFoobarCertificateHead,
	formatFoobarCertificateDate,
} from "@/lib/domains/foobar/certificate";
import { fetchFoobarCertificateServerFn } from "@/lib/domains/foobar/certificate.server";
import { CertificateShare } from "@/lib/domains/foobar/CertificateShare";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/(main)/(foobar)/foobar/certificate/$token")({
	component: FoobarCertificatePage,
	loader: async ({ params }) => {
		const certificate = await fetchFoobarCertificateServerFn({ data: { token: params.token } });
		if (!certificate) throw notFound();
		return certificate;
	},
	head: ({ loaderData }) => (loaderData ? createFoobarCertificateHead(loaderData) : {}),
	notFoundComponent: () => (
		<section className="py-20 text-center">
			<h1 className="font-serif text-5xl font-bold">Certificate not found</h1>
			<p className="mt-4 text-foreground/70">This field record does not exist.</p>
		</section>
	),
});

function FoobarCertificatePage() {
	const certificate = Route.useLoaderData();
	const date = formatFoobarCertificateDate(certificate.completedAt);
	const url = absoluteUrl(`/foobar/certificate/${certificate.certificateId}`);

	return (
		<section className="mx-auto max-w-4xl py-14 sm:py-20">
			<div className="relative overflow-hidden rounded-global border border-secondary/35 bg-foreground px-6 py-10 text-background shadow-2xl sm:px-12 sm:py-14">
				<p className="font-mono text-xs tracking-[0.2em] text-background/60 uppercase">
					Foobar field certificate
				</p>
				<p className="mt-16 text-sm tracking-widest text-background/60 uppercase">Certifies that</p>
				<h1 className="mt-3 font-serif text-5xl leading-none font-bold text-balance sm:text-7xl">
					{certificate.name}
				</h1>
				<p className="mt-6 max-w-2xl text-lg text-background/80 sm:text-2xl">
					mapped every hidden corner and completed the Foobar hunt.
				</p>
				<div className="mt-16 flex flex-wrap items-end justify-between gap-6 border-t border-background/20 pt-6">
					<div>
						<p className="font-mono text-xs text-background/50 uppercase">Completed</p>
						<time
							className="mt-1 block font-serif text-xl"
							dateTime={new Date(certificate.completedAt).toISOString()}
						>
							{date}
						</time>
					</div>
					<span
						aria-hidden="true"
						className="grid size-16 place-items-center rounded-full border-2 border-secondary font-serif text-3xl text-secondary"
					>
						F
					</span>
				</div>
			</div>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<CertificateShare title={`${certificate.name} completed Foobar`} url={url} />
				<Link
					className="text-sm underline decoration-foreground/30 underline-offset-4"
					to="/foobar"
				>
					Return to the hunt
				</Link>
			</div>
		</section>
	);
}
