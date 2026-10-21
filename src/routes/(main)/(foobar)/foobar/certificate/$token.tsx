/**
 * Public, bearer-token completion certificate and social-sharing surface, drawn
 * like the dashboard: the fully lit mountain with each discovery's real star.
 */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { SITE_TITLE_APPEND } from "@/config";
import { NotFound404 } from "@/lib/components/Error";
import { Bracketed } from "@/lib/domains/foobar/Bracketed";
import { FOOBAR_ACHIEVEMENT_ORDER } from "@/lib/domains/foobar/catalog";
import {
	createFoobarCertificateHead,
	formatFoobarCertificateDate,
} from "@/lib/domains/foobar/certificate";
import { fetchFoobarCertificateServerFn } from "@/lib/domains/foobar/certificate.server";
import { CertificateShare } from "@/lib/domains/foobar/CertificateShare";
import { FOOBAR_GLOW_CLASS } from "@/lib/domains/foobar/karma";
import { FoobarMountainArt, FoobarTierWords } from "@/lib/domains/foobar/MountainArt";
import { FoobarNotFoundAward } from "@/lib/domains/foobar/Pixel";
import { useFoobarKarma } from "@/lib/domains/foobar/useFoobarKarma";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/(main)/(foobar)/foobar/certificate/$token")({
	component: FoobarCertificatePage,
	loader: async ({ params }) => {
		const certificate = await fetchFoobarCertificateServerFn({ data: { token: params.token } });
		if (!certificate) throw notFound();
		return certificate;
	},
	head: ({ loaderData }) =>
		loaderData
			? createFoobarCertificateHead(loaderData)
			: { meta: [{ title: `Page not found ${SITE_TITLE_APPEND}` }] },
	notFoundComponent: FoobarCertificateNotFound,
});

function FoobarCertificatePage() {
	useFoobarKarma();
	const certificate = Route.useLoaderData();
	const date = formatFoobarCertificateDate(certificate.completedAt);
	const url = absoluteUrl(`/foobar/certificate/${certificate.certificateId}`);
	const completed = FOOBAR_ACHIEVEMENT_ORDER.filter(
		(achievement) => achievement in certificate.stars,
	);
	const starValues = Object.values(certificate.stars);
	const gold = starValues.filter((star) => star === "gold").length;
	const silver = starValues.filter((star) => star === "silver").length;

	return (
		<section className="py-12 font-mono text-sm leading-relaxed text-foreground/75 [font-variant-ligatures:none] sm:py-16">
			<p className="text-karma-comment">--- Foobar field certificate ---</p>
			<p className="mt-8">Certifies that</p>
			<h1 className="mt-1 text-4xl font-bold break-words text-karma-green [text-shadow:0_0_2px_currentColor,0_0_12px_rgb(123_216_143/0.55)] sm:text-5xl">
				{certificate.name}
			</h1>
			<p className="mt-3 max-w-[56ch] text-foreground">
				mapped every hidden corner and completed the Foobar hunt.
			</p>
			<FoobarTierWords className="mt-3" completed={completed} />
			<p className="mt-4">
				<span className={`text-karma-yellow ${FOOBAR_GLOW_CLASS}`}>{completed.length}*</span>
				<span className="text-karma-comment"> · </span>
				<span className="text-karma-yellow">{gold} gold</span>
				<span className="text-karma-comment"> · </span>
				<span className="text-karma-silver">{silver} silver</span>
			</p>
			<div className="mt-6">
				<FoobarMountainArt completed={completed} stars={certificate.stars} />
			</div>
			<p className="mt-4">
				Completed{" "}
				<time
					className="text-foreground"
					dateTime={new Date(certificate.completedAt).toISOString()}
				>
					{date}
				</time>
			</p>

			<div className="mt-8 flex flex-wrap items-center gap-x-[2ch] gap-y-2">
				<CertificateShare title={`${certificate.name} completed Foobar`} url={url} />
				<Link
					className="inline-flex min-h-11 items-center text-karma-green hover:[text-shadow:0_0_6px_currentColor] focus-visible:outline-2 focus-visible:outline-karma-yellow"
					to="/foobar"
				>
					<Bracketed>Return to the hunt</Bracketed>
				</Link>
			</div>
		</section>
	);
}

function FoobarCertificateNotFound() {
	useFoobarKarma();
	return (
		<>
			<NotFound404 message="This field record does not exist." />
			<FoobarNotFoundAward />
		</>
	);
}
