import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { env } from "cloudflare:workers";

import { SITE_TITLE_APPEND } from "@/config";
import { Image } from "@/lib/components/Image";
import { ViewsCounter } from "@/lib/components/ViewsCounter";
import { type KeebDetails } from "@/lib/domains/Imgur";
import { getKeebsFromNotion, type KeebDetailsFromNotion } from "@/lib/domains/keebs";
import { canonicalUrl, defaultOgImageUrl } from "@/lib/seo";
import { STATIC_SERVER_FUNCTION_STALE_TIME } from "@/lib/static-server-functions";

export const Route = createFileRoute("/(main)/keebs")({
	component: KeebsPage,
	staleTime: STATIC_SERVER_FUNCTION_STALE_TIME,
	loader: () => getKeebsRenderable(),
	head: () => ({
		links: [{ rel: "canonical", href: canonicalUrl("/keebs") }],
		meta: (() => {
			const title = `Keebs ${SITE_TITLE_APPEND}`;
			const description = "A collection of my mechanical keyboards";
			const canonical = canonicalUrl("/keebs");
			const ogImage = defaultOgImageUrl();

			return [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: canonical },
				{ property: "og:image", content: ogImage },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			];
		})(),
	}),
});

const getKeebsRenderable = createServerFn({ method: "GET" })
	.middleware([staticFunctionMiddleware])
	.handler(async () => {
		const keebs = await getKeebsFromNotion(env);
		const Renderable = await renderServerComponent(<KeebsList keebs={keebs} />);

		return { Renderable };
	});

function KeebsPage() {
	const { Renderable } = Route.useLoaderData();

	return (
		<>
			<h1 className="pt-10 pb-20 font-serif text-8xl font-bold">/keebs</h1>
			{Renderable}
			<ViewsCounter />
		</>
	);
}

function KeebsList({ keebs }: { keebs: Array<KeebDetails | KeebDetailsFromNotion> }) {
	return (
		<>
			{keebs.length === 0 ? (
				<p className="pb-8">Keyboard data is temporarily unavailable in this preview deployment.</p>
			) : null}

			<section className="grid gap-16">
				{keebs.map(({ name, tags, image }) => (
					<article key={name.toLowerCase().replace(" ", "-")} className="grid gap-4">
						<div className="grid grid-flow-col items-center justify-between gap-8">
							<h3 className="pt-0 font-serif text-3xl font-medium tracking-tight">{name}</h3>
							<span className="flex gap-2">
								{tags.map((tag) => (
									<span
										key={tag.name}
										className="rounded-global bg-primary px-2 py-0 font-mono text-sm text-background"
									>
										{tag.name}
									</span>
								))}
							</span>
						</div>
						{image.url ? (
							"height" in image ? (
								<Image src={image.url} alt={name} height={image.height} width={image.width} />
							) : (
								<Image src={image.url} alt={name} />
							)
						) : null}
					</article>
				))}
			</section>
		</>
	);
}
